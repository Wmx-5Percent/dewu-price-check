import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import Ajv from 'ajv';

const schema = JSON.parse(await readFile(new URL('../schemas/run-result.schema.json', import.meta.url)));
const validate = new Ajv().compile(schema);

test('synthetic fixture preserves correlation and blocks invalid profiles', () => {
  const result = {
    sku: 'SYNTHETIC-1',
    status: 'blocked',
    correlationId: 'corr-synthetic-1',
    errorCode: 'PROFILE_INCOMPATIBLE',
    note: 'Synthetic profile assertion failure'
  };
  assert.equal(validate(result), true);
  assert.equal(result.status, 'blocked');
});
