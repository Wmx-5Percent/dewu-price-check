# 当前唯一步骤

> 这是人工控制点。除非用户明确批准，任何 Agent 都不得修改本文件、勾选后续步骤或自动开始下一项。

| 字段 | 当前值 |
| --- | --- |
| 模式 | `AUTONOMOUS_DELIVERY_MODE` |
| 当前步骤 | `V05.12` |
| 状态 | `AUTONOMOUS_DEVELOPER_P1_REPAIR` |
| 当前 Wave | W1 / MOD-05 Evidence |
| 当前模块 | `MOD-05 Evidence`（Issue #4） |
| 当前角色 | 原 MOD-05 Developer |
| 当前打开任务 | 原 Developer 修复 PR #23 的 symlink containment 与 concurrent JSONL append 两项 P1 |
| 下一个任务 | 修复推送后自动新建 fresh independent QA |
| 允许写代码 | 是，仅 `src/evidence/**` 与 Evidence 测试 |
| 允许 commit/push/PR/merge | 可精确 stage、commit、push 现有模块分支；不得 ready/merge |

## 你现在只做这一件事

独立 QA 在 PR #23 head `af95dafd8f849d8120baf415ad28c9d1a8de3a3b` 发现两项 P1：`records/` 中间目录符号链接可逃逸到 store 外；并发 `appendEvidenceLog()` 的 read-modify-write 会丢记录。原 Developer 必须仅在允许路径中修复两项 P1 并添加合成回归测试。

不得改 contracts/dependencies、设备/系统、真实 APK/账号/数据、Android/Frida、Jobs、Export 或 Integration；不得以串行化调用方、降低需求或仅测试 mock 掩盖 JSONL 并发正确性。任何合同变化、真实秘密、破坏性操作或两轮未解返工时停止报告 Coordinator。

## 这一小步完成的证据

- 修复 must reject symlink directory escape and preserve all records under concurrent JSONL appends; report exact commit/head and developer checks;
- 新 head 推送后自动创建新的独立 QA，且原 QA/Developer 均不得担任该 fresh QA。

## 完成后怎么办

Developer 推送修复后自动继续 fresh QA → fresh Reviewer → CI → squash merge，除非触发自治暂停条件。

实时快照日期：2026-08-09。GitHub 状态会变化，Coordinator 每次必须重新读取，不能只相信这份快照。
