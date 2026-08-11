# AGENTS.md — Dewu Price Check

This file contains repository-wide instructions for every Codex task. Keep it concise and operational. The project master plan remains the product source of truth:

- `docs/plan/2026-08-09-dewu-collection-master-plan.md`
- GitHub repository: `Wmx-5Percent/dewu-price-check`
- GitHub Issues are the current source of truth for module status and dependencies.

If instructions conflict, follow this order: the user's current request, the master plan, the assigned GitHub Issue/contract, the current atomic card under `docs/development-progress/`, then this file. Do not invent requirements to fill a gap; report a material ambiguity to the coordinator.

## Product Boundary

Build a portable response-level collector: Node.js 22 CLI + controlled Root Android Emulator + Frida Agent. The host passes business inputs; the Agent reuses the logged-in Dewu process for session, device parameters, request construction, and signing.

- Production collection must not perform per-SKU UI typing, clicking, scrolling, fixed-coordinate actions, fixed sleeps, or UI XML parsing.
- UI is allowed only for first login, protocol discovery, same-time accuracy comparison, and manual review.
- Search must send the validated server-side `sales_desc` parameter and select response item 1. Never fetch default results and sort them locally.
- The first profile is Dewu `5.95.1 (versionCode 1101)`. Unknown versions, failed hooks, or schema drift are global blockers, never silent fallbacks.
- Frida client and Android server are both pinned to `17.16.4`.
- The deliverable workbook has exactly six columns defined in master-plan section 5. Internal evidence must not expand that contract.
- Android companion APK, non-root-device support, public app-store distribution, signature reimplementation, and a Dewu-App-free client are out of v1 scope.

## Start-of-Task Gate

Before editing anything, the agent must:

1. Read this file, `docs/development-progress/README.md`, `docs/development-progress/CURRENT_STEP.md`, the relevant Wave progress file, the relevant master-plan sections, and the assigned GitHub Issue.
2. Check the Issue's `Blocked by` dependencies, current status, open PRs, and failed CI. Do not start a blocked Wave.
3. State the assigned role, module, Issue number, worktree/branch, allowed paths, direct dependencies, and acceptance evidence.
4. Inspect the repository, lockfile, existing imports, contracts, and tests before proposing a new dependency or implementation.
5. Check `git status` and preserve user changes. Never overwrite or clean unrelated work.

If no module Issue or role has been assigned, do not begin production implementation. Planning, diagnosis, or read-only review may proceed within the user's request.

## Delivery Modes and Progress Gate

The files under `docs/development-progress/` are the user-operation source of truth. They do not replace GitHub's code status or the master plan.

### `LEARNING_MODE`

- `CURRENT_STEP.md` names the only atomic step an agent may execute. Perform one step, report its evidence, and stop.
- Only the user can accept a step or authorize the next one. Commit, push, PR creation, ready-for-review, merge, system/device modification, and progress advancement are separate permissions.
- At most one production Developer is active. QA begins after the Developer stops; Reviewer begins after QA reports. W1 modules remain serial unless the user selects another mode.

### `AUTONOMOUS_DELIVERY_MODE`

- The Coordinator may automatically advance approved Issues through Developer → independent QA → independent Reviewer → CI → squash merge → progress update, and select the next dependency-ready module.
- The current progress card remains an evidence checklist, not a per-checkbox stop gate. The Coordinator must publish milestone evidence and keep `CURRENT_STEP.md`/`PROGRESS.md` current.
- Developer, QA, Reviewer, and merge executor remain separate roles for the same production change. A failed QA or Reviewer pass returns to the original Developer, then requires a fresh independent QA and Reviewer.
- If the same issue remains unresolved after two consecutive repair rounds, stop and report to the user instead of continuing.
- Pause for explicit user authorization before device/system modification, real APK/account/data use, risk or login anomaly handling, contract changes, destructive operations, costs, or external publication. Also pause for a material GitHub/progress conflict.

### All modes

- Keep one long-lived Coordinator task. Create a distinct task/chat for each module Developer, independent QA pass, and independent Reviewer pass. A same-PR fix returns to its original Developer.
- Before creating or dispatching a new Developer, QA, or Reviewer task, publish the task-relevant Coordinator context to the shared repository and name its remote SHA in the handoff.
- Do not push directly to `main` or force-push shared branches. A Coordinator may use the authorized coordination branch/PR workflow.
- If GitHub live state conflicts with progress records, resolve and record the mismatch before normal delivery continues.
- **Coordinator cross-task synchronization.** Before creating or dispatching any new Developer, QA, or Reviewer task, the Coordinator must first commit and push every task-relevant Coordinator change (progress records, governance decisions, approved contracts, and handoff documents) to the shared repository. Never assume another worktree can see the Coordinator's uncommitted files or chat history. Do not push directly to `main`: use an authorized coordination branch/PR or an already merged commit. The new task must start from the named remote SHA and receive a concise handoff containing role, Issue, allowed paths, dependencies, evidence, and stop condition. If the required Coordinator change is not yet authorized for publication, stop and ask for that publication authorization rather than opening a task against stale state.
- Emergency read-only diagnosis and actions needed to prevent immediate data loss may interrupt the sequence, but normal development must not continue until the user and Coordinator establish a new current step.

## Role Separation

One task/chat must have one role. A person or agent must not be author, independent QA, and reviewer for the same change.

### Coordinator

- Owns decomposition, readiness checks, contract decisions, progress monitoring, and merge order.
- Does not implement a production module or silently finish a blocked module.

### Module Developer

- Owns exactly one `MOD-XX` module, one Issue, one worktree, one branch, and one draft PR.
- Changes only the Issue's allowed paths and public contracts already approved by `MOD-00`.
- May run existing checks and add narrow developer/unit coverage required by the Issue. This is self-check evidence, not independent QA approval.
- Does not review or merge its own PR and does not claim the QA gate passed.

### QA Agent

- Uses a separate task/chat and, when test code changes, a separate branch/worktree.
- Writes or runs contract, failure, regression, security, portability, and acceptance tests without editing production implementation.
- Reports reproducible failures to the module Issue/PR; the module developer fixes them.

### Reviewer

- Uses a separate task/chat and reviews the diff, contracts, risks, and evidence.
- Is read-only for the reviewed change: it does not patch the code it is approving.
- Approves only after CI and independent QA evidence satisfy the Issue.

### Integration Agent

- Owns `MOD-07` only: composition, adapters, CLI wiring, and end-to-end data flow.
- Does not copy or reimplement missing upstream module logic in the integration layer.

## Module Ownership

| Module | Scope | Primary paths | Direct dependencies |
| --- | --- | --- | --- |
| `MOD-00 Foundation` | Repository skeleton, public contracts, schemas, errors, config, CI baseline | `package*.json`, `schemas/`, shared contracts, `.github/` | none |
| `MOD-01 Environment` | SDK/AVD/ADB/Root/Frida bootstrap and doctor | `src/environment/`, environment scripts | `MOD-00` |
| `MOD-02 Protocol Discovery` | Hook discovery, response correlation, redacted fixtures, profiles | `src/discovery/`, `profiles/`, approved fixtures | `MOD-00`, `MOD-01` |
| `MOD-03 Frida Agent` | In-process RPC and version/session/schema guards | `agent/`, `src/frida/` | `MOD-00`, `MOD-01`, `MOD-02` |
| `MOD-04 Jobs` | Input, baseline, states, concurrency, retry, resume | `src/jobs/` | `MOD-00` |
| `MOD-05 Evidence` | Atomic persistence, redaction, hashes, logs, secret scanning | `src/evidence/` | `MOD-00` |
| `MOD-06 Export` | Strict six-column Excel output and validation | `src/export/` | `MOD-00` |
| `MOD-07 Integration` | Unified CLI, adapters, orchestration wiring, end-to-end flow | `src/cli/`, `src/integration/` | `MOD-03`–`MOD-06` |
| `MOD-08 QA & Portability` | CI gates, integration/failure tests, second-computer release evidence | `test/`, CI test workflows, test docs | `MOD-01`–`MOD-07` |

Private module files are not APIs. A shared-interface change must first be proposed as a contract Issue and versioned by `MOD-00`; affected module agents then update their own paths. Never bypass this by importing another module's private file or duplicating its implementation.

## Waves and Dependency Gates

- `W0`: `MOD-00`.
- `W1`: `MOD-01`, `MOD-04`, `MOD-05`, `MOD-06` after `MOD-00` is merged.
- `W2`: `MOD-02` after the `MOD-01` Root/Frida smoke test.
- `W3`: `MOD-03` after the versioned profile is merged.
- `W4`: `MOD-07` after `MOD-03`–`MOD-06` are merged on one contract version.
- `W5`: `MOD-08` after integration is merged.
- `W6`: execute the released build only; do not add production features.

Never bypass a dependency gate because of schedule pressure. Record blockers in GitHub, not only in chat.

## Engineering Principles

Write the least code that safely runs and satisfies the current Issue.

1. **No speculative compatibility.** Before v1 release, remove obsolete internal implementations instead of adding compatibility wrappers, dual paths, migrations, or silent fallbacks. This never authorizes data loss: real inventory, evidence, checkpoints, credentials, App/device data, and published contracts require an explicit Issue, backup, dry run, validation, and reversible rollout.
2. **Choose the simplest sufficient design.** Do not add premature abstractions, generic frameworks, plugin systems, or one-off configuration layers.
3. **Deliver a thin vertical slice first.** Keep the smallest end-to-end path runnable, then extend it. Do not dismantle a working path for unfinished complexity.
4. **Keep concerns modular.** Depend on versioned contracts, not internal files. Avoid god modules and cross-module state.
5. **Reuse mature, maintained libraries.** Do not rewrite solved functionality without measured need or a documented constraint.
6. **Inspect before adding.** Check `package.json`, `package-lock.json`, existing imports, Node built-ins, and current contracts before adding a package or utility.
7. **Make durable architecture decisions.** Reject “temporary now, replace later” paths that contradict the confirmed product boundary. When evidence changes, record an ADR/Issue and deliberately replace the old path.
8. **Use validated patterns.** Consult primary documentation and established tools before inventing a protocol, persistence format, test harness, or security mechanism.
9. **Publish task context before delegation.** A Coordinator's local workspace and chat are not shared state. Before delegating, publish the relevant Coordinator state to the repository and identify the remote SHA; every new task must be able to reconstruct its required context from that SHA, the assigned Issue/PR, and its written handoff.

Do not retain dead code, commented-out alternatives, duplicate utilities, or “just in case” switches. Git history provides code rollback; explicit run-state backups provide data rollback.

## Approved Toolchain

- Node.js `22.x`, ESM JavaScript, `package-lock.json`, and `npm ci`.
- Production packages: `frida@17.16.4`, `exceljs@4.4.0`, `ajv@8.17.1`.
- Prefer Node built-ins: `fetch`, `util.parseArgs`, `crypto`, `fs`, and `node:test`.
- Do not add Axios, Commander, P-limit, another schema validator, or a second Excel library without an approved dependency/contract Issue.
- Java 17, Android SDK command-line tools, Platform Tools/ADB, Emulator, and `system-images;android-35;google_apis;arm64-v8a` are the v1 Android baseline.
- Runtime code must not depend on global npm packages, current-user absolute paths, Codex cache paths, fixed AVD names, fixed serials, or `@oai/artifact-tool`.

Dependency upgrades are feature changes, not housekeeping, when they affect Frida, Android API, the Dewu profile, stored evidence, or public contracts. They require a compatibility Issue and regression evidence.

## Data, Security, and Safe Operations

The GitHub repository is public. Never commit or upload:

- real inventory or customer/business data;
- Dewu APKs or extracted private App data;
- cookies, tokens, authorization headers, signing material, device identifiers, or credentials;
- raw responses, unredacted logs, or screenshots containing secrets.

Only synthetic inputs and manually reviewed redacted fixtures may enter Git. Evidence persistence uses an allowlist plus redaction before disk write and must remain traceable by correlation ID and evidence hash.

- Never bypass CAPTCHA, risk controls, rate limits, login checks, Android security, or privacy controls.
- On login loss, 429/risk response, Frida disconnect, unknown App/Profile version, schema drift, or emulator failure: atomically save state, mark a global blocker, and stop later tasks.
- Resolve destructive targets with read-only checks. Never recursively delete broad paths, user inventory, emulator/device state, or evidence stores. Material deletion requires explicit user authorization and a recovery plan.
- Use the same explicit device serial for ADB and Frida. If multiple devices are online and no serial is supplied, stop and request selection.

## Implementation and Test Discipline

- Add only behavior required by the assigned Issue and its public contract.
- Keep external I/O behind narrow adapters so fixtures can test orchestration without a live account or device.
- Persist each completed SKU atomically. Restarting must skip completed work and resume unfinished work.
- Do not guess response fields or replace missing fields with another plausible path. A failed profile assertion is a blocker.
- Do not convert Dewu size text, filter it by inventory size, infer missing prices, or split product-level sales by size.
- Do not change the six-column export contract without a master-plan and `MOD-00` contract change.

For documentation-only changes, run `git diff --check`. Before `MOD-00` establishes package scripts, the legacy core check is:

```sh
node --test scripts/test_dewu_collection_core.mjs
```

After `package-lock.json` and CI scripts exist, use the exact Issue commands, normally:

```sh
npm ci
npm test
```

Never claim a live AVD, Frida, login, same-time UI comparison, second-computer, or performance test ran when only fixtures ran. Developer self-checks, independent QA, reviewer approval, and CI are separate evidence entries.

## GitHub Workflow

- Issue: `[MOD-XX][Wn] <module>` with allowed paths, non-goals, dependencies, contract version, test commands, evidence, and security notes.
- Branch: `agent/mod-XX/<issue-number>-<slug>`.
- PR: `[MOD-XX] <change>`, opened as draft, containing `Closes #<issue>`, contract version, changed paths, tests, evidence, blockers, and incomplete work.
- Do not develop or push directly on `main`; do not force-push shared branches.
- Prefer small, reviewable commits and squash merge after gates pass. The author never merges its own PR.
- At start, blocker, draft PR, CI completion, and merge readiness, update the Issue with exactly: `Completed / Current / Blockers / Tests / Next`.
- Commit, push, PR, merge, release, or external publication only when the user's authorization covers that action.

## Definition of Done

A module/feature is done only when:

1. The assigned scope and versioned contracts are implemented without cross-module leakage.
2. Required developer checks are recorded with exact commands and results.
3. A separate QA agent records independent test evidence, including relevant failure paths.
4. A separate reviewer finds no unresolved correctness, security, data-loss, portability, or contract issue.
5. Required CI and, when applicable, controlled live-device gates pass.
6. Documentation and the Issue status match the implementation.
7. The PR is merged in dependency order by an authorized non-author.

## Code Review Rules

Flag these as blocking unless the master plan explicitly changes:

- Production code performs per-SKU UI interaction, fixed-coordinate/fixed-sleep automation, or UI XML scraping. Safe path: response-level RPC; UI only for discovery or comparison.
- Search omits the validated server-side sales sort or sorts default results locally. Safe path: assert the profile's `sales_desc` request and select response item 1.
- Unknown Dewu version, failed hook, missing field, schema drift, login loss, or risk response silently falls back or returns empty success. Safe path: persist state and raise a global blocker.
- Secrets, real inventory, APKs, raw responses, device identifiers, or unredacted logs can enter Git, CI artifacts, or ordinary JSON. Safe path: synthetic/redacted fixtures and allowlisted evidence.
- A change imports another module's private file, copies its logic, or edits paths outside the assigned Issue. Safe path: version the `MOD-00` contract, then update each owner module.
- A dependency duplicates a Node built-in or approved library without demonstrated need. Safe path: reuse the existing toolchain or open a dependency Issue.
- Checkpoint/evidence writes are non-atomic, completed tasks can be repeated after restart, or a global blocker allows later SKUs to continue.
- Export has anything other than the six approved columns, mutates Dewu size text, invents missing data, or exposes internal evidence fields.
- Code or configuration embeds a username, SDK absolute path, AVD name, serial, screen coordinate, or Codex-local cache path.
- A destructive migration/deletion lacks explicit scope, backup, dry run, verification, user authorization, or rollback instructions.
- The author is also presented as independent QA/reviewer, or a PR is merged without CI and non-author approval.
