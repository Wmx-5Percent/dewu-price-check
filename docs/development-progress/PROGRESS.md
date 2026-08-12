# 人工开发进度板

> GitHub 是代码与依赖状态事实来源；本表记录当前 Coordinator 流程。

## 总状态

| 项目 | 状态 |
| --- | --- |
| 模式 | `AUTONOMOUS_DELIVERY_MODE` |
| 当前步骤 | `I07.14`（MOD-07 serial identity P1 暂停） |
| 活跃生产 Developer | 0（PR #30 已更新为 `ca4c4a7`） |
| 活跃 QA / Reviewer | 0 / 0 |
| 长期 Coordinator | Reviewer 发现 ready-but-wrong-device serial identity P1；等待用户精确授权，真实 pilot 未执行 |
| 已合并模块 | 7 / 9（MOD-00 / #1；MOD-01 / #2；MOD-04 / #3；MOD-05 / #4；MOD-06 / #5；MOD-02 / #6；MOD-03 / #7） |
| 当前可启动 GitHub Issue | #8（Integration）；真实库存 pilot 仅本机，需先通过 Agent/Profile/session/schema 守卫 |

## 阶段进度

| 阶段 | Issue | 当前状态 | Developer→QA→Reviewer→Merge |
| --- | ---: | --- | --- |
| W0 / MOD-00 Foundation | #1 | merged / closed | 是 |
| W1 / MOD-01 Environment | #2 | merged / closed | 是 |
| W1 / MOD-04 Jobs | #3 | merged / closed | 是 |
| W1 / MOD-05 Evidence | #4 | merged / closed | 是 |
| W1 / MOD-06 Export | #5 | merged / closed | 是 |
| W2 / MOD-02 Protocol | #6 | merged / closed；live Profile 仍 fail-closed | 是 |
| W3 / MOD-03 Frida Agent | #7 | PR #29 merged / closed；live Profile 仍 fail-closed | 是 |
| W4 / MOD-07 Integration | #8 | ready-but-wrong-device serial identity P1，等待用户授权；真实 pilot 未执行 | 暂停 |
| W5 / MOD-08 QA & Portability | #9 | blocked by #2–#8 | 否 |
| W6 / Full Run | #10 | blocked by #9 | 否 |

## 更新规则

- 每次角色派发前，Coordinator 将相关进度更新提交并推送到基于最新 `origin/main` 的共享分支。
- Developer、QA、Reviewer 必须以该远端 SHA 为读取基线，并直接回传结构化报告。
