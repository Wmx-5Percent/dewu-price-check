import assert from 'node:assert/strict';
import test from 'node:test';
import { createFailClosedRpcExports, createFridaAgent } from '../src/frida/index.mjs';

const readyProfile = { status: 'ready' };
const readyRuntime = { packageName: 'com.shizhuang.duapp', versionName: '5.95.1', versionCode: 1101, agentConnected: true, sessionState: 'authenticated' };

const backend = {
  async searchBySku({ sku, sort }) {
    assert.equal(sort, 'sales_desc');
    assert.equal(sku, 'SYNTHETIC-SKU');
    return { correlationId: 'corr-search-1', items: [{ productId: 'product-1', name: 'Synthetic Product' }, { productId: 'product-2', name: 'Must not cross boundary' }] };
  },
  async getProduct({ productId }) {
    assert.equal(productId, 'product-1');
    return { correlationId: 'corr-product-1', productId, name: 'Synthetic Product', totalSales: '1000+' };
  },
  async getQuotesPage({ productId, cursor }) {
    assert.equal(productId, 'product-1');
    if (cursor === null) return { correlationId: 'corr-quotes-1', quotes: [{ size: '42', price: '599', status: 'quoted', variantId: 'variant-1' }], nextCursor: 'next-page' };
    if (cursor === 'next-page') return { correlationId: 'corr-quotes-2', quotes: [{ size: '43', price: null, status: 'no_quote', variantId: 'variant-2' }], nextCursor: null };
    throw new Error('unexpected cursor');
  }
};

test('health never exports session or device secrets and exposes pending Profile as blocked', async () => {
  const agent = createFridaAgent({ profileState: { status: 'blocked' }, runtime: { ...readyRuntime, sessionState: 'authenticated', deviceId: 'synthetic-device' }, backend });
  assert.deepEqual(await agent.health(), {
    status: 'ready', errorCode: null, data: {
      app: { versionName: '5.95.1', versionCode: 1101 }, agentStatus: 'connected', profileStatus: 'blocked', sessionStatus: 'authenticated', status: 'blocked', errorCode: 'PROFILE_INCOMPATIBLE'
    }
  });
  assert.deepEqual(await agent.searchBySku({ sku: 'SYNTHETIC-SKU' }), { status: 'blocked', errorCode: 'PROFILE_INCOMPATIBLE', data: null });
});

test('the four RPCs use only the in-process backend and normalize search item one and paginated quotes', async () => {
  const agent = createFridaAgent({ profileState: readyProfile, runtime: readyRuntime, backend });
  assert.equal((await agent.health()).data.status, 'ready');
  assert.deepEqual(await agent.searchBySku({ sku: 'SYNTHETIC-SKU' }), {
    status: 'ready', errorCode: null, data: { correlationId: 'corr-search-1', sort: 'sales_desc', item: { productId: 'product-1', name: 'Synthetic Product' }, responseItemIndex: 1 }
  });
  assert.deepEqual(await agent.getProduct({ productId: 'product-1' }), {
    status: 'ready', errorCode: null, data: { correlationId: 'corr-product-1', productId: 'product-1', name: 'Synthetic Product', totalSales: '1000+' }
  });
  assert.deepEqual(await agent.getQuotes({ productId: 'product-1' }), {
    status: 'ready', errorCode: null, data: {
      correlationId: 'corr-quotes-2',
      quotes: [{ size: '42', price: '599', status: 'quoted', variantId: 'variant-1' }, { size: '43', price: null, status: 'no_quote', variantId: 'variant-2' }],
      pagination: { complete: true }
    }
  });
});

test('version, session, sort, secret, schema, and pagination drift fail closed without a fallback', async () => {
  const agent = createFridaAgent({ profileState: readyProfile, runtime: { ...readyRuntime, versionCode: 1102 }, backend });
  assert.deepEqual(await agent.getProduct({ productId: 'product-1' }), { status: 'blocked', errorCode: 'APP_VERSION_UNSUPPORTED', data: null });

  const sessionLost = createFridaAgent({ profileState: readyProfile, runtime: { ...readyRuntime, sessionState: 'logged_out' }, backend });
  assert.deepEqual(await sessionLost.searchBySku({ sku: 'SYNTHETIC-SKU' }), { status: 'blocked', errorCode: 'LOGIN_LOST', data: null });

  const safe = createFridaAgent({ profileState: readyProfile, runtime: readyRuntime, backend });
  assert.deepEqual(await safe.searchBySku({ sku: 'SYNTHETIC-SKU', sort: 'price_asc' }), { status: 'blocked', errorCode: 'SCHEMA_DRIFT', data: null });
  assert.deepEqual(await safe.searchBySku({ sku: 'Bearer secret' }), { status: 'blocked', errorCode: 'SCHEMA_DRIFT', data: null });

  const leakingBackend = { ...backend, async getProduct() { return { correlationId: 'corr-product-1', productId: 'product-1', name: 'Synthetic Product', totalSales: '1000+', authorization: 'Bearer secret' }; } };
  const protectedAgent = createFridaAgent({ profileState: readyProfile, runtime: readyRuntime, backend: leakingBackend });
  assert.deepEqual(await protectedAgent.getProduct({ productId: 'product-1' }), { status: 'blocked', errorCode: 'SCHEMA_DRIFT', data: null });

  const loopingBackend = { ...backend, async getQuotesPage() { return { correlationId: 'corr-quotes-loop', quotes: [], nextCursor: 'same' }; } };
  const loopSafeAgent = createFridaAgent({ profileState: readyProfile, runtime: readyRuntime, backend: loopingBackend });
  assert.deepEqual(await loopSafeAgent.getQuotes({ productId: 'product-1' }), { status: 'blocked', errorCode: 'SCHEMA_DRIFT', data: null });

  let uniqueCursorCalls = 0;
  const unboundedCursorBackend = {
    ...backend,
    async getQuotesPage() {
      uniqueCursorCalls += 1;
      return { correlationId: `corr-quotes-${uniqueCursorCalls}`, quotes: [], nextCursor: `cursor-${uniqueCursorCalls}` };
    }
  };
  const boundedAgent = createFridaAgent({ profileState: readyProfile, runtime: readyRuntime, backend: unboundedCursorBackend });
  assert.deepEqual(await boundedAgent.getQuotes({ productId: 'product-1' }), { status: 'blocked', errorCode: 'SCHEMA_DRIFT', data: null });
  assert.equal(uniqueCursorCalls, 16);
});

test('the Frida entrypoint equivalent is permanently fail-closed until a validated backend exists', async () => {
  const exports = createFailClosedRpcExports();
  assert.deepEqual(await exports.searchbysku({ sku: 'SYNTHETIC-SKU' }), { status: 'blocked', errorCode: 'PROFILE_INCOMPATIBLE', data: null });
  assert.equal((await exports.health()).data.profileStatus, 'blocked');
});
