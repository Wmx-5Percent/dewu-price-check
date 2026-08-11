import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { assessProfile, createDiscoveryPlan, redactDiscoveryFixture } from './index.mjs';

const readJson = async (name) => JSON.parse(await readFile(new URL(name, import.meta.url)));
const profile = await readJson('../../profiles/5.95.1-1101.discovery-gate.json');

test('the known app version remains globally blocked until live mapping evidence is verified', () => {
  assert.deepEqual(assessProfile(profile), { status: 'blocked', errorCode: 'PROFILE_INCOMPATIBLE' });
  assert.deepEqual(createDiscoveryPlan({ profile, samples: [] }), {
    status: 'blocked', errorCode: 'PROFILE_INCOMPATIBLE', steps: []
  });
});

test('reviewed synthetic fixtures cover the three categories without raw request or response data', async () => {
  const fixtures = await Promise.all([
    readJson('./fixtures/synthetic-shoe.json'),
    readJson('./fixtures/synthetic-apparel.json'),
    readJson('./fixtures/synthetic-accessory.json')
  ]);
  const redacted = fixtures.map(redactDiscoveryFixture);
  assert.deepEqual(new Set(redacted.map(({ category }) => category)), new Set(['shoe', 'apparel', 'accessory']));
  assert.equal(redacted[0].request.sort, 'sales_desc');
  assert.equal(Object.hasOwn(redacted[0], 'responseBody'), false);
});

test('fixture validation rejects secrets, raw payload fields, and an unverified search sort', async () => {
  const fixture = await readJson('./fixtures/synthetic-shoe.json');
  assert.throws(() => redactDiscoveryFixture({ ...fixture, headers: { authorization: 'Bearer secret' } }), /DISCOVERY_SECRET_KEY/);
  assert.throws(() => redactDiscoveryFixture({ ...fixture, responseBody: '{"raw":true}' }), /DISCOVERY_SECRET_KEY/);
  assert.throws(() => redactDiscoveryFixture({ ...fixture, request: { ...fixture.request, sort: 'price_asc' } }), /DISCOVERY_SORT_INVALID/);
  assert.throws(() => redactDiscoveryFixture({ ...fixture, request: { ...fixture.request, pathTemplate: '/synthetic/search?sku=secret' } }), /DISCOVERY_REQUEST_INVALID/);
  assert.throws(() => redactDiscoveryFixture({ ...fixture, correlationId: 'unsafe/correlation' }), /DISCOVERY_CORRELATION_ID_INVALID/);
});

test('a verified profile requires all three category samples and the fixed sales sort', () => {
  const verified = { ...profile, evidenceStatus: 'verified' };
  assert.throws(() => createDiscoveryPlan({ profile: verified, samples: [{ category: 'shoe', sku: 'SYN-1' }] }), /DISCOVERY_CATEGORY_COVERAGE_INCOMPLETE/);
  const plan = createDiscoveryPlan({
    profile: verified,
    samples: [
      { category: 'shoe', sku: 'SYN-1' },
      { category: 'apparel', sku: 'SYN-2' },
      { category: 'accessory', sku: 'SYN-3' }
    ]
  });
  assert.deepEqual(plan.steps.map(({ sort }) => sort), ['sales_desc', 'sales_desc', 'sales_desc']);
  assert.throws(() => createDiscoveryPlan({ profile: verified, samples: [
    { category: 'shoe', sku: 'Bearer secret' },
    { category: 'apparel', sku: 'SYN-2' },
    { category: 'accessory', sku: 'SYN-3' }
  ] }), /DISCOVERY_SECRET_VALUE/);
});
