import { isAbsolute, resolve } from 'node:path';

const requiredString = (value, name) => {
  if (typeof value !== 'string' || value.trim() === '') throw new TypeError(`${name} is required`);
  return value;
};

export const createBootstrapDryRun = ({ sdkRoot, avdName, apkDirectory }) => {
  requiredString(sdkRoot, 'sdkRoot');
  requiredString(avdName, 'avdName');
  requiredString(apkDirectory, 'apkDirectory');

  return Object.freeze({
    mode: 'dry-run',
    sdkRoot: resolve(sdkRoot),
    avdName,
    apkDirectory: isAbsolute(apkDirectory) ? apkDirectory : resolve(apkDirectory),
    actions: Object.freeze([
      'verify Android SDK tools and selected system image',
      'create or start only the explicitly named AVD',
      'install APK splits only from the explicitly supplied directory',
      'deploy the Frida Server version locked by package-lock.json'
    ])
  });
};
