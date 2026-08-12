import { parseArgs } from 'node:util';
import { randomUUID } from 'node:crypto';
import { join, resolve, sep } from 'node:path';
import { createEvidenceStore } from '../evidence/index.mjs';
import { runCollection } from '../integration/index.mjs';

const usage = 'Usage: node src/cli/index.mjs collect --input <xlsx> [--device <serial>] [--run-id <id>]';
const RUN_ID = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;

export const parseCliArguments = (args) => {
  const { positionals, values } = parseArgs({
    args,
    options: {
      input: { type: 'string' },
      device: { type: 'string' },
      'run-id': { type: 'string' }
    },
    strict: true,
    allowPositionals: true
  });
  if (positionals.length !== 1 || positionals[0] !== 'collect' || !values.input) throw new Error(usage);
  return Object.freeze({ command: 'collect', input: values.input, device: values.device ?? null, runId: values['run-id'] ?? null });
};

export const createLocalRunPaths = (runId) => {
  if (!RUN_ID.test(runId)) throw new Error('CLI_RUN_ID_UNSAFE');
  const runsRoot = resolve(process.cwd(), 'runs');
  const runRoot = resolve(runsRoot, runId);
  if (!runRoot.startsWith(`${runsRoot}${sep}`)) throw new Error('CLI_RUN_ID_UNSAFE');
  return Object.freeze({
    checkpointPath: join(runRoot, 'checkpoint.json'),
    evidenceStore: createEvidenceStore(join(runRoot, 'evidence')),
    outputPath: resolve(process.cwd(), 'outputs', `dewu-${runId}.xlsx`)
  });
};

export const runCli = async ({ args, collection = runCollection, paths, agent } = {}) => {
  const parsed = parseCliArguments(args);
  const command = Object.freeze({ ...parsed, runId: parsed.runId ?? randomUUID() });
  const runtimePaths = paths ?? createLocalRunPaths(command.runId);
  if (typeof runtimePaths.checkpointPath !== 'string' || !runtimePaths.evidenceStore || typeof runtimePaths.outputPath !== 'string') throw new Error('CLI_RUNTIME_PATHS_REQUIRED');
  const result = await collection({
    inputPath: command.input,
    checkpointPath: runtimePaths.checkpointPath,
    evidenceStore: runtimePaths.evidenceStore,
    outputPath: runtimePaths.outputPath,
    agent,
    device: command.device
  });
  return Object.freeze({
    command,
    status: result.status,
    errorCode: result.errorCode,
    output: result.output,
    baseline: result.state?.baseline ?? 0
  });
};

const main = async () => {
  try {
    const result = await runCli({ args: process.argv.slice(2) });
    process.stdout.write(`${JSON.stringify(result)}\n`);
    process.exitCode = result.status === 'ready' ? 0 : 2;
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 2;
  }
};

if (import.meta.url === `file://${process.argv[1]}`) await main();
