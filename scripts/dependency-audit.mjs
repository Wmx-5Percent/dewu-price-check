import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url)));
const packageLock = JSON.parse(await readFile(new URL('../package-lock.json', import.meta.url)));
const expectedDependencies = {
  frida: '17.16.4',
  exceljs: '4.4.0',
  ajv: '8.17.1'
};

assert.equal(packageJson.type, 'module');
assert.equal(packageJson.engines.node, '>=22 <23');
assert.deepEqual(packageJson.dependencies, expectedDependencies);
for (const [name, version] of Object.entries(expectedDependencies)) {
  assert.equal(packageLock.packages[`node_modules/${name}`].version, version);
}
console.log('dependency audit passed');
