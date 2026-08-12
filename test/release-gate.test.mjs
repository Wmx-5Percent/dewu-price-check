import assert from 'node:assert/strict';
import { access, mkdtemp, rm } from 'node:fs/promises';
import { performance } from 'node:perf_hooks';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import ExcelJS from 'exceljs';
import { createEvidenceStore } from '../src/evidence/index.mjs';
import { verifyExportWorkbook } from '../src/export/index.mjs';
import { runCollection } from '../src/integration/index.mjs';

const ready = (data) => ({ status: 'ready', errorCode: null, data });

const fixtureAgent = {
  async bindDevice({ device }) { return ready({ device }); },
  async health() { return ready({ status: 'ready', errorCode: null }); },
  async searchBySku({ sku, sort }) {
    assert.equal(sort, 'sales_desc');
    return ready({ correlationId: `search-${sku}`, sort, responseItemIndex: 1, item: { productId: `product-${sku}`, name: 'Synthetic product' } });
  },
  async getProduct({ productId }) { return ready({ correlationId: `product-${productId}`, productId, name: 'Synthetic product', totalSales: '1000+' }); },
  async getQuotes({ productId }) {
    return ready({
      correlationId: `quotes-${productId}`,
      quotes: [{ size: '42', price: '599', status: 'quoted', variantId: `variant-${productId}` }],
      pagination: { complete: true }
    });
  }
};

const withTemporaryDirectory = async (run) => {
  const directory = await mkdtemp(join(tmpdir(), 'dewu-release-gate-'));
  try {
    await run(directory);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
};

const createInput = async (inputPath, skus) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Synthetic');
  sheet.addRow(['sku']);
  skus.forEach((sku) => sheet.addRow([sku]));
  await workbook.xlsx.writeFile(inputPath);
};

test('fixture release path produces a strict, reopenable six-column workbook for 50 SKUs within the synthetic performance gate', async () => {
  await withTemporaryDirectory(async (directory) => {
    const inputPath = join(directory, 'input.xlsx');
    const outputPath = join(directory, 'output.xlsx');
    const checkpointPath = join(directory, 'state', 'checkpoint.json');
    const skus = Array.from({ length: 50 }, (_, index) => `SYNTHETIC-${index + 1}`);
    await createInput(inputPath, skus);

    const started = performance.now();
    const result = await runCollection({
      inputPath,
      outputPath,
      checkpointPath,
      evidenceStore: createEvidenceStore(join(directory, 'evidence')),
      agent: fixtureAgent,
      device: 'emulator-5554'
    });
    const elapsedMs = performance.now() - started;

    assert.equal(result.status, 'ready');
    assert.equal(result.state.baseline, 50);
    assert.deepEqual(result.output, { rows: 50, worksheetName: '得物结果' });
    assert.deepEqual(await verifyExportWorkbook(outputPath), { rows: 50, worksheetName: '得物结果' });
    assert.ok(elapsedMs < 5_000, `synthetic 50-SKU run took ${elapsedMs.toFixed(0)}ms`);
  });
});

test('secret-shaped fixture response is a global blocker and never emits a workbook', async () => {
  await withTemporaryDirectory(async (directory) => {
    const inputPath = join(directory, 'input.xlsx');
    const outputPath = join(directory, 'output.xlsx');
    await createInput(inputPath, ['SYNTHETIC-SECRET']);
    const secretAgent = {
      ...fixtureAgent,
      async searchBySku({ sku, sort }) {
        const result = await fixtureAgent.searchBySku({ sku, sort });
        return ready({ ...result.data, metadata: { authorization: 'Bearer synthetic-secret' } });
      }
    };

    const result = await runCollection({
      inputPath,
      outputPath,
      checkpointPath: join(directory, 'state', 'checkpoint.json'),
      evidenceStore: createEvidenceStore(join(directory, 'evidence')),
      agent: secretAgent,
      device: 'emulator-5554'
    });

    assert.equal(result.status, 'blocked');
    assert.equal(result.errorCode, 'SCHEMA_DRIFT');
    assert.equal(result.state.blocked, true);
    await assert.rejects(access(outputPath));
  });
});

test('a fresh jobs-module instance resumes a persisted checkpoint without repeating completed synthetic work', async () => {
  await withTemporaryDirectory(async (directory) => {
    const checkpointPath = join(directory, 'state', 'checkpoint.json');
    const moduleUrl = new URL('../src/jobs/index.mjs', import.meta.url);
    const firstProcess = await import(`${moduleUrl.href}?release-gate-first=${Date.now()}`);
    const state = firstProcess.createJobState([{ sku: 'SYNTHETIC-DONE' }, { sku: 'SYNTHETIC-RETRY' }], { maxConcurrency: 1, maxAttempts: 2 });
    firstProcess.applyTaskResult(state, 'SYNTHETIC-DONE', { type: 'collected' });
    firstProcess.applyTaskResult(state, 'SYNTHETIC-RETRY', { type: 'retryable', errorCode: 'FRIDA_DISCONNECTED' });
    await firstProcess.writeCheckpoint(checkpointPath, state);

    const restartedProcess = await import(`${moduleUrl.href}?release-gate-restart=${Date.now()}`);
    const resumedState = await restartedProcess.readCheckpoint(checkpointPath);
    const calls = [];
    await restartedProcess.runJobs({
      state: resumedState,
      checkpointPath,
      processTask: async (sku, attempt) => {
        calls.push(`${sku}:${attempt}`);
        return { type: 'collected' };
      }
    });

    assert.deepEqual(calls, ['SYNTHETIC-RETRY:2']);
    assert.deepEqual((await restartedProcess.readCheckpoint(checkpointPath)).tasks.map(({ sku, status, attempts }) => ({ sku, status, attempts })), [
      { sku: 'SYNTHETIC-DONE', status: 'collected', attempts: 1 },
      { sku: 'SYNTHETIC-RETRY', status: 'collected', attempts: 2 }
    ]);
  });
});
