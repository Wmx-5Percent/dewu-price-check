import assert from 'node:assert/strict';
import test from 'node:test';
import { createBootstrapDryRun, discoverAndroidSdk, doctor, environmentToolPaths } from '../src/environment/index.mjs';

test('SDK discovery prefers explicit portable configuration', () => {
  const root = discoverAndroidSdk({
    env: { ANDROID_SDK_ROOT: '/portable/sdk' },
    platform: 'darwin',
    home: '/ignored',
    pathExists: (path) => path === '/portable/sdk'
  });
  assert.equal(root, '/portable/sdk');
});

test('doctor is offline by default and reports missing tools as a blocker', () => {
  let runs = 0;
  const report = doctor({
    env: { ANDROID_HOME: '/portable/sdk', JAVA_HOME: '/portable/java' },
    pathExists: () => false,
    run: () => {
      runs += 1;
      return { code: 0, stdout: '', stderr: 'openjdk version "17.0.20"' };
    }
  });
  assert.equal(report.status, 'blocked');
  assert.equal(report.blocker, 'EMULATOR_UNAVAILABLE');
  assert.equal(runs, 1);
});

test('doctor can use a supplied ADB runner only when device probing is requested', () => {
  const sdkRoot = '/portable/sdk';
  const tools = environmentToolPaths({ sdkRoot, platform: 'linux' });
  const present = new Set([sdkRoot, ...Object.values(tools)]);
  const commands = [];
  const report = doctor({
    env: { ANDROID_SDK_ROOT: sdkRoot },
    platform: 'linux',
    pathExists: (path) => present.has(path),
    probeDevices: true,
    run: (command, args) => {
      commands.push([command, args]);
      return command === 'java'
        ? { code: 0, stdout: '', stderr: 'openjdk version "17.0.20"' }
        : { code: 0, stdout: 'List of devices attached\nemulator-5554 device\n', stderr: '' };
    }
  });
  assert.equal(report.status, 'ready');
  assert.equal(report.deviceSerial, 'emulator-5554');
  assert.deepEqual(commands[1], [tools.adb, ['devices', '-l']]);
});

test('doctor blocks multiple devices until an online serial is selected', () => {
  const sdkRoot = '/portable/sdk';
  const tools = environmentToolPaths({ sdkRoot, platform: 'linux' });
  const present = new Set([sdkRoot, ...Object.values(tools)]);
  const run = (command) => command === 'java'
    ? { code: 0, stdout: '', stderr: 'openjdk version "17.0.20"' }
    : { code: 0, stdout: 'List of devices attached\nemulator-5554 device\nR58N1234 device\n', stderr: '' };

  const blocked = doctor({
    env: { ANDROID_SDK_ROOT: sdkRoot }, platform: 'linux', pathExists: (path) => present.has(path), probeDevices: true, run
  });
  assert.equal(blocked.status, 'blocked');
  assert.equal(blocked.deviceSerial, null);
  assert.equal(blocked.checks.at(-1).reason, 'serial_required_for_multiple_devices');

  const selected = doctor({
    env: { ANDROID_SDK_ROOT: sdkRoot }, platform: 'linux', pathExists: (path) => present.has(path), deviceSerial: 'R58N1234', run
  });
  assert.equal(selected.status, 'ready');
  assert.equal(selected.deviceSerial, 'R58N1234');
});

test('doctor rejects a requested serial that is not online', () => {
  const sdkRoot = '/portable/sdk';
  const tools = environmentToolPaths({ sdkRoot, platform: 'linux' });
  const present = new Set([sdkRoot, ...Object.values(tools)]);
  const report = doctor({
    env: { ANDROID_SDK_ROOT: sdkRoot },
    platform: 'linux',
    pathExists: (path) => present.has(path),
    deviceSerial: 'missing-device',
    run: (command) => command === 'java'
      ? { code: 0, stdout: '', stderr: 'openjdk version "17.0.20"' }
      : { code: 0, stdout: 'List of devices attached\nemulator-5554 device\n', stderr: '' }
  });
  assert.equal(report.status, 'blocked');
  assert.equal(report.checks.at(-1).reason, 'requested_serial_not_online');
});

test('bootstrap dry-run requires caller-provided targets and performs no actions', () => {
  assert.throws(() => createBootstrapDryRun({ sdkRoot: '/portable/sdk', avdName: '', apkDirectory: '/apk' }), /avdName is required/);
  const plan = createBootstrapDryRun({ sdkRoot: '/portable/sdk', avdName: 'approved-avd', apkDirectory: '/approved/apks' });
  assert.equal(plan.mode, 'dry-run');
  assert.equal(plan.avdName, 'approved-avd');
  assert.equal(Object.isFrozen(plan.actions), true);
});
