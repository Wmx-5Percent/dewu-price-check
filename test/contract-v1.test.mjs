import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import Ajv from 'ajv';

const loadSchema = async (name) => JSON.parse(await readFile(new URL(`../schemas/${name}`, import.meta.url)));

test('contract envelope accepts only v1 known kinds', async () => {
  const validate = new Ajv().compile(await loadSchema('contract-v1.schema.json'));
  assert.equal(validate({ contractVersion: 'v1', kind: 'cli-command', payload: {} }), true);
  assert.equal(validate({ contractVersion: 'v2', kind: 'cli-command', payload: {} }), false);
});

test('CLI contract exposes only approved command names', async () => {
  const validate = new Ajv().compile(await loadSchema('cli-command.schema.json'));
  assert.equal(validate({ command: 'collect', input: 'input.xlsx' }), true);
  assert.equal(validate({ command: 'ui-click' }), false);
});

test('Agent RPC contract requires a correlation identifier', async () => {
  const validate = new Ajv().compile(await loadSchema('agent-rpc.schema.json'));
  assert.equal(validate({ operation: 'health', correlationId: 'corr-1', payload: {} }), true);
  assert.equal(validate({ operation: 'health', payload: {} }), false);
});
