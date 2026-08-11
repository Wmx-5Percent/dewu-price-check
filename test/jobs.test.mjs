import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';
import ExcelJS from 'exceljs';
import {
  applyTaskResult,
  createJobState,
  readExcelInput,
  readCheckpoint,
  runJobs
} from '../src/jobs/index.mjs';

const withCheckpoint = async (run) => {
  const directory = await mkdtemp(join(tmpdir(), 'dewu-jobs-test-'));
  try {
    await run(join(directory, 'checkpoint.json'));
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
};

test('dynamic baseline deduplicates input and advances only through configured concurrency', () => {
  const state = createJobState(
    [{ sku: 'synthetic-a' }, { sku: 'SYNTHETIC-A' }, { sku: ' SYNTHETIC-B ' }],
    { maxConcurrency: 4, maxAttempts: 2 }
  );
  assert.equal(state.baseline, 2);
  assert.deepEqual(state.tasks.map(({ sku }) => sku), ['SYNTHETIC-A', 'SYNTHETIC-B']);
  assert.equal(state.concurrency, 1);
  applyTaskResult(state, 'SYNTHETIC-A', { type: 'collected' });
  assert.equal(state.concurrency, 2);
  applyTaskResult(state, 'SYNTHETIC-B', { type: 'collected' });
  assert.equal(state.concurrency, 4);
});

test('Excel input reads only non-empty sku values from the first worksheet', async () => {
  await withCheckpoint(async (checkpointPath) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Synthetic');
    worksheet.addRow(['sku', 'ignored']);
    worksheet.addRow(['SYNTHETIC-INPUT', 'not an export']);
    worksheet.addRow(['', 'not a task']);
    const inputPath = join(dirname(checkpointPath), 'input.xlsx');
    await workbook.xlsx.writeFile(inputPath);
    assert.deepEqual(await readExcelInput(inputPath), [{ sku: 'SYNTHETIC-INPUT' }]);
  });
});

test('retry exhaustion persists a failed task atomically', async () => {
  await withCheckpoint(async (checkpointPath) => {
    const state = createJobState([{ sku: 'SYNTHETIC-RETRY' }], { maxConcurrency: 1, maxAttempts: 2 });
    await runJobs({
      state,
      checkpointPath,
      processTask: async () => ({ type: 'retryable', errorCode: 'TEMPORARY_FAILURE' })
    });
    const saved = await readCheckpoint(checkpointPath);
    assert.equal(saved.tasks[0].status, 'failed');
    assert.equal(saved.tasks[0].attempts, 2);
    assert.deepEqual(JSON.parse(await readFile(checkpointPath, 'utf8')), saved);
  });
});

test('resume skips collected work and stops remaining tasks after a global blocker', async () => {
  await withCheckpoint(async (checkpointPath) => {
    const state = createJobState(
      [{ sku: 'SYNTHETIC-DONE' }, { sku: 'SYNTHETIC-BLOCK' }, { sku: 'SYNTHETIC-LATER' }],
      { maxConcurrency: 1, maxAttempts: 1 }
    );
    await runJobs({
      state,
      checkpointPath,
      processTask: async (sku) => sku === 'SYNTHETIC-DONE'
        ? { type: 'collected' }
        : { type: 'blocked', errorCode: 'PROFILE_INCOMPATIBLE' }
    });
    const resumed = await readCheckpoint(checkpointPath);
    const processed = [];
    await runJobs({
      state: resumed,
      checkpointPath,
      processTask: async (sku) => {
        processed.push(sku);
        return { type: 'collected' };
      }
    });
    assert.deepEqual(processed, []);
    assert.deepEqual(resumed.tasks.map(({ sku, status }) => ({ sku, status })), [
      { sku: 'SYNTHETIC-DONE', status: 'collected' },
      { sku: 'SYNTHETIC-BLOCK', status: 'blocked' },
      { sku: 'SYNTHETIC-LATER', status: 'pending' }
    ]);
  });
});

test('a global blocker prevents later queued tasks from starting', async () => {
  await withCheckpoint(async (checkpointPath) => {
    const state = createJobState(
      [
        { sku: 'SYNTHETIC-FIRST' },
        { sku: 'SYNTHETIC-BLOCK' },
        { sku: 'SYNTHETIC-LATER' },
        { sku: 'SYNTHETIC-NEVER-CALLED' }
      ],
      { maxConcurrency: 4, maxAttempts: 1 }
    );
    const calls = [];
    await runJobs({
      state,
      checkpointPath,
      processTask: async (sku) => {
        calls.push(sku);
        return sku === 'SYNTHETIC-FIRST'
          ? { type: 'collected' }
          : { type: 'blocked', errorCode: 'PROFILE_INCOMPATIBLE' };
      }
    });
    assert.deepEqual(calls, ['SYNTHETIC-FIRST', 'SYNTHETIC-BLOCK']);
    assert.equal(state.tasks[2].status, 'pending');
    assert.equal(state.tasks[3].status, 'pending');
  });
});
