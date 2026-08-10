# 回滚与恢复手册

## 先判断是哪一种失败

| 情况 | 立即动作 |
| --- | --- |
| Developer 写错但未 commit | 停止；只查看 diff；让原 Developer 提出最小反向补丁 |
| 已 commit 未 push | 保留 SHA；优先新 commit 修复，不改写共享历史 |
| 已 push 未 merge | 停止 PR；原 Developer 修复；重新 QA/Review |
| 已 merge 发现缺陷 | Coordinator 建 Bug Issue；使用 `git revert` 新 PR，不 `reset --hard` |
| CI 失败 | 不 merge；回原 Developer；修复后重跑完整门禁 |
| QA/Review 失败 | 旧 PASS/APPROVE 失效；修复后新开 QA 和 Reviewer |
| 真实数据/证据风险 | 停止所有 Agent 和运行；保护现场；先备份再诊断 |
| Token/秘密可能泄漏 | 停止发布；撤销/轮换秘密；再清理 Git 与日志 |
| Android/AVD 状态异常 | 不破坏现有 `Medium_Phone`；保留日志；只处理新受控 AVD |
| Profile/schema/登录/风控异常 | 全局阻塞；保存 checkpoint；不得 fallback 或继续后续货号 |

## 回滚任务由谁开

- 首先回到长期 Coordinator。
- Coordinator 只读确认影响范围和最后一个已知良好 SHA。
- 需要代码修复：新建 Bug Developer。
- 需要验证：新建 Bug QA。
- 需要审查：新建 Bug Reviewer。
- 需要合并 revert：仍然由你单独授权。

## 禁止动作

- `git reset --hard`；
- 对宽泛目录执行递归删除；
- 删除真实库存、证据、checkpoint 或设备数据来“重试”；
- force-push 共享分支；
- 为赶进度绕过失败测试；
- 在 Coordinator、QA 或 Reviewer 任务里顺手补生产代码；
- 同时继续下一个模块。

## 你可以复制的紧急停止语句

```text
停止当前工作。不要修改、删除、commit、push、merge 或继续后续货号。
你现在只做只读诊断：列出影响范围、当前分支和 SHA、未提交 diff、
最后一个已知良好状态、可能涉及的数据以及最安全的恢复选项。
完成后等待我选择，不要自动执行恢复。
```
