import assert from 'node:assert/strict';
import { access, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import ExcelJS from 'exceljs';
import { createEvidenceStore } from '../../src/evidence/index.mjs';
import { verifyExportWorkbook } from '../../src/export/index.mjs';
import { createLocalRunPaths, parseCliArguments, runCli } from '../cli/index.mjs';
import { runCollection } from './index.mjs';

const ready = (data) => ({ status: 'ready', errorCode: null, data });

const fixtureAgent = {
  async bindDevice({ device }) { return ready({ device }); },
  async health() { return ready({ status: 'ready', errorCode: null }); },
  async searchBySku({ sku, sort }) {
    assert.equal(sort, 'sales_desc');
    return ready({ correlationId: `search-${sku}`, sort, responseItemIndex: 1, item: { productId: `product-${sku}`, name: 'Synthetic result' } });
  },
  async getProduct({ productId }) { return ready({ correlationId: `product-${productId}`, productId, name: 'Synthetic result', totalSales: '1000+' }); },
  async getQuotes({ productId }) {
    return ready({
      correlationId: `quotes-${productId}`,
      quotes: [{ size: '42', price: '599', status: 'quoted', variantId: 'variant-synthetic' }, { size: '43', price: null, status: 'no_quote', variantId: 'variant-none' }],
      pagination: { complete: true }
    });
  }
};

const withFixtureRun = async (run) => {
  const directory = await mkdtemp(join(tmpdir(), 'dewu-integration-test-'));
  try {
    const inputPath = join(directory, 'input.xlsx');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Synthetic');
    worksheet.addRow(['sku']);
    worksheet.addRow(['synthetic-a']);
    worksheet.addRow(['SYNTHETIC-A']);
    worksheet.addRow(['synthetic-b']);
    await workbook.xlsx.writeFile(inputPath);
    await run({
      inputPath,
      checkpointPath: join(directory, 'state', 'checkpoint.json'),
      evidenceStore: createEvidenceStore(join(directory, 'evidence')),
      outputPath: join(directory, 'output.xlsx'),
      directory
    });
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
};

test('fixture integration composes public modules into safe six-column output', async () => {
  await withFixtureRun(async (paths) => {
    const result = await runCollection({ ...paths, agent: fixtureAgent });
    assert.equal(result.status, 'ready');
    assert.equal(result.state.baseline, 2);
    assert.deepEqual(result.output, { rows: 4, worksheetName: '得物结果' });
    assert.deepEqual(await verifyExportWorkbook(paths.outputPath), { rows: 4, worksheetName: '得物结果' });
  });
});

test('pending Profile blocks before inventory input or Excel output is read or written', async () => {
  await withFixtureRun(async (paths) => {
    const blockedAgent = { async health() { return ready({ status: 'blocked', errorCode: 'PROFILE_INCOMPATIBLE' }); } };
    const result = await runCollection({ ...paths, agent: blockedAgent });
    assert.deepEqual(result, { status: 'blocked', errorCode: 'PROFILE_INCOMPATIBLE', output: null, state: null });
    await assert.rejects(access(paths.outputPath));
  });
});

test('a requested device must bind through the Agent or fail closed', async () => {
  await withFixtureRun(async (paths) => {
    const bindings = [];
    const boundAgent = { ...fixtureAgent, async bindDevice({ device }) { bindings.push(device); return ready({ device }); } };
    const bound = await runCollection({ ...paths, agent: boundAgent, device: 'emulator-synthetic' });
    assert.equal(bound.status, 'ready');
    assert.deepEqual(bindings, ['emulator-synthetic']);

    const unboundAgent = { health: fixtureAgent.health, searchBySku: fixtureAgent.searchBySku, getProduct: fixtureAgent.getProduct, getQuotes: fixtureAgent.getQuotes };
    const rejected = await runCollection({ ...paths, agent: unboundAgent, device: 'emulator-synthetic' });
    assert.deepEqual(rejected, { status: 'blocked', errorCode: 'EMULATOR_UNAVAILABLE', output: null, state: null });
  });
});

test('schema drift blocks the full run and does not emit a partial workbook', async () => {
  await withFixtureRun(async (paths) => {
    const driftAgent = { ...fixtureAgent, async getQuotes() { return ready({ correlationId: 'quotes-drift', quotes: [], pagination: { complete: false } }); } };
    const result = await runCollection({ ...paths, agent: driftAgent });
    assert.equal(result.status, 'blocked');
    assert.equal(result.errorCode, 'SCHEMA_DRIFT');
    await assert.rejects(access(paths.outputPath));
  });
});

test('an Agent exception becomes a checkpointed global blocker without partial output', async () => {
  await withFixtureRun(async (paths) => {
    const disconnectedAgent = { ...fixtureAgent, async getProduct() { throw new Error('transport lost'); } };
    const result = await runCollection({ ...paths, agent: disconnectedAgent });
    assert.equal(result.status, 'blocked');
    assert.equal(result.errorCode, 'SCHEMA_DRIFT');
    assert.equal(result.state.blocked, true);
    await assert.rejects(access(paths.outputPath));
  });
});

test('CLI accepts only the versioned collect fields and returns a sanitized summary', async () => {
  assert.deepEqual(parseCliArguments(['collect', '--input', 'synthetic.xlsx', '--device', 'emulator-synthetic', '--run-id', 'run-synthetic']), {
    command: 'collect', input: 'synthetic.xlsx', device: 'emulator-synthetic', runId: 'run-synthetic'
  });
  assert.throws(() => parseCliArguments(['collect', '--input', 'synthetic.xlsx', '--ui-click']), /Unknown option/);
  assert.throws(() => createLocalRunPaths('../escape'), /CLI_RUN_ID_UNSAFE/);
  await withFixtureRun(async (paths) => {
    const result = await runCli({
      args: ['collect', '--input', paths.inputPath, '--device', 'emulator-synthetic', '--run-id', 'run-synthetic'],
      paths,
      agent: fixtureAgent
    });
    assert.deepEqual(result, {
      command: { command: 'collect', input: paths.inputPath, device: 'emulator-synthetic', runId: 'run-synthetic' },
      status: 'ready', errorCode: null, output: { rows: 4, worksheetName: '得物结果' }, baseline: 2
    });
  });
});

test('default local CLI paths create the outputs directory before a successful workbook write', async () => {
  await withFixtureRun(async (paths) => {
    const originalDirectory = process.cwd();
    process.chdir(paths.directory);
    try {
      const result = await runCli({ args: ['collect', '--input', paths.inputPath, '--run-id', 'default-output'], agent: fixtureAgent });
      assert.equal(result.status, 'ready');
      await access(join(paths.directory, 'outputs', 'dewu-default-output.xlsx'));
    } finally {
      process.chdir(originalDirectory);
    }
  });
});
