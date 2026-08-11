'use strict';

// This script intentionally exposes only fail-closed RPCs until a manually
// reviewed Profile supplies a safe in-process backend. It contains no UI path,
// no credentials export, and no fallback network client.
const globalScope = typeof globalThis === 'undefined' ? this : globalThis;

const blocked = (errorCode) => ({ status: 'blocked', errorCode, data: null });
const health = () => ({
  status: 'ready',
  errorCode: 'PROFILE_INCOMPATIBLE',
  data: {
    app: { versionName: null, versionCode: null },
    agentStatus: 'disconnected',
    profileStatus: 'blocked',
    sessionStatus: 'blocked',
    status: 'blocked',
    errorCode: 'PROFILE_INCOMPATIBLE'
  }
});

const exportsForPendingProfile = {
  health,
  searchbysku: () => blocked('PROFILE_INCOMPATIBLE'),
  getproduct: () => blocked('PROFILE_INCOMPATIBLE'),
  getquotes: () => blocked('PROFILE_INCOMPATIBLE')
};

if (typeof globalScope.rpc !== 'undefined') globalScope.rpc.exports = exportsForPendingProfile;
