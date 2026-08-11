# 当前唯一步骤

> 这是人工控制点。除非用户明确批准，任何 Agent 都不得修改本文件、勾选后续步骤或自动开始下一项。

| 字段 | 当前值 |
| --- | --- |
| 模式 | `AUTONOMOUS_DELIVERY_MODE` |
| 当前步骤 | `V05.11` |
| 状态 | `AUTONOMOUS_INDEPENDENT_QA` |
| 当前 Wave | W1 / MOD-05 Evidence |
| 当前模块 | `MOD-05 Evidence`（Issue #4） |
| 当前角色 | 新独立 MOD-05 QA |
| 当前打开任务 | 新独立 QA 复验 PR #23 head `af95daf` 的安全 persistence、redaction、hash、JSONL 与路径攻击边界 |
| 下一个任务 | QA PASS 后自动新建独立 Reviewer |
| 允许写代码 | 否 |
| 允许 commit/push/PR/merge | 否 |

## 你现在只做这一件事

Developer 已将 Evidence 最小切片推送至 Draft PR #23 head `af95dafd8f849d8120baf415ad28c9d1a8de3a3b`，变更仅 `src/evidence/index.mjs` 与 `test/evidence.test.mjs`。新独立 QA 必须用合成数据复验 allowlist redaction、秘密扫描、deterministic hash/correlation、JSON/JSONL 原子写与 cleanup、path/correlation 攻击拒绝。

不得修改生产代码、测试、Git/GitHub 或设备/系统；不得使用真实 APK/账号/数据/秘密。任何发现真实秘密、路径攻击无法安全处理、合同变更或破坏性操作时立即停止并报告 Coordinator。

## 这一小步完成的证据

- 报告精确 head、独立命令、秘密/路径/崩溃写入失败路径、hash traceability、范围与 CI；
- QA PASS 后自动启动新的独立 Reviewer，QA 不得担任 Reviewer/merge executor。

## 完成后怎么办

QA 报告后自动继续 Reviewer → CI → squash merge，除非触发自治暂停条件。

实时快照日期：2026-08-09。GitHub 状态会变化，Coordinator 每次必须重新读取，不能只相信这份快照。
