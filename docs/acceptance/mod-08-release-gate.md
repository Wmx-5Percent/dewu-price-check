# MOD-08 release-gate evidence

This document is the W5 evidence ledger. It deliberately separates repeatable, synthetic CI evidence from the controlled live-device and second-computer evidence that cannot be manufactured in GitHub Actions.

## Automated fixture gate

The `Release gate fixtures` workflow runs on macOS, Ubuntu, and Windows with Node 22 and `npm ci --ignore-scripts`.

- `test/release-gate.test.mjs` creates 50 synthetic SKU inputs and verifies the public integration path writes and reopens an exact six-column workbook in less than five seconds. This is a fixture performance regression threshold, not a Dewu network throughput claim.
- It injects a secret-shaped response and requires a global blocker with no workbook output.
- It verifies a retryable synthetic failure is checkpointed and only the unfinished SKU is retried.
- Existing CI jobs continue to cover contracts, units, redaction, export contract, integration fixtures, dependency pins, and secret guard.

No live Dewu request, real SKU, account, APK, device serial, raw response, token, or evidence is used by this workflow.

## Required controlled evidence before W6

The following records must be published to Issue #9 by an independent Release QA. Do not mark them complete based on fixture tests.

| Gate | Required evidence | Current status |
| --- | --- | --- |
| Full Frida installation | A clean Node 22 install using the documented hash-verified, temporary official prebuild cache, then `import('frida')` | Pending independent confirmation for the release SHA |
| Controlled device smoke | An explicitly selected dedicated Root AVD, matching ADB/Frida serial, App/profile/session guards, and no UI SKU automation | Pending; requires separate device/account authorization |
| Failure recovery | A controlled blocker or disconnect saves state and leaves later tasks pending without partial output | Automated fixture coverage only; live confirmation pending |
| 50-SKU performance | A locally authorized, non-throttled run records elapsed time and output validation without publishing real input/output | Pending; requires real-data/device authorization |
| Second compatible computer | Fresh checkout at release SHA, Node 22, clean install, fixture suite, and environment doctor report; no credentials/APK copied | Pending independent computer evidence |

## Evidence publication rules

- Issue/PR reports identify the exact release SHA, role, commands, exit codes, operating system and Node version, but never real SKU values, device serials, account details, tokens, cookies, raw requests/responses, APKs, or generated real-result workbooks.
- Keep any authorized real-run input, evidence, checkpoints, and result workbook local. Before a manual review, inspect the strict six-column workbook only; do not attach it to GitHub.
- A login loss, risk response, unknown profile/version, schema drift, Frida disconnect, or emulator failure is a global blocker. Save the permitted state atomically, redact the report, and stop later SKU work.
- GitHub-hosted CI remains fixture-only. Any Root AVD, logged-in Dewu, or Frida live check runs manually on an approved self-hosted environment.
