import assert from 'node:assert/strict';
import test from 'node:test';
import { CONTRACT_KINDS, CONTRACT_VERSION, EXPORT_COLUMNS } from '../shared/contracts/contract-v1.mjs';
import { ERROR_CODES, GLOBAL_BLOCKER_CODES } from '../shared/contracts/error-codes.mjs';

test('public contract constants are versioned and immutable', () => {
  assert.equal(CONTRACT_VERSION, 'v1');
  assert.equal(Object.isFrozen(CONTRACT_KINDS), true);
  assert.equal(Object.isFrozen(EXPORT_COLUMNS), true);
});

test('all defined Foundation errors are global blockers', () => {
  for (const code of Object.values(ERROR_CODES)) assert.equal(GLOBAL_BLOCKER_CODES.has(code), true);
});
