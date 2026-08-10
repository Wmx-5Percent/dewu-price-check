import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const executableName = (name, platform) => (platform === 'win32' ? `${name}.exe` : name);

const defaultSdkCandidates = ({ env, platform, home }) => {
  const configured = [env.ANDROID_SDK_ROOT, env.ANDROID_HOME].filter(Boolean);
  const platformDefaults = platform === 'darwin'
    ? [join(home, 'Library', 'Android', 'sdk')]
    : platform === 'win32'
      ? [env.LOCALAPPDATA && join(env.LOCALAPPDATA, 'Android', 'Sdk')]
      : [join(home, 'Android', 'Sdk')];

  return [...configured, ...platformDefaults.filter(Boolean)];
};

export const discoverAndroidSdk = ({
  env = process.env,
  platform = process.platform,
  home = homedir(),
  pathExists = existsSync
} = {}) => {
  const candidates = defaultSdkCandidates({ env, platform, home });
  return candidates.find(pathExists) ?? null;
};

export const environmentToolPaths = ({ sdkRoot, platform = process.platform }) => ({
  adb: join(sdkRoot, 'platform-tools', executableName('adb', platform)),
  emulator: join(sdkRoot, 'emulator', executableName('emulator', platform)),
  sdkmanager: join(sdkRoot, 'cmdline-tools', 'latest', 'bin', executableName('sdkmanager', platform)),
  avdmanager: join(sdkRoot, 'cmdline-tools', 'latest', 'bin', executableName('avdmanager', platform))
});

const defaultRun = (command, args) => {
  const result = spawnSync(command, args, { encoding: 'utf8' });
  return {
    code: result.status ?? 1,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? result.error?.message ?? ''
  };
};

const onlineDeviceSerials = (output) => output
  .split('\n')
  .map((line) => line.trim().split(/\s+/))
  .filter(([serial, state]) => serial && serial !== 'List' && state === 'device')
  .map(([serial]) => serial);

const selectDevice = ({ output, requestedSerial }) => {
  const serials = onlineDeviceSerials(output);
  if (requestedSerial) {
    return serials.includes(requestedSerial)
      ? { ok: true, serial: requestedSerial }
      : { ok: false, reason: 'requested_serial_not_online' };
  }
  return serials.length === 1
    ? { ok: true, serial: serials[0] }
    : { ok: false, reason: serials.length > 1 ? 'serial_required_for_multiple_devices' : 'no_online_device' };
};

export const doctor = ({
  env = process.env,
  platform = process.platform,
  home = homedir(),
  pathExists = existsSync,
  run = defaultRun,
  probeDevices = false,
  deviceSerial = null
} = {}) => {
  const sdkRoot = discoverAndroidSdk({ env, platform, home, pathExists });
  const checks = [{ name: 'node', ok: Number(process.versions.node.split('.')[0]) === 22 }];
  const javaCommand = env.JAVA_HOME
    ? join(env.JAVA_HOME, 'bin', executableName('java', platform))
    : 'java';
  const java = run(javaCommand, ['-version']);
  checks.push({ name: 'java-17', ok: java.code === 0 && /version "17\./.test(`${java.stdout}${java.stderr}`) });

  if (!sdkRoot) {
    return { status: 'blocked', blocker: 'EMULATOR_UNAVAILABLE', sdkRoot: null, checks };
  }

  const tools = environmentToolPaths({ sdkRoot, platform });
  for (const [name, path] of Object.entries(tools)) checks.push({ name, ok: pathExists(path) });

  let selectedDeviceSerial = null;
  if ((probeDevices || deviceSerial) && checks.find((check) => check.name === 'adb')?.ok) {
    const devices = run(tools.adb, ['devices', '-l']);
    const selection = devices.code === 0
      ? selectDevice({ output: devices.stdout, requestedSerial: deviceSerial })
      : { ok: false, reason: 'adb_unavailable' };
    selectedDeviceSerial = selection.ok ? selection.serial : null;
    checks.push({ name: 'device-selection', ok: selection.ok, reason: selection.reason });
  }

  return {
    status: checks.every((check) => check.ok) ? 'ready' : 'blocked',
    blocker: checks.every((check) => check.ok) ? null : 'EMULATOR_UNAVAILABLE',
    sdkRoot,
    checks,
    deviceSerial: selectedDeviceSerial
  };
};
