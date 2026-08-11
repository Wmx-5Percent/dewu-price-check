import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import ExcelJS from 'exceljs';

const CONCURRENCY_STEPS = [1, 2, 4];

const normalizeSku = (value) => String(value ?? '').trim().toUpperCase();

export const readExcelInput = async (inputPath) => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(inputPath);
  const worksheet = workbook.worksheets[0];
  if (!worksheet) throw new Error('INPUT_WORKSHEET_MISSING');

  const headers = worksheet.getRow(1).values;
  const skuColumn = headers.findIndex((header) => normalizeSku(header).toLowerCase() === 'sku');
  if (skuColumn < 1) throw new Error('INPUT_SKU_COLUMN_MISSING');

  return worksheet.getColumn(skuColumn).values.slice(2)
    .map((sku) => ({ sku: normalizeSku(sku) }))
    .filter(({ sku }) => sku.length > 0);
};

export const createJobState = (records, { maxConcurrency, maxAttempts }) => {
  if (!CONCURRENCY_STEPS.includes(maxConcurrency)) throw new Error('MAX_CONCURRENCY_INVALID');
  if (!Number.isInteger(maxAttempts) || maxAttempts < 1) throw new Error('MAX_ATTEMPTS_INVALID');

  const seen = new Set();
  const tasks = [];
  for (const record of records) {
    const sku = normalizeSku(record?.sku);
    if (!sku || seen.has(sku)) continue;
    seen.add(sku);
    tasks.push({ sku, status: 'pending', attempts: 0 });
  }

  return {
    baseline: tasks.length,
    concurrency: 1,
    maxConcurrency,
    maxAttempts,
    blocked: false,
    tasks
  };
};

export const nextConcurrency = ({ concurrency, maxConcurrency }) => {
  const next = CONCURRENCY_STEPS.find((step) => step > concurrency && step <= maxConcurrency);
  return next ?? concurrency;
};

export const applyTaskResult = (state, sku, result) => {
  const task = state.tasks.find((candidate) => candidate.sku === sku);
  if (!task) throw new Error('TASK_NOT_FOUND');
  if (state.blocked || task.status === 'collected' || task.status === 'blocked') return state;

  task.attempts += 1;
  if (result.type === 'collected') {
    task.status = 'collected';
    state.concurrency = nextConcurrency(state);
  } else if (result.type === 'blocked') {
    task.status = 'blocked';
    task.errorCode = result.errorCode;
    state.blocked = true;
  } else if (result.type === 'retryable') {
    task.errorCode = result.errorCode;
    task.status = task.attempts >= state.maxAttempts ? 'failed' : 'pending';
  } else {
    throw new Error('TASK_RESULT_INVALID');
  }
  return state;
};

export const writeCheckpoint = async (checkpointPath, state) => {
  await mkdir(dirname(checkpointPath), { recursive: true });
  const temporaryPath = `${checkpointPath}.tmp`;
  await writeFile(temporaryPath, JSON.stringify(state), 'utf8');
  await rename(temporaryPath, checkpointPath);
};

export const readCheckpoint = async (checkpointPath) => JSON.parse(await readFile(checkpointPath, 'utf8'));

export const runJobs = async ({ state, checkpointPath, processTask }) => {
  while (!state.blocked) {
    const pending = state.tasks.filter((task) => task.status === 'pending');
    if (pending.length === 0) break;

    const [task] = pending;
    const result = await processTask(task.sku, task.attempts + 1);
    applyTaskResult(state, task.sku, result);
    await writeCheckpoint(checkpointPath, state);
    if (state.blocked) break;
  }
  return state;
};
