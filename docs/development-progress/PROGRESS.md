# 人工开发进度板

> 这里记录“你已经体验并验收到哪里”，不是 Agent 自报完成表。GitHub 是代码状态事实来源；本表是用户学习进度来源。

## 总状态

| 项目 | 状态 |
| --- | --- |
| 学习模式 | `LEARNING_MODE` |
| 当前步骤 | `J04.14` |
| 活跃生产 Developer | 1（`MOD-04` / concurrency P1 repair） |
| 活跃 QA | 0 |
| 活跃 Reviewer | 0 |
| 长期 Coordinator | 等待原 Developer 修复 PR #20 的实际自适应并发 P1 |
| 已合并模块 | 2 / 9（MOD-00 / #1；MOD-01 / #2） |
| 当前可启动 GitHub Issue | #3 为学习模式的当前候选；#4、#5、#6 均为 ready，但暂不并行 |

## 阶段进度

| 阶段 | Issue | 当前状态 | 用户是否体验 Developer→QA→Reviewer→Merge |
| --- | ---: | --- | --- |
| 治理基线 | 无 | G00.1–G00.15 已完成并已合并到远端 main | 不适用 |
| W0 / MOD-00 Foundation | #1 | 已由 PR #13 squash merge；Issue closed | 是 |
| W1 / MOD-01 Environment | #2 | PR #19 已 squash merge；Issue closed；Root/Frida smoke 已通过 | 是 |
| W1 / MOD-04 Jobs | #3 | Reviewer 发现实际并发峰值固定为 1 的 P1；原 Developer 正在返修 | 否 |
| W1 / MOD-05 Evidence | #4 | ready candidate；学习模式等待 MOD-01 完整流程 | 否 |
| W1 / MOD-06 Export | #5 | ready candidate；学习模式等待 MOD-01 完整流程 | 否 |
| W2 / MOD-02 Protocol | #6 | ready；#1、#2 已合并，Root/Frida smoke 已通过；学习模式暂不启动 | 否 |
| W3 / MOD-03 Frida Agent | #7 | blocked by #1, #2, #6 | 否 |
| W4 / MOD-07 Integration | #8 | blocked by #3, #4, #5, #7 | 否 |
| W5 / MOD-08 QA & Portability | #9 | blocked by #2–#8 | 否 |
| W6 / Full Run | #10 | blocked by #9 | 否 |

## 更新规则

- 只有用户明确同意后，Coordinator 才能修改本表。
- 每次最多修改一行状态和一个当前步骤。
- “Developer 完成”不能写成“模块完成”；模块必须等独立 QA、Reviewer、CI 和 merge。
- 返工时状态退回前一步，不删除历史证据。
- GitHub 状态与本表不一致时先暂停，由 Coordinator解释差异。
