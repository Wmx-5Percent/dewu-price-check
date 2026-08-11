# 当前唯一步骤

> 这是人工控制点。除非用户明确批准，任何 Agent 都不得修改本文件、勾选后续步骤或自动开始下一项。

| 字段 | 当前值 |
| --- | --- |
| 模式 | `AUTONOMOUS_DELIVERY_MODE` |
| 当前步骤 | `V05.11` |
| 状态 | `AUTONOMOUS_SECOND_REPAIR_FRESH_QA` |
| 当前 Wave | W1 / MOD-05 Evidence |
| 当前模块 | `MOD-05 Evidence`（Issue #4） |
| 当前角色 | 独立 MOD-05 QA |
| 当前打开任务 | 对 PR #23 `584ff07e812e178d359f992fca3e75cff9acaf22` 进行第二轮返修后的隔离复验 |
| 受管任务 ID | 待 Coordinator 创建并记录；QA 完成后必须直接回传 Coordinator，并在 Issue #4 发布结构化报告 |
| 下一个任务 | QA PASS 自动 fresh Reviewer；同一 file-level symlink 边界再失败即暂停报告用户 |
| 允许写代码 | 否；仅隔离测试、GitHub Issue #4 QA 证据发布 |
| 允许 commit/push/PR/merge | 否 |

## 你现在只做这一件事

原 Developer 已将第二轮 file-level symlink 修复推送为 `584ff07`：拒绝非普通 JSONL/record 文件并用 `O_NOFOLLOW` 读取。QA 必须在 detached 隔离检出中，以纯合成外部文件验证绝对/相对 JSONL symlink 与 record symlink 都被拒绝、不会发生外部读写或 store 污染；同时复验 records 目录 symlink、20 路 JSONL append、测试套件、审计、diff 与 CI。

不得改 contracts/dependencies、设备/系统、真实 APK/账号/数据、Android/Frida、Jobs、Export 或 Integration；不得用追随/解析符号链接、删除外部目标或仅过滤返回值代替安全拒绝。任何合同变化、真实秘密、破坏性操作或此第二轮后仍未解的同一 symlink 边界必须停止报告 Coordinator。

## 这一小步完成的证据

- 精确 head 的 fresh 独立 QA 结构化报告已发布到 Issue #4，并直接回传 Coordinator；
- 若 PASS，自动启动 fresh Reviewer；若同一 symlink 边界再失败，停止并报告用户。

## 完成后怎么办

Developer 完成后自动 fresh QA → fresh Reviewer → CI → squash merge，除非触发自治暂停条件。

实时快照日期：2026-08-09。GitHub 状态会变化，Coordinator 每次必须重新读取，不能只相信这份快照。
