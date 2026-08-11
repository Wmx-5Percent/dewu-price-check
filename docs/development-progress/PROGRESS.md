# 人工开发进度板

> 这里记录“你已经体验并验收到哪里”，不是 Agent 自报完成表。GitHub 是代码状态事实来源；本表是用户学习进度来源。

## 总状态

| 项目 | 状态 |
| --- | --- |
| 学习模式 | `AUTONOMOUS_DELIVERY_MODE` |
| 当前步骤 | `P02.14`（MOD-02 fail-closed repair） |
| 活跃生产 Developer | 1（MOD-02 original Developer repair） |
| 活跃 QA | 0 |
| 受管 QA 任务 | `/root/mod02_single_sku_qa`（终态 PASS；Issue #6 已发布） |
| 活跃 Reviewer | 0 |
| 受管 QA 任务 | `/root/mod05_p1_retest_qa`（终态 PASS；Issue #4 已发布）；`/root/mod05_second_symlink_qa`（终态 PASS；Issue #4 已发布） |
| 活跃 Reviewer | 0 |
| 受管 Reviewer 任务 | `/root/mod05_final_reviewer`（终态 REQUEST_CHANGES；Issue #4 已发布）；`/root/mod05_second_symlink_reviewer`（终态 APPROVE；Issue #4 已发布） |
| 长期 Coordinator | MOD-02 Reviewer found synthetic evidence incorrectly unlocks Profile; original Developer repairing fail-closed boundary |
| 已合并模块 | 5 / 9（MOD-00 / #1；MOD-01 / #2；MOD-04 / #3；MOD-05 / #4；MOD-06 / #5） |
| 当前可启动 GitHub Issue | #6 为 ready；MOD-02 Developer 启动中 |

## 阶段进度

| 阶段 | Issue | 当前状态 | 用户是否体验 Developer→QA→Reviewer→Merge |
| --- | ---: | --- | --- |
| 治理基线 | 无 | G00.1–G00.15 已完成并已合并到远端 main | 不适用 |
| W0 / MOD-00 Foundation | #1 | 已由 PR #13 squash merge；Issue closed | 是 |
| W1 / MOD-01 Environment | #2 | PR #19 已 squash merge；Issue closed；Root/Frida smoke 已通过 | 是 |
| W1 / MOD-04 Jobs | #3 | PR #20 已 squash merge 至 `main`；Issue closed | 是 |
| W1 / MOD-05 Evidence | #4 | PR #23 已 squash merge；Issue closed | 是 |
| W1 / MOD-06 Export | #5 | PR #27 已 squash merge；Issue closed | 是 |
| W2 / MOD-02 Protocol | #6 | Reviewer P1/P2：原 Developer 修复 fail-closed/closed-world 边界 | 否 |
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
