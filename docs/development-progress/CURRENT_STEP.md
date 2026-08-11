# 当前唯一步骤

> 这是人工控制点。除非用户明确批准，任何 Agent 都不得修改本文件、勾选后续步骤或自动开始下一项。

| 字段 | 当前值 |
| --- | --- |
| 模式 | `AUTONOMOUS_DELIVERY_MODE` |
| 当前步骤 | `V05.3–V05.10` |
| 状态 | `AUTONOMOUS_DEVELOPER_DELIVERY` |
| 当前 Wave | W1 / MOD-05 Evidence |
| 当前模块 | `MOD-05 Evidence`（Issue #4） |
| 当前角色 | MOD-05 Developer |
| 当前打开任务 | 新独立 Developer 在 Issue #4 允许范围内完成 Evidence 最小切片并创建 Draft PR |
| 下一个任务 | Developer 停止后自动新建独立 QA |
| 允许写代码 | 是，仅 `src/evidence/**` 与 Evidence 测试 |
| 允许 commit/push/PR/merge | Developer 可在现有 Issue 范围内 stage、commit、push、创建 Draft PR；不得 merge |

## 你现在只做这一件事

V05.1 审计已通过：#1 closed；#4 OPEN + `status:ready`；无 MOD-05 PR；远端 `main` at `40e0eb1` 的 CI 与 Secret Guard 通过。Developer 在 `agent/mod-05/4-evidence` 上实现仅使用合成数据的 Evidence 最小切片：allowlist redaction、hash/correlation、JSONL/atomic persistence 与 secret scanning。

不得改 contracts/dependencies、设备/系统、真实 APK/账号/数据、Android/Frida、Jobs、Export 或 Integration。任何发现真实秘密、路径攻击无法安全处理、合同变更或破坏性操作时立即停止并报告 Coordinator。

## 这一小步完成的证据

- Developer 发布精确 branch/head、允许路径 diff、synthetic-only evidence、开发自检与 Draft PR；
- 之后自动启动新的独立 QA，且 Developer 不得担任 QA/Reviewer/merge executor。

## 完成后怎么办

Developer 完成后停止；Coordinator 自动继续 QA → Reviewer → CI → squash merge，除非触发自治暂停条件。

实时快照日期：2026-08-09。GitHub 状态会变化，Coordinator 每次必须重新读取，不能只相信这份快照。
