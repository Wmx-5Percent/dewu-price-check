# 当前唯一步骤

> 这是人工控制点。除非用户明确批准，任何 Agent 都不得修改本文件、勾选后续步骤或自动开始下一项。

| 字段 | 当前值 |
| --- | --- |
| 模式 | `AUTONOMOUS_DELIVERY_MODE` |
| 当前步骤 | `V05.13` |
| 状态 | `AUTONOMOUS_SECOND_REPAIR_FRESH_REVIEW` |
| 当前 Wave | W1 / MOD-05 Evidence |
| 当前模块 | `MOD-05 Evidence`（Issue #4） |
| 当前角色 | 独立 MOD-05 Reviewer |
| 当前打开任务 | 审查 PR #23 `584ff07e812e178d359f992fca3e75cff9acaf22`，并核对第二轮返修 QA 证据 |
| 受管任务 ID | `/root/mod05_second_symlink_reviewer`（Reviewer 完成后必须直接回传 Coordinator，并在 Issue #4 发布结构化报告） |
| 下一个任务 | Reviewer APPROVE 且 CI 仍通过时自动进行 merge readiness 与非作者 squash merge；同一 symlink 边界再失败即暂停报告用户 |
| 允许写代码 | 否；仅只读审查、GitHub Issue #4 Reviewer 证据发布 |
| 允许 commit/push/PR/merge | 否 |

## 你现在只做这一件事

第二轮 QA 已 PASS `584ff07` 并在 Issue #4 留存精确 head 证据。fresh Reviewer 必须在 detached 隔离检出中复审全部 diff、修复的 file-level 与目录 symlink containment、并发 append、合同/范围、QA 证据和实时 CI；不得修改代码。

不得改 contracts/dependencies、设备/系统、真实 APK/账号/数据、Android/Frida、Jobs、Export 或 Integration；不得用追随/解析符号链接、删除外部目标或仅过滤返回值代替安全拒绝。任何合同变化、真实秘密、破坏性操作或此第二轮后仍未解的同一 symlink 边界必须停止报告 Coordinator。

## 这一小步完成的证据

- 精确 head 的 fresh 独立 Reviewer 结构化报告已发布到 Issue #4，并直接回传 Coordinator；
- 若 APPROVE 且 CI 仍通过，自动执行 merge readiness 和非作者 squash merge；若同一 symlink 边界再失败，停止并报告用户。

## 完成后怎么办

Developer 完成后自动 fresh QA → fresh Reviewer → CI → squash merge，除非触发自治暂停条件。

实时快照日期：2026-08-09。GitHub 状态会变化，Coordinator 每次必须重新读取，不能只相信这份快照。
