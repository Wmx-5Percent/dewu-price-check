import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { assessProfile, createSkuSearchPlan, redactDiscoveryFixture, selectResponseItemOne } from './index.mjs';

const readJson = async (name) => JSON.parse(await readFile(new URL(name, import.meta.url)));
const profile = await readJson('../../profiles/5.95.1-1101.json');

test('the versioned profile accepts only the fixed sales sort and response item one', () => {
  assert.deepEqual(assessProfile(profile), { status: 'ready', errorCode: null });
  assert.deepEqual(assessProfile({ ...profile, search: { ...profile.search, sort: 'price_asc' } }), {
    status: 'blocked', errorCode: 'PROFILE_INCOMPATIBLE'
  });
  assert.deepEqual(assessProfile({ ...profile, search: { ...profile.search, responseItemIndex: 2 } }), {
    status: 'blocked', errorCode: 'PROFILE_INCOMPATIBLE'
  });
});

test('the synthetic SKU fixture preserves only request metadata and first-item schema evidence', async () => {
  const fixture = await readJson('./fixtures/synthetic-sku-search.json');
  const redacted = redactDiscoveryFixture(fixture);
  assert.equal(redacted.request.sort, 'sales_desc');
  assert.equal(redacted.responseSchema.responseItemIndex, 1);
  assert.equal(Object.hasOwn(redacted, 'responseBody'), false);
});

test('fixture validation rejects secrets, raw payload fields, non-sales sorts, and non-first selection', async () => {
  const fixture = await readJson('./fixtures/synthetic-sku-search.json');
  assert.throws(() => redactDiscoveryFixture({ ...fixture, headers: { authorization: 'Bearer secret' } }), /DISCOVERY_SECRET_KEY/);
  assert.throws(() => redactDiscoveryFixture({ ...fixture, responseBody: '{"raw":true}' }), /DISCOVERY_SECRET_KEY/);
  assert.throws(() => redactDiscoveryFixture({ ...fixture, request: { ...fixture.request, sort: 'price_asc' } }), /DISCOVERY_REQUEST_INVALID/);
  assert.throws(() => redactDiscoveryFixture({ ...fixture, responseSchema: { ...fixture.responseSchema, responseItemIndex: 2 } }), /DISCOVERY_RESPONSE_SCHEMA_INVALID/);
});

test('the SKU plan and response selector fail closed on secret input or schema drift', () => {
  assert.deepEqual(createSkuSearchPlan({ profile, sku: 'SYNTHETIC-SKU-1' }), {
    status: 'ready', errorCode: null, step: { sku: 'SYNTHETIC-SKU-1', operation: 'searchBySku', sort: 'sales_desc', responseItemIndex: 1 }
  });
  assert.throws(() => createSkuSearchPlan({ profile, sku: 'Bearer secret' }), /DISCOVERY_SECRET_VALUE/);
  assert.deepEqual(selectResponseItemOne([]), { status: 'blocked', errorCode: 'SCHEMA_DRIFT', item: null });
  const first = { id: 'synthetic-first' };
  assert.equal(selectResponseItemOne([first, { id: 'synthetic-second' }]).item, first);
});
