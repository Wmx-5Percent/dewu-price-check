# 人工开发进度板

> 这里记录“你已经体验并验收到哪里”，不是 Agent 自报完成表。GitHub 是代码状态事实来源；本表是用户学习进度来源。

## 总状态

| 项目 | 状态 |
| --- | --- |
| 学习模式 | `LEARNING_MODE` |
| 当前步骤 | `G00.13` |
| 活跃生产 Developer | 0 |
| 活跃 QA | 0 |
| 活跃 Reviewer | 0 |
| 长期 Coordinator | 返回既有 Coordinator，重新执行 G00.13 判断 |
| 已合并模块 | 0 / 9 |
| 当前可启动 GitHub Issue | #1，但必须先完成治理基线 |

## 阶段进度

| 阶段 | Issue | 当前状态 | 用户是否体验 Developer→QA→Reviewer→Merge |
| --- | ---: | --- | --- |
| 治理基线 | 无 | 初轮 G00.10/G00.11 failed；G00.12 已完成，新的独立 G00.10/G00.11 均已通过；等待新的 G00.13 判断，未进入 G00.14 | 不适用 |
| W0 / MOD-00 Foundation | #1 | GitHub ready；尚未启动 | 否 |
| W1 / MOD-01 Environment | #2 | blocked by #1 | 否 |
| W1 / MOD-04 Jobs | #3 | blocked by #1 | 否 |
| W1 / MOD-05 Evidence | #4 | blocked by #1 | 否 |
| W1 / MOD-06 Export | #5 | blocked by #1 | 否 |
| W2 / MOD-02 Protocol | #6 | blocked by #1, #2 | 否 |
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
