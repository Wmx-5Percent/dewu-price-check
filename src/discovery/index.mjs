const PROFILE_VERSION = '5.95.1-1101';
const SECRET_KEY = /(?:authorization|cookie|token|signature|device(?:id|secret)?|secret|password|credential|header|body)/i;
const SECRET_VALUE = /(?:bearer\s+[a-z0-9._~+\-/]+=*|(?:cookie|authorization|token|signature|device(?:[_-]?(?:id|secret))?)\s*[:=])/i;
const CORRELATION_ID = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;
const PATH_TEMPLATE = /^\/[A-Za-z0-9_./-]*$/;
const JSON_PATH = /^\$(?:\.[A-Za-z_][A-Za-z0-9_]*)*$/;

const assertSafe = (value, path = 'record') => {
  if (typeof value === 'string' && SECRET_VALUE.test(value)) throw new Error(`DISCOVERY_SECRET_VALUE:${path}`);
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    if (SECRET_KEY.test(key)) throw new Error(`DISCOVERY_SECRET_KEY:${path}.${key}`);
    assertSafe(child, `${path}.${key}`);
  }
};

const requireString = (value, field) => {
  if (typeof value !== 'string' || value.length === 0 || value.length > 256) throw new Error(`DISCOVERY_${field.toUpperCase()}_INVALID`);
  return value;
};

const assertAllowedKeys = (value, allowed, path) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`PROFILE_${path.toUpperCase()}_INVALID`);
  for (const key of Object.keys(value)) if (!allowed.has(key)) throw new Error(`PROFILE_${path.toUpperCase()}_INVALID`);
};

const assertExactKeys = (value, expected, errorCode) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(errorCode);
  const actual = Object.keys(value).sort();
  const required = [...expected].sort();
  if (actual.length !== required.length || actual.some((key, index) => key !== required[index])) throw new Error(errorCode);
};

const assertProfileSafe = (profile) => {
  assertAllowedKeys(profile, new Set(['profileVersion', 'app', 'evidenceStatus', 'evidence', 'search', 'requiredEvidence', 'safety']), 'fields');
  assertAllowedKeys(profile.app, new Set(['packageName', 'versionName', 'versionCode']), 'app');
  assertAllowedKeys(profile.evidence, new Set(['source', 'requestMetadataReviewed', 'responseItemSchemaReviewed']), 'evidence');
  assertAllowedKeys(profile.search, new Set(['operation', 'sort', 'responseItemIndex']), 'search');
  assertAllowedKeys(profile.safety, new Set(['persistRawResponses', 'persistCredentials', 'requireSalesDesc', 'blockOnSchemaDrift']), 'safety');
  if (!Array.isArray(profile.requiredEvidence) || !profile.requiredEvidence.every((value) => typeof value === 'string')) throw new Error('PROFILE_REQUIRED_EVIDENCE_INVALID');
  if (!Object.values(profile.safety).every((value) => typeof value === 'boolean')) throw new Error('PROFILE_SAFETY_INVALID');
  if (typeof profile.evidence.requestMetadataReviewed !== 'boolean' || typeof profile.evidence.responseItemSchemaReviewed !== 'boolean') throw new Error('PROFILE_EVIDENCE_INVALID');
  assertSafe({
    profileVersion: profile.profileVersion,
    app: profile.app,
    evidenceStatus: profile.evidenceStatus,
    evidence: profile.evidence,
    search: profile.search,
    requiredEvidence: profile.requiredEvidence
  }, 'profile');
};

export const assessProfile = (profile) => {
  if (!profile || typeof profile !== 'object' || Array.isArray(profile)) throw new Error('PROFILE_INVALID');
  assertProfileSafe(profile);
  if (profile.profileVersion !== PROFILE_VERSION || profile.app.packageName !== 'com.shizhuang.duapp' || profile.app.versionName !== '5.95.1' || profile.app.versionCode !== 1101) {
    return Object.freeze({ status: 'blocked', errorCode: 'APP_VERSION_UNSUPPORTED' });
  }
  if (profile.evidenceStatus !== 'verified-manual-redacted' || profile.evidence.source !== 'manual-reviewed-redacted' || !profile.evidence.requestMetadataReviewed || !profile.evidence.responseItemSchemaReviewed || profile.search.operation !== 'searchBySku' || profile.search.sort !== 'sales_desc' || profile.search.responseItemIndex !== 1) {
    return Object.freeze({ status: 'blocked', errorCode: 'PROFILE_INCOMPATIBLE' });
  }
  return Object.freeze({ status: 'ready', errorCode: null });
};

export const redactDiscoveryFixture = (input) => {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('DISCOVERY_FIXTURE_INVALID');
  assertSafe(input);
  assertExactKeys(input, new Set(['fixtureKind', 'synthetic', 'correlationId', 'operation', 'request', 'responseSchema']), 'DISCOVERY_FIXTURE_FIELDS_INVALID');
  if (input.fixtureKind !== 'synthetic-sku-search-evidence' || input.synthetic !== true || input.operation !== 'searchBySku') {
    throw new Error('DISCOVERY_FIXTURE_NOT_SYNTHETIC');
  }
  const correlationId = requireString(input.correlationId, 'correlation_id');
  if (!CORRELATION_ID.test(correlationId)) throw new Error('DISCOVERY_CORRELATION_ID_INVALID');
  const request = input.request;
  assertExactKeys(request, new Set(['method', 'pathTemplate', 'sort']), 'DISCOVERY_REQUEST_FIELDS_INVALID');
  if (!request || typeof request !== 'object' || Array.isArray(request) || request.method !== 'GET' || typeof request.pathTemplate !== 'string' || !PATH_TEMPLATE.test(request.pathTemplate) || request.sort !== 'sales_desc') {
    throw new Error('DISCOVERY_REQUEST_INVALID');
  }
  const responseSchema = input.responseSchema;
  assertExactKeys(responseSchema, new Set(['itemsPath', 'responseItemIndex']), 'DISCOVERY_RESPONSE_SCHEMA_FIELDS_INVALID');
  if (typeof responseSchema.itemsPath !== 'string' || !JSON_PATH.test(responseSchema.itemsPath) || responseSchema.responseItemIndex !== 1) {
    throw new Error('DISCOVERY_RESPONSE_SCHEMA_INVALID');
  }
  return Object.freeze({
    fixtureKind: 'synthetic-sku-search-evidence',
    synthetic: true,
    correlationId,
    operation: 'searchBySku',
    request: Object.freeze({ method: 'GET', pathTemplate: request.pathTemplate, sort: 'sales_desc' }),
    responseSchema: Object.freeze({ itemsPath: responseSchema.itemsPath, responseItemIndex: 1 })
  });
};

export const createSkuSearchPlan = ({ profile, sku }) => {
  const assessment = assessProfile(profile);
  if (assessment.status !== 'ready') return Object.freeze({ status: 'blocked', errorCode: assessment.errorCode, step: null });
  assertSafe({ sku }, 'sku');
  return Object.freeze({
    status: 'ready',
    errorCode: null,
    step: Object.freeze({ sku: requireString(sku, 'sku'), operation: 'searchBySku', sort: 'sales_desc', responseItemIndex: 1 })
  });
};

export const selectResponseItemOne = (items) => {
  if (!Array.isArray(items) || items.length === 0) return Object.freeze({ status: 'blocked', errorCode: 'SCHEMA_DRIFT', item: null });
  return Object.freeze({ status: 'ready', errorCode: null, item: items[0] });
};
