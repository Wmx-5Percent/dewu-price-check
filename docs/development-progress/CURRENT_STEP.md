# 当前唯一步骤

> 这是人工控制点。除非用户明确批准，任何 Agent 都不得修改本文件、勾选后续步骤或自动开始下一项。

| 字段 | 当前值 |
| --- | --- |
| 模式 | `LEARNING_MODE` |
| 当前步骤 | `J04.14` |
| 状态 | `WAITING_FOR_ORIGINAL_JOBS_DEVELOPER_P1_REPAIR` |
| 当前 Wave | W1 / MOD-04 Jobs |
| 当前模块 | `MOD-04 Jobs`（Issue #3） |
| 当前角色 | 原 MOD-04 Developer |
| 当前打开任务 | 原 Developer；修复 PR #20 的实际 `1 → 2 → 4` 自适应并发 P1，同时保持 global blocker 后零后续启动 |
| 下一个任务 | 无；Developer 推送可测试修复后才可新建独立 QA |
| 允许写代码 | 是，仅 `src/jobs/index.mjs`、`test/jobs.test.mjs` |
| 允许 commit/push/PR/merge | 仅在本次修复完成、用户既有授权范围内推送现有模块分支；不得 ready/merge |

## 你现在只做这一件事

在原 MOD-04 worktree 的 PR #20 分支上，修复实际自适应 `1 → 2 → 4` 并发：在成功且稳定的窗口逐级提升实际同时处理 SKU 的数量，最高 4；一旦某任务产生全局 blocker，尚未开始的后续 SKU 不得启动。补充覆盖实际峰值、窗口内 blocker 与 checkpoint 的回归测试。

不得改合同、依赖、设备/UI、真实数据或其他路径；不得 ready、merge 或删除分支。不得以仅更新 `state.concurrency` 伪装实际并发。

## 这一小步完成的证据

- 报告变更文件、实际并发探针/测试、blocker 行为、checkpoint 结果与 developer self-check；
- 明确提交/push 的精确 SHA，且仅更新既有 Draft PR #20；
- 最后一行明确写“等待用户验收 Developer 修复并新建独立 QA”。

## 完成后怎么办

Developer 推送修复后停止；不得自行创建 QA、Reviewer、改变 PR 状态或 merge。

实时快照日期：2026-08-09。GitHub 状态会变化，Coordinator 每次必须重新读取，不能只相信这份快照。
