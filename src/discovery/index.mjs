const PROFILE_VERSION = '5.95.1-1101';
const CATEGORIES = new Set(['shoe', 'apparel', 'accessory']);
const OPERATIONS = new Set(['searchBySku', 'getProduct', 'getQuotes']);
const SECRET_KEY = /(?:authorization|cookie|token|signature|device(?:id|secret)?|secret|password|credential|header|body)/i;
const SECRET_VALUE = /(?:bearer\s+[a-z0-9._~+\-/]+=*|(?:cookie|authorization|token|signature|device(?:[_-]?(?:id|secret))?)\s*[:=])/i;
const JSON_PATH = /^\$(?:\.[A-Za-z_][A-Za-z0-9_]*)*$/;
const CORRELATION_ID = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;
const PATH_TEMPLATE = /^\/[A-Za-z0-9_./-]*$/;

const assertSafe = (value, path = 'record') => {
  if (typeof value === 'string' && SECRET_VALUE.test(value)) throw new Error(`DISCOVERY_SECRET_VALUE:${path}`);
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    if (SECRET_KEY.test(key)) throw new Error(`DISCOVERY_SECRET_KEY:${path}.${key}`);
    assertSafe(child, `${path}.${key}`);
  }
};

const requireString = (value, field) => {
  if (typeof value !== 'string' || value.length === 0 || value.length > 256) {
    throw new Error(`DISCOVERY_${field.toUpperCase()}_INVALID`);
  }
  return value;
};

const requireCategory = (category) => {
  if (!CATEGORIES.has(category)) throw new Error('DISCOVERY_CATEGORY_INVALID');
  return category;
};

const requireOperation = (operation) => {
  if (!OPERATIONS.has(operation)) throw new Error('DISCOVERY_OPERATION_INVALID');
  return operation;
};

const requireJsonPathMap = (pathMap) => {
  if (!pathMap || typeof pathMap !== 'object' || Array.isArray(pathMap)) {
    throw new Error('DISCOVERY_PATH_MAP_INVALID');
  }
  for (const [field, path] of Object.entries(pathMap)) {
    requireString(field, 'field');
    if (typeof path !== 'string' || !JSON_PATH.test(path)) throw new Error('DISCOVERY_JSON_PATH_INVALID');
  }
  return Object.freeze({ ...pathMap });
};

const assertAllowedKeys = (value, allowed, path) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`PROFILE_${path.toUpperCase()}_INVALID`);
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) throw new Error(`PROFILE_${path.toUpperCase()}_INVALID`);
  }
};

const assertSafeStrings = (values, path) => {
  for (const value of values) {
    if (typeof value === 'string' && SECRET_VALUE.test(value)) throw new Error(`DISCOVERY_SECRET_VALUE:${path}`);
  }
};

const assertProfileSafe = (profile) => {
  assertAllowedKeys(profile, new Set(['profileVersion', 'app', 'evidenceStatus', 'searchSort', 'requiredCategories', 'requiredOperations', 'requiredEvidence', 'safety']), 'fields');
  assertAllowedKeys(profile.app, new Set(['packageName', 'versionName', 'versionCode']), 'app');
  assertAllowedKeys(profile.safety, new Set(['persistRawResponses', 'persistCredentials', 'requireSalesDesc', 'blockOnSchemaDrift']), 'safety');
  if (!Object.values(profile.safety).every((value) => typeof value === 'boolean')) throw new Error('PROFILE_SAFETY_INVALID');
  for (const field of ['requiredCategories', 'requiredOperations', 'requiredEvidence']) {
    if (!Array.isArray(profile[field]) || !profile[field].every((value) => typeof value === 'string')) throw new Error(`PROFILE_${field.toUpperCase()}_INVALID`);
    assertSafeStrings(profile[field], `profile.${field}`);
  }
  assertSafeStrings([profile.profileVersion, profile.app.packageName, profile.app.versionName, profile.evidenceStatus, profile.searchSort], 'profile');
};

export const assessProfile = (profile) => {
  if (!profile || typeof profile !== 'object' || Array.isArray(profile)) throw new Error('PROFILE_INVALID');
  assertProfileSafe(profile);
  if (profile.profileVersion !== PROFILE_VERSION) return Object.freeze({ status: 'blocked', errorCode: 'APP_VERSION_UNSUPPORTED' });
  if (profile.app?.packageName !== 'com.shizhuang.duapp' || profile.app?.versionName !== '5.95.1' || profile.app?.versionCode !== 1101) {
    return Object.freeze({ status: 'blocked', errorCode: 'APP_VERSION_UNSUPPORTED' });
  }
  if (profile.evidenceStatus !== 'verified') return Object.freeze({ status: 'blocked', errorCode: 'PROFILE_INCOMPATIBLE' });
  if (profile.searchSort !== 'sales_desc') return Object.freeze({ status: 'blocked', errorCode: 'PROFILE_INCOMPATIBLE' });
  return Object.freeze({ status: 'ready', errorCode: null });
};

export const redactDiscoveryFixture = (input) => {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('DISCOVERY_FIXTURE_INVALID');
  assertSafe(input);
  if (input.fixtureKind !== 'synthetic-protocol-evidence' || input.synthetic !== true) {
    throw new Error('DISCOVERY_FIXTURE_NOT_SYNTHETIC');
  }
  const category = requireCategory(input.category);
  const operation = requireOperation(input.operation);
  const correlationId = requireString(input.correlationId, 'correlation_id');
  if (!CORRELATION_ID.test(correlationId)) throw new Error('DISCOVERY_CORRELATION_ID_INVALID');
  const request = input.request;
  if (!request || typeof request !== 'object' || Array.isArray(request)) throw new Error('DISCOVERY_REQUEST_INVALID');
  if (request.method !== 'GET' || typeof request.pathTemplate !== 'string' || !PATH_TEMPLATE.test(request.pathTemplate)) {
    throw new Error('DISCOVERY_REQUEST_INVALID');
  }
  if (operation === 'searchBySku' && request.sort !== 'sales_desc') throw new Error('DISCOVERY_SORT_INVALID');
  if (operation !== 'searchBySku' && request.sort !== undefined) throw new Error('DISCOVERY_REQUEST_INVALID');
  return Object.freeze({
    fixtureKind: 'synthetic-protocol-evidence',
    synthetic: true,
    correlationId,
    category,
    operation,
    request: Object.freeze({
      method: 'GET',
      pathTemplate: request.pathTemplate,
      ...(operation === 'searchBySku' ? { sort: 'sales_desc' } : {})
    }),
    responseSchema: Object.freeze({ pathMap: requireJsonPathMap(input.responseSchema?.pathMap) })
  });
};

export const createDiscoveryPlan = ({ profile, samples }) => {
  const assessment = assessProfile(profile);
  if (assessment.status !== 'ready') return Object.freeze({ status: 'blocked', errorCode: assessment.errorCode, steps: [] });
  if (!Array.isArray(samples) || samples.length === 0) throw new Error('DISCOVERY_SAMPLES_REQUIRED');
  const categories = new Set();
  const steps = samples.map(({ category, sku }) => {
    assertSafe({ sku }, 'sample');
    categories.add(requireCategory(category));
    return Object.freeze({ category, sku: requireString(sku, 'sku'), operation: 'searchBySku', sort: 'sales_desc' });
  });
  if (categories.size !== CATEGORIES.size) throw new Error('DISCOVERY_CATEGORY_COVERAGE_INCOMPLETE');
  return Object.freeze({ status: 'ready', errorCode: null, steps: Object.freeze(steps) });
};
