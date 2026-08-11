import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, unlink, writeFile } from 'node:fs/promises';
import { dirname, join, resolve, sep } from 'node:path';

const SAFE_RECORD_FIELDS = new Set(['correlationId', 'event', 'result', 'errorCode']);
const SAFE_RESULT_FIELDS = new Set([
  'sku', 'status', 'productId', 'productName', 'sizeText', 'salePrice', 'salesCount', 'reviewNote'
]);
const SECRET_KEY = /(?:authorization|cookie|token|signature|device(?:id|secret)?|secret|password|credential)/i;
const SECRET_VALUE = /(?:bearer\s+[a-z0-9._~+\-/]+=*|(?:cookie|authorization|token|signature|device(?:[_-]?(?:id|secret))?)\s*[:=])/i;
const CORRELATION_ID = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;

const stableJson = (value) => {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
};

const assertSafeValue = (value, path = 'record') => {
  if (typeof value === 'string' && SECRET_VALUE.test(value)) throw new Error(`EVIDENCE_SECRET_DETECTED:${path}`);
  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      if (SECRET_KEY.test(key)) throw new Error(`EVIDENCE_SECRET_KEY:${path}.${key}`);
      assertSafeValue(child, `${path}.${key}`);
    }
  }
};

const requireString = (value, field) => {
  if (typeof value !== 'string' || value.length === 0 || value.length > 256) {
    throw new Error(`EVIDENCE_${field.toUpperCase()}_INVALID`);
  }
  return value;
};

const atomicWrite = async (targetPath, contents) => {
  await mkdir(dirname(targetPath), { recursive: true });
  const temporaryPath = `${targetPath}.${process.pid}.${randomUUID()}.tmp`;
  try {
    await writeFile(temporaryPath, contents, { encoding: 'utf8', flag: 'wx' });
    await rename(temporaryPath, targetPath);
  } catch (error) {
    await unlink(temporaryPath).catch(() => {});
    throw error;
  }
};

const safeTarget = (rootPath, relativePath) => {
  const targetPath = resolve(rootPath, relativePath);
  if (!targetPath.startsWith(`${rootPath}${sep}`)) throw new Error('EVIDENCE_PATH_UNSAFE');
  return targetPath;
};

export const scanForSecrets = (value) => {
  assertSafeValue(value);
  return false;
};

export const redactEvidence = (input) => {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('EVIDENCE_RECORD_INVALID');
  const record = {};
  for (const [key, value] of Object.entries(input)) {
    if (!SAFE_RECORD_FIELDS.has(key)) continue;
    if (key === 'result' && value && typeof value === 'object' && !Array.isArray(value)) {
      record.result = Object.fromEntries(Object.entries(value).filter(([resultKey]) => SAFE_RESULT_FIELDS.has(resultKey)));
    } else {
      record[key] = value;
    }
  }
  record.correlationId = requireString(record.correlationId, 'correlation_id');
  if (!CORRELATION_ID.test(record.correlationId)) throw new Error('EVIDENCE_CORRELATION_ID_UNSAFE');
  record.event = requireString(record.event, 'event');
  if (record.errorCode !== undefined) record.errorCode = requireString(record.errorCode, 'error_code');
  if (record.result !== undefined && Object.keys(record.result).length === 0) delete record.result;
  assertSafeValue(record);
  return record;
};

export const evidenceHash = (record) => createHash('sha256').update(stableJson(record)).digest('hex');

export const createEvidenceStore = (rootDirectory) => {
  const rootPath = resolve(rootDirectory);
  return Object.freeze({ rootPath });
};

export const persistEvidence = async (store, input) => {
  if (!store?.rootPath) throw new Error('EVIDENCE_STORE_INVALID');
  const record = redactEvidence(input);
  const persisted = { ...record, evidenceHash: evidenceHash(record) };
  const targetPath = safeTarget(store.rootPath, join('records', `${record.correlationId}.json`));
  await atomicWrite(targetPath, `${JSON.stringify(persisted)}\n`);
  return persisted;
};

export const readEvidence = async (store, correlationId) => {
  if (!CORRELATION_ID.test(correlationId)) throw new Error('EVIDENCE_CORRELATION_ID_UNSAFE');
  const targetPath = safeTarget(store.rootPath, join('records', `${correlationId}.json`));
  return JSON.parse(await readFile(targetPath, 'utf8'));
};

export const appendEvidenceLog = async (store, input) => {
  const record = redactEvidence(input);
  const persisted = { ...record, evidenceHash: evidenceHash(record) };
  const targetPath = safeTarget(store.rootPath, 'evidence.jsonl');
  let existing = '';
  try {
    existing = await readFile(targetPath, 'utf8');
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  await atomicWrite(targetPath, `${existing}${JSON.stringify(persisted)}\n`);
  return persisted;
};
