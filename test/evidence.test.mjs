import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import {
  appendEvidenceLog,
  createEvidenceStore,
  evidenceHash,
  persistEvidence,
  readEvidence,
  redactEvidence,
  scanForSecrets
} from '../src/evidence/index.mjs';

const syntheticInput = (correlationId = 'corr-synthetic-1') => ({
  correlationId,
  event: 'collection-result',
  result: {
    sku: 'SYNTHETIC-1',
    status: 'collected',
    productName: 'Synthetic Sneaker',
    salePrice: '599',
    token: 'discarded-before-persistence',
    rawResponse: '{"not":"persisted"}'
  },
  cookie: 'discarded-before-persistence',
  rawPayload: '{"not":"persisted"}'
});

const withStore = async (run) => {
  const directory = await mkdtemp(join(tmpdir(), 'dewu-evidence-test-'));
  try {
    await run(createEvidenceStore(directory), directory);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
};

test('allowlist-first redaction removes raw payloads and secret-shaped keys', () => {
  assert.deepEqual(redactEvidence(syntheticInput()), {
    correlationId: 'corr-synthetic-1',
    event: 'collection-result',
    result: {
      sku: 'SYNTHETIC-1',
      status: 'collected',
      productName: 'Synthetic Sneaker',
      salePrice: '599'
    }
  });
});

test('deterministic hashes trace the persisted redacted record', async () => {
  await withStore(async (store) => {
    const persisted = await persistEvidence(store, syntheticInput());
    assert.equal(persisted.evidenceHash, evidenceHash(redactEvidence(syntheticInput())));
    assert.deepEqual(await readEvidence(store, 'corr-synthetic-1'), persisted);
  });
});

test('atomic record persistence leaves no temporary file after successful or failed rename', async () => {
  await withStore(async (store, directory) => {
    await persistEvidence(store, syntheticInput());
    await mkdir(join(directory, 'records', 'corr-failure.json'));
    await assert.rejects(persistEvidence(store, syntheticInput('corr-failure')));
    const recordFiles = await readdir(join(directory, 'records'));
    assert.deepEqual(recordFiles.sort(), ['corr-failure.json', 'corr-synthetic-1.json']);
    assert.equal(recordFiles.some((file) => file.endsWith('.tmp')), false);
  });
});

test('JSONL persistence appends only redacted records atomically', async () => {
  await withStore(async (store, directory) => {
    await appendEvidenceLog(store, syntheticInput('corr-synthetic-1'));
    await appendEvidenceLog(store, syntheticInput('corr-synthetic-2'));
    const lines = (await readFile(join(directory, 'evidence.jsonl'), 'utf8')).trim().split('\n').map(JSON.parse);
    assert.deepEqual(lines.map(({ correlationId }) => correlationId), ['corr-synthetic-1', 'corr-synthetic-2']);
    assert.equal(JSON.stringify(lines).includes('rawPayload'), false);
    assert.equal(JSON.stringify(lines).includes('discarded-before-persistence'), false);
  });
});

test('secret patterns and unsafe targets are rejected before persistence', async () => {
  assert.throws(() => scanForSecrets({ authorization: 'Bearer synthetic-secret' }), /EVIDENCE_SECRET/);
  assert.throws(() => redactEvidence({ correlationId: '../escape', event: 'collection-result' }), /EVIDENCE_CORRELATION_ID_UNSAFE/);
  await withStore(async (store) => {
    await assert.rejects(
      persistEvidence(store, { correlationId: 'corr-secret', event: 'collection-result', result: { sku: 'SYNTHETIC', productName: 'Bearer secret' } }),
      /EVIDENCE_SECRET/
    );
  });
});
