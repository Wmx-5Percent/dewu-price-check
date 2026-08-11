# 当前唯一步骤

> 这是人工控制点。除非用户明确批准，任何 Agent 都不得修改本文件、勾选后续步骤或自动开始下一项。

| 字段 | 当前值 |
| --- | --- |
| 模式 | `LEARNING_MODE` |
| 当前步骤 | `J04.11` |
| 状态 | `WAITING_FOR_INDEPENDENT_JOBS_QA_CONCURRENCY_RETEST` |
| 当前 Wave | W1 / MOD-04 Jobs |
| 当前模块 | `MOD-04 Jobs`（Issue #3） |
| 当前角色 | 新建独立 MOD-04 QA |
| 当前打开任务 | 新独立 QA；复验 PR #20 head `73d7d76` 的实际窗口化 `1 → 2 → 4` 并发、blocker 边界与 checkpoint |
| 下一个任务 | 无；QA PASS 后才可新建独立 Reviewer |
| 允许写代码 | 否 |
| 允许 commit/push/PR/merge | 否 |

## 你现在只做这一件事

在隔离 worktree 的 PR #20 head `73d7d76b8da1b025238a751ec9c54b78319a58e7` 上独立复验实际窗口化 `1 → 2 → 4` 并发、窗口内/窗口后 global blocker 边界、checkpoint 原子性、恢复、重试与大小写去重。

不得修改文件、Git 或 GitHub；不得触碰设备/真实数据、合同或依赖；不得 stage、commit、push、PR、ready、merge 或删除分支。

## 这一小步完成的证据

- 报告精确 head、独立命令/结果、实际并发序列/峰值、blocker 边界、checkpoint 与范围/CI 核对；
- 明确说明未修改任何文件或 Git/GitHub 状态；
- 最后一行明确写“等待用户验收 J04.11 复验并新建独立 Reviewer”。

## 完成后怎么办

QA 报告后停止；不得自行创建 Reviewer 或改变 PR 状态、merge。

实时快照日期：2026-08-09。GitHub 状态会变化，Coordinator 每次必须重新读取，不能只相信这份快照。
