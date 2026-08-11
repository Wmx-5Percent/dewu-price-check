# 任务窗口与角色规则

## 一眼判断：新开还是复用

| 发生的事情 | 怎么做 |
| --- | --- |
| 第一次建立项目总控 | 新建一个 Coordinator，之后长期复用 |
| 从一个模块换到另一个模块 | 新建 Developer |
| 同一个 PR 收到 QA/Review 问题后返工 | 返回原 Developer |
| Developer 说代码完成，需要独立验证 | 新建 QA |
| QA 通过，需要代码审查 | 新建 Reviewer |
| QA 失败 | 关闭/暂停 QA，返回原 Developer |
| Reviewer 要求修改 | 关闭/暂停 Reviewer，返回原 Developer；修完重新开新的 QA 和 Reviewer |
| 准备判断能否合并 | 返回长期 Coordinator |
| 合并完成，决定下一模块 | 继续使用长期 Coordinator |
| 发生数据风险、错误合并或秘密泄漏 | 立即返回 Coordinator，按回滚手册停止 |

## 为什么不能一直用一个任务

角色切换会污染判断：

- Developer 会天然倾向于相信自己实现正确；
- QA 必须从外部验证，而不是沿用 Developer 的假设；
- Reviewer 必须只看合同、diff 和证据；
- Coordinator 需要保存全局依赖图，不能被某个模块实现细节淹没。

所以每个模块至少会有三个独立任务：Developer、QA、Reviewer。Coordinator 是第四个长期任务。

## 任务命名

- `[COORD] Dewu project coordinator`
- `[DEV][MOD-00][#1] Foundation`
- `[QA][MOD-00][#1] Foundation PR <number>`
- `[REVIEW][MOD-00][#1] Foundation PR <number>`

其他模块只替换编号和名称。

## 每个任务的第一句话

每个任务必须先声明：

- 角色；
- 当前原子步骤 ID；
- Issue 和模块；
- 分支/worktree；
- 允许路径；
-禁止动作；
- 停止条件。

如果 Agent 没有先声明，要求它停止并重新按 `AGENTS.md` 开工门执行。

## Coordinator 实时快照与新 worktree

`CURRENT_STEP.md`、`PROGRESS.md` 和当前 Wave 清单是 Coordinator 主 worktree 中的实时操作记录。它们通常不会包含在模块 PR 中；因此新建的 worktree 若从远端 `main` 开始，可能只看得到旧基线（例如 `F00.1`）。这不是 GitHub/模块依赖冲突，不能据此擅自停止已明确委派的当前步骤。

每次新建 Developer、QA 或 Reviewer task 时，Coordinator 必须：

1. 先检查主 worktree 的 `git status`；若未提交改动仅为进度控制文档，创建 task 时选择 **working-tree** 起点，使最新快照随新 worktree 复制。
2. 在首条提示词顶部写入“Coordinator handoff snapshot”，包含步骤 ID、角色、PR/Issue、head SHA、允许动作、禁止动作、停止条件和主 worktree 的绝对 `CURRENT_STEP.md` 路径。
3. 若主 worktree 还有不应复制的生产改动，则从干净 `main` 创建隔离 worktree，但 handoff snapshot 在该 task 内暂时优先于本地旧副本；Agent 必须报告旧副本的存在，但不得把它误报为 GitHub 状态冲突。
4. Agent 只能修改其指定 worktree；进度控制文档只由 Coordinator 主 worktree 更新，除非用户明确批准其他位置的记录变更。

这样既保留角色/worktree 隔离，又让每个新任务具有同一份当前操作事实。

## Learning Mode 的并发限制

- Coordinator 可以保持空闲，不算生产并发。
- 同时最多一个生产 Developer。
- QA 开始前 Developer 必须停止编辑。
- Reviewer 开始前 QA 必须给出最终报告。
- 合并检查开始前 Reviewer 必须完成。
- 不在多个任务中同时改同一个分支。

## 哪些动作必须由你单独授权

下面每项都是独立许可：

1. 修改生产文件；
2. stage 指定文件；
3. 创建 commit；
4. push 指定分支；
5. 创建 draft PR；
6. 将 draft PR 标记 ready；
7. 合并 PR；
8. 删除分支/worktree；
9. 安装系统软件或修改 Android 设备；
10. 删除、迁移或覆盖任何真实数据。

“继续”“帮我完成”“按计划做”不能被解释为以上全部授权。

## 什么时候关闭任务

- Developer：PR 合并且 Coordinator 验证后归档。
- QA：最终报告已写入 PR/Issue 后归档；返工后的验证使用新的 QA 任务。
- Reviewer：提交 review 后归档；返工后使用新的 Reviewer 任务。
- Coordinator：整个项目结束前不要归档。
