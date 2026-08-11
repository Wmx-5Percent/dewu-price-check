import { ERROR_CODES } from '../../shared/contracts/error-codes.mjs';

const EXPECTED_APP = Object.freeze({ packageName: 'com.shizhuang.duapp', versionName: '5.95.1', versionCode: 1101 });
const SECRET_KEY = /(?:authorization|cookie|token|signature|device(?:id|secret)?|secret|password|credential|header|body)/i;
const SECRET_VALUE = /(?:bearer\s+[a-z0-9._~+\-/]+=*|(?:cookie|authorization|token|signature|device(?:[_-]?(?:id|secret))?)\s*[:=])/i;
const CORRELATION_ID = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;
const MAX_QUOTE_PAGES = 16;

const blocked = (errorCode) => Object.freeze({ status: 'blocked', errorCode, data: null });
const ready = (data) => Object.freeze({ status: 'ready', errorCode: null, data: Object.freeze(data) });

const assertPlainObject = (value, errorCode = 'SCHEMA_DRIFT') => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(errorCode);
};

const assertNoSecrets = (value, path = 'payload') => {
  if (typeof value === 'string' && SECRET_VALUE.test(value)) throw new Error(`SECRET_VALUE:${path}`);
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    if (SECRET_KEY.test(key)) throw new Error(`SECRET_KEY:${path}.${key}`);
    assertNoSecrets(child, `${path}.${key}`);
  }
};

const assertExactKeys = (value, keys) => {
  assertPlainObject(value);
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  if (actual.length !== expected.length || actual.some((key, index) => key !== expected[index])) throw new Error('SCHEMA_DRIFT');
};

const assertString = (value) => {
  if (typeof value !== 'string' || value.length === 0 || value.length > 256 || SECRET_VALUE.test(value)) throw new Error('SCHEMA_DRIFT');
  return value;
};

const assertCorrelationId = (value) => {
  if (typeof value !== 'string' || !CORRELATION_ID.test(value)) throw new Error('SCHEMA_DRIFT');
  return value;
};

const assessRuntime = (runtime, profileState) => {
  if (!profileState || profileState.status !== 'ready') return ERROR_CODES.PROFILE_INCOMPATIBLE;
  if (!runtime || runtime.packageName !== EXPECTED_APP.packageName || runtime.versionName !== EXPECTED_APP.versionName || runtime.versionCode !== EXPECTED_APP.versionCode) {
    return ERROR_CODES.APP_VERSION_UNSUPPORTED;
  }
  if (runtime.agentConnected !== true) return ERROR_CODES.FRIDA_DISCONNECTED;
  if (runtime.sessionState !== 'authenticated') return ERROR_CODES.LOGIN_LOST;
  return null;
};

const normalizeSearch = (response) => {
  assertExactKeys(response, new Set(['correlationId', 'items']));
  const correlationId = assertCorrelationId(response.correlationId);
  if (!Array.isArray(response.items) || response.items.length === 0) throw new Error('SCHEMA_DRIFT');
  const [first] = response.items;
  assertExactKeys(first, new Set(['productId', 'name']));
  return { correlationId, sort: 'sales_desc', item: { productId: assertString(first.productId), name: assertString(first.name) }, responseItemIndex: 1 };
};

const normalizeProduct = (response) => {
  assertExactKeys(response, new Set(['correlationId', 'productId', 'name', 'totalSales']));
  return {
    correlationId: assertCorrelationId(response.correlationId),
    productId: assertString(response.productId),
    name: assertString(response.name),
    totalSales: assertString(response.totalSales)
  };
};

const normalizeQuotesPage = (response) => {
  assertExactKeys(response, new Set(['correlationId', 'quotes', 'nextCursor']));
  if (!Array.isArray(response.quotes) || (response.nextCursor !== null && typeof response.nextCursor !== 'string')) throw new Error('SCHEMA_DRIFT');
  const quotes = response.quotes.map((quote) => {
    assertExactKeys(quote, new Set(['size', 'price', 'status', 'variantId']));
    const normalized = {
      size: assertString(quote.size),
      price: quote.price === null ? null : assertString(quote.price),
      status: assertString(quote.status),
      variantId: assertString(quote.variantId)
    };
    if (!['quoted', 'no_quote'].includes(normalized.status) || (normalized.status === 'no_quote' && normalized.price !== null)) throw new Error('SCHEMA_DRIFT');
    return normalized;
  });
  return { correlationId: assertCorrelationId(response.correlationId), quotes, nextCursor: response.nextCursor };
};

const ensureSafe = (value) => {
  try {
    assertNoSecrets(value);
    return null;
  } catch {
    return ERROR_CODES.SCHEMA_DRIFT;
  }
};

export const createFridaAgent = ({ profileState, runtime, backend } = {}) => {
  const health = async () => {
    const errorCode = assessRuntime(runtime, profileState);
    return ready({
      app: runtime && typeof runtime === 'object' ? { versionName: runtime.versionName ?? null, versionCode: runtime.versionCode ?? null } : { versionName: null, versionCode: null },
      agentStatus: runtime?.agentConnected === true ? 'connected' : 'disconnected',
      profileStatus: profileState?.status === 'ready' ? 'ready' : 'blocked',
      sessionStatus: runtime?.sessionState === 'authenticated' ? 'authenticated' : 'blocked',
      status: errorCode ? 'blocked' : 'ready',
      errorCode
    });
  };

  const invoke = async (method, payload, normalize) => {
    const errorCode = assessRuntime(runtime, profileState);
    if (errorCode) return blocked(errorCode);
    if (!backend || typeof backend[method] !== 'function') return blocked(ERROR_CODES.FRIDA_DISCONNECTED);
    if (ensureSafe(payload)) return blocked(ERROR_CODES.SCHEMA_DRIFT);
    try {
      const response = await backend[method](payload);
      if (ensureSafe(response)) return blocked(ERROR_CODES.SCHEMA_DRIFT);
      return ready(normalize(response));
    } catch {
      return blocked(ERROR_CODES.SCHEMA_DRIFT);
    }
  };

  return Object.freeze({
    health,
    searchBySku: async ({ sku, sort = 'sales_desc' } = {}) => {
      if (sort !== 'sales_desc') return blocked(ERROR_CODES.SCHEMA_DRIFT);
      try { return await invoke('searchBySku', { sku: assertString(sku), sort: 'sales_desc' }, normalizeSearch); } catch { return blocked(ERROR_CODES.SCHEMA_DRIFT); }
    },
    getProduct: async ({ productId } = {}) => {
      try { return await invoke('getProduct', { productId: assertString(productId) }, normalizeProduct); } catch { return blocked(ERROR_CODES.SCHEMA_DRIFT); }
    },
    getQuotes: async ({ productId } = {}) => {
      try {
        const page = await invoke('getQuotesPage', { productId: assertString(productId), cursor: null }, normalizeQuotesPage);
        if (page.status !== 'ready') return page;
        const quotes = [...page.data.quotes];
        let cursor = page.data.nextCursor;
        let correlationId = page.data.correlationId;
        let pageCount = 1;
        const seen = new Set();
        while (cursor !== null) {
          if (pageCount >= MAX_QUOTE_PAGES) return blocked(ERROR_CODES.SCHEMA_DRIFT);
          if (seen.has(cursor)) return blocked(ERROR_CODES.SCHEMA_DRIFT);
          seen.add(cursor);
          const next = await invoke('getQuotesPage', { productId, cursor }, normalizeQuotesPage);
          if (next.status !== 'ready') return next;
          quotes.push(...next.data.quotes);
          cursor = next.data.nextCursor;
          correlationId = next.data.correlationId;
          pageCount += 1;
        }
        return ready({ correlationId, quotes, pagination: { complete: true } });
      } catch {
        return blocked(ERROR_CODES.SCHEMA_DRIFT);
      }
    }
  });
};

export const createFailClosedRpcExports = () => {
  const agent = createFridaAgent({ profileState: { status: 'blocked' }, runtime: { agentConnected: false, sessionState: 'blocked' } });
  return Object.freeze({
    health: agent.health,
    searchbysku: agent.searchBySku,
    getproduct: agent.getProduct,
    getquotes: agent.getQuotes
  });
};
