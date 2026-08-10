import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import Ajv from 'ajv';
import { EXPORT_COLUMNS } from '../shared/contracts/contract-v1.mjs';

const schema = JSON.parse(await readFile(new URL('../schemas/export-row.schema.json', import.meta.url)));
const validate = new Ajv().compile(schema);

const emptyRow = Object.fromEntries(EXPORT_COLUMNS.map((column) => [column, '']));
emptyRow['货号'] = 'SYNTHETIC-1';

test('export row is exactly the approved six columns in order', () => {
  assert.deepEqual(Object.keys(emptyRow), EXPORT_COLUMNS);
  assert.equal(validate(emptyRow), true);
});

test('export row rejects internal evidence fields', () => {
  assert.equal(validate({ ...emptyRow, evidenceHash: 'abc' }), false);
});
