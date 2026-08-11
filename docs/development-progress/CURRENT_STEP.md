# 当前唯一步骤

> 这是人工控制点。除非用户明确批准，任何 Agent 都不得修改本文件、勾选后续步骤或自动开始下一项。

| 字段 | 当前值 |
| --- | --- |
| 模式 | `LEARNING_MODE` |
| 当前步骤 | `J04.14` |
| 状态 | `DEVELOPER_REMEDIATION_UNSTAGED` |
| 当前 Wave | W1 / MOD-04 Jobs |
| 当前模块 | `MOD-04 Jobs`（Issue #3） |
| 当前角色 | 原 MOD-04 Developer |
| 当前打开任务 | 原 Developer；只修复 PR #20 的 batch 内 global blocker 与大小写去重两项 P1，并补回归测试 |
| 下一个任务 | 无；Developer 自检报告后等待单独 stage 授权 |
| 允许写代码 | 是，仅 Issue #3 允许路径 |
| 允许 commit/push/PR/merge | 禁止；本步骤只允许修复与开发自检，未获授权前不得 stage、commit、push、PR、ready 或 merge |

## 你现在只做这一件事

在原 MOD-04 Developer worktree 的 PR #20 分支上，只修复两项 Reviewer P1：(1) batch 内先返回的 global blocker 必须阻止同一 batch 后续任务被调用；(2) SKU 去重必须统一大小写。补充窄回归测试并运行开发自检。

不得修改 Issue #3 允许路径以外的文件；不得触碰 Android/AVD/ADB/Frida、真实业务数据、合同或依赖；不得 stage、commit、push、创建/变更 PR、ready、merge 或删除分支。

## 这一小步完成的证据

- 报告精确修改文件、两项 P1 的回归测试、自检结果、未暂存工作树状态和剩余风险；
- 明确说明未 stage、commit、push 或变更 GitHub；
- 最后一行明确写“等待用户对 J04.14 修复验收并单独授权 stage”。

## 完成后怎么办

Developer 报告后停止；修复推送后必须重新新建独立 QA 和 Reviewer。

实时快照日期：2026-08-09。GitHub 状态会变化，Coordinator 每次必须重新读取，不能只相信这份快照。
