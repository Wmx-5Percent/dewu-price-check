import { createFailClosedRpcExports } from '../../src/frida/index.mjs';
import { mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { appendEvidenceLog, persistEvidence, scanForSecrets } from '../../src/evidence/index.mjs';
import { createExceptionRow, writeExportWorkbook } from '../../src/export/index.mjs';
import { createJobState, readExcelInput, runJobs } from '../../src/jobs/index.mjs';
import { ERROR_CODES, GLOBAL_BLOCKER_CODES } from '../../shared/contracts/error-codes.mjs';

const blocked = (errorCode) => ({ type: 'blocked', errorCode });

const failClosedAgent = () => {
  const rpc = createFailClosedRpcExports();
  return Object.freeze({
    health: rpc.health,
    searchBySku: rpc.searchbysku,
    getProduct: rpc.getproduct,
    getQuotes: rpc.getquotes
  });
};

const isReady = (result) => result?.status === 'ready' && result.errorCode === null && result.data && typeof result.data === 'object';

const errorCodeFor = (result) => GLOBAL_BLOCKER_CODES.has(result?.errorCode) ? result.errorCode : ERROR_CODES.SCHEMA_DRIFT;

const assertSafe = (value) => {
  try {
    scanForSecrets(value);
    return true;
  } catch {
    return false;
  }
};

const exportRowsFor = ({ sku, product, quotes }) => quotes.map((quote) => {
  if (quote.status === 'no_quote') {
    return createExceptionRow({ sku, note: '无报价' });
  }
  return {
    '货号': sku,
    '得物商品名': product.name,
    '得物显示尺码': quote.size,
    '得物卖价（元）': quote.price,
    '总销量': product.totalSales,
    '异常或人工复核说明': ''
  };
});

const collectOneSkuUnsafe = async ({ sku, agent, evidenceStore, rowsBySku }) => {
  const search = await agent.searchBySku({ sku, sort: 'sales_desc' });
  if (!isReady(search)) return blocked(errorCodeFor(search));
  if (search.data.sort !== 'sales_desc' || search.data.responseItemIndex !== 1 || !search.data.item?.productId || !assertSafe(search.data)) {
    return blocked(ERROR_CODES.SCHEMA_DRIFT);
  }

  const product = await agent.getProduct({ productId: search.data.item.productId });
  if (!isReady(product) || !assertSafe(product.data) || product.data.productId !== search.data.item.productId) return blocked(errorCodeFor(product));

  const quotes = await agent.getQuotes({ productId: product.data.productId });
  if (!isReady(quotes) || quotes.data.pagination?.complete !== true || !Array.isArray(quotes.data.quotes) || !assertSafe(quotes.data)) {
    return blocked(errorCodeFor(quotes));
  }

  const evidence = {
    correlationId: quotes.data.correlationId,
    event: 'collection-result',
    result: {
      sku,
      status: 'collected',
      productId: product.data.productId,
      productName: product.data.name,
      salesCount: product.data.totalSales,
      reviewNote: ''
    }
  };
  try {
    await persistEvidence(evidenceStore, evidence);
    await appendEvidenceLog(evidenceStore, evidence);
  } catch {
    return blocked(ERROR_CODES.SCHEMA_DRIFT);
  }

  rowsBySku.set(sku, exportRowsFor({ sku, product: product.data, quotes: quotes.data.quotes }));
  return { type: 'collected' };
};

const collectOneSku = async (options) => {
  try {
    return await collectOneSkuUnsafe(options);
  } catch {
    return blocked(ERROR_CODES.SCHEMA_DRIFT);
  }
};

const healthError = async (agent) => {
  try {
    const health = await agent.health();
    if (health?.data?.status === 'ready' && health.data.errorCode === null) return null;
    return errorCodeFor(health?.data?.errorCode ? { errorCode: health.data.errorCode } : health);
  } catch {
    return ERROR_CODES.FRIDA_DISCONNECTED;
  }
};

const deviceBindingError = async (agent, device) => {
  if (device === null || device === undefined) return null;
  if (typeof device !== 'string' || device.trim().length === 0) return ERROR_CODES.EMULATOR_UNAVAILABLE;
  if (typeof agent?.bindDevice !== 'function') return ERROR_CODES.EMULATOR_UNAVAILABLE;
  try {
    const binding = await agent.bindDevice({ device });
    return isReady(binding) && binding.data.device === device ? null : ERROR_CODES.EMULATOR_UNAVAILABLE;
  } catch {
    return ERROR_CODES.EMULATOR_UNAVAILABLE;
  }
};

export const runCollection = async ({
  inputPath,
  checkpointPath,
  evidenceStore,
  outputPath,
  agent = failClosedAgent(),
  device = null,
  maxConcurrency = 4,
  maxAttempts = 2
}) => {
  const bindingBlocker = await deviceBindingError(agent, device);
  if (bindingBlocker) return Object.freeze({ status: 'blocked', errorCode: bindingBlocker, output: null, state: null });
  const earlyBlocker = await healthError(agent);
  if (earlyBlocker) return Object.freeze({ status: 'blocked', errorCode: earlyBlocker, output: null, state: null });

  const records = await readExcelInput(inputPath);
  const state = createJobState(records, { maxConcurrency, maxAttempts });
  const rowsBySku = new Map();
  await runJobs({
    state,
    checkpointPath,
    processTask: async (sku) => collectOneSku({ sku, agent, evidenceStore, rowsBySku })
  });

  if (state.blocked) {
    const blockedTask = state.tasks.find((task) => task.status === 'blocked');
    return Object.freeze({ status: 'blocked', errorCode: blockedTask?.errorCode ?? ERROR_CODES.SCHEMA_DRIFT, output: null, state });
  }

  const rows = state.tasks.flatMap((task) => rowsBySku.get(task.sku) ?? []);
  await mkdir(dirname(outputPath), { recursive: true });
  const output = await writeExportWorkbook({ rows, outputPath });
  return Object.freeze({ status: 'ready', errorCode: null, output, state });
};

export const createFailClosedIntegration = () => Object.freeze({ runCollection });
