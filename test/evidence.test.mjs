import assert from 'node:assert/strict';
import { lstat, mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
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

test('records directory symlinks are rejected without an out-of-store write', async () => {
  await withStore(async (store, directory) => {
    const outsideDirectory = await mkdtemp(join(tmpdir(), 'dewu-evidence-outside-'));
    try {
      await symlink(outsideDirectory, join(directory, 'records'));
      await assert.rejects(persistEvidence(store, syntheticInput('corr-symlink')), /EVIDENCE_RECORDS_DIRECTORY_UNSAFE/);
      assert.deepEqual(await readdir(outsideDirectory), []);
    } finally {
      await rm(outsideDirectory, { recursive: true, force: true });
    }
  });
});

test('twenty concurrent JSONL appends preserve every synthetic record', async () => {
  await withStore(async (store, directory) => {
    await Promise.all(Array.from(
      { length: 20 },
      (_, index) => appendEvidenceLog(store, syntheticInput(`corr-concurrent-${index + 1}`))
    ));
    const lines = (await readFile(join(directory, 'evidence.jsonl'), 'utf8')).trim().split('\n').map(JSON.parse);
    assert.equal(lines.length, 20);
    assert.deepEqual(new Set(lines.map(({ correlationId }) => correlationId)).size, 20);
  });
});

test('absolute JSONL and relative record-file symlinks are rejected without external access or store contamination', async () => {
  await withStore(async (store, directory) => {
    const outsideDirectory = await mkdtemp(join(tmpdir(), 'dewu-evidence-outside-file-'));
    const outsideLogPath = join(outsideDirectory, 'outside.jsonl');
    const outsideRecordPath = join(outsideDirectory, 'outside-record.json');
    const jsonlLinkPath = join(directory, 'evidence.jsonl');
    const recordsPath = join(directory, 'records');
    const recordLinkPath = join(recordsPath, 'corr-file-link.json');
    try {
      await writeFile(outsideLogPath, 'outside-jsonl-only\n', 'utf8');
      await writeFile(outsideRecordPath, '{"source":"outside"}\n', 'utf8');
      await symlink(outsideLogPath, jsonlLinkPath);
      await mkdir(recordsPath);
      await symlink(relative(recordsPath, outsideRecordPath), recordLinkPath);

      await assert.rejects(appendEvidenceLog(store, syntheticInput('corr-jsonl-link')), /EVIDENCE_FILE_TARGET_UNSAFE/);
      await assert.rejects(persistEvidence(store, syntheticInput('corr-file-link')), /EVIDENCE_FILE_TARGET_UNSAFE/);
      await assert.rejects(readEvidence(store, 'corr-file-link'), /EVIDENCE_FILE_TARGET_UNSAFE/);

      assert.equal(await readFile(outsideLogPath, 'utf8'), 'outside-jsonl-only\n');
      assert.equal(await readFile(outsideRecordPath, 'utf8'), '{"source":"outside"}\n');
      assert.equal((await lstat(jsonlLinkPath)).isSymbolicLink(), true);
      assert.equal((await lstat(recordLinkPath)).isSymbolicLink(), true);
    } finally {
      await rm(outsideDirectory, { recursive: true, force: true });
    }
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
