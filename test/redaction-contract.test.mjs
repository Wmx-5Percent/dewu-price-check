import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import Ajv from 'ajv';

const schema = JSON.parse(await readFile(new URL('../schemas/run-result.schema.json', import.meta.url)));
const validate = new Ajv().compile(schema);
const rpcSchema = JSON.parse(await readFile(new URL('../schemas/agent-rpc.schema.json', import.meta.url)));
const validateRpc = new Ajv().compile(rpcSchema);

test('persistable run results reject session and device secrets', () => {
  assert.equal(validate({ sku: 'SYNTHETIC-1', status: 'blocked', errorCode: 'LOGIN_LOST' }), true);
  assert.equal(validate({ sku: 'SYNTHETIC-1', status: 'blocked', cookie: 'secret' }), false);
  assert.equal(validate({ sku: 'SYNTHETIC-1', status: 'blocked', authorization: 'secret' }), false);
  assert.equal(validateRpc({ operation: 'health', correlationId: 'corr-1', payload: {}, token: 'secret' }), false);
  assert.equal(validateRpc({ operation: 'searchBySku', correlationId: 'corr-1', payload: { sku: 'SYNTHETIC-1', token: 'secret' } }), false);
  assert.equal(validateRpc({ operation: 'searchBySku', correlationId: 'corr-1', payload: { sku: 'SYNTHETIC-1', headers: { authorization: 'secret' } } }), false);
  assert.equal(validateRpc({ operation: 'getProduct', correlationId: 'corr-1', payload: { productId: 'product-1', metadata: { cookie: 'secret' } } }), false);
});
