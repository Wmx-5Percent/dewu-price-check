# Q08：W5 / MOD-08 QA & Portability

| 项目 | 内容 |
| --- | --- |
| GitHub Issue | #9 |
| 实现任务 | `[DEV][MOD-08][#9] QA infrastructure` |
| 独立执行任务 | `[QA-RELEASE][MOD-08][#9] Release gate` |
| 分支 | `agent/mod-08/9-qa-portability` |
| 依赖 | #2–#8 全部已合并 |
| 主要路径 | `test/`、CI 测试 workflow、测试文档 |

MOD-08 的 Developer 编写测试基础设施，但不能自己给发布门 PASS。必须另开 Release QA 执行这些测试，再由 Reviewer 审查证据。

## 逐步清单

- [x] `Q08.1` Coordinator 核对 #2–#8 均为 closed；初始基线 `d83ecc7`，Issue #9 已同步为 `status:ready`。
- [x] `Q08.2`–`Q08.5` AUTONOMOUS_DELIVERY_MODE 覆盖启动受管 MOD-08 Developer、发布矩阵审计、最小故障/恢复/秘密/性能/可移植性 fixture 清单及实现。
- [x] `Q08.6`–`Q08.10` 独立 QA 证明首版 PR 的错误 `Closes #9` 与伪 restart/resume 证据会失败；Developer 修复、commit、push 并更新 Draft PR #31。
- [x] `Q08.11` fresh Release QA 在 exact head `4b35fa6` 验证 release gate 3/3、全套 41/41、恢复/秘密/性能 fixture 与 CI/Secret Guard；没有伪造 live/第二台电脑 PASS。
- [x] `Q08.12` QA 分流已闭合：fixture PR 可通过；受控 live/device/account/real-data、live recovery/performance 与第二台电脑门仍为 pending，不能关闭 #9。
- [x] `Q08.13` fresh Release Reviewer APPROVE：允许合并 test infrastructure，且确认 PR 无 closing issue reference。
- [x] `Q08.14` Review 分流无 P1/P2；发布 Issue 的剩余门不属于 fixture PR。
- [x] `Q08.15` Coordinator 判断 fixture-infrastructure merge readiness：QA、Reviewer、CI/Secret Guard 成功，且 #9/W6 不会被错误解除。
- [x] `Q08.16` 非作者 squash merge 已完成：main `16ba6a0`（PR #31）；#9 保持 OPEN。
- [ ] `Q08.17` Coordinator 验证 #9 全部 release gate done 并生成候选 release SHA；当前阻塞为 `profiles/5.95.1-1101.json` 的 `pending-manual-redacted-evidence`、受控 live/第二台电脑证据，不能进入 `R06.1`。
