# G00：治理基线进入 Git

目标：先把经你确认的计划、`AGENTS.md` 和本进度目录安全地变成可回滚的 Git 基线。当前工作树混有已修改/删除文档和真实样本文件，不能直接 `git add .`。

## 原子步骤

- [x] `G00.1` 新建 Coordinator；只读审计本地状态、Issues、PR、Actions；停止。
- [x] `G00.2` 你逐项确认哪些现有修改属于治理基线；真实库存/样本不得提交；停止。
- [x] `G00.3` Coordinator 只读展示这些文件的 diff 摘要、拟提交路径和治理分支名；停止。
- [x] `G00.4` 你单独授权从当前基线创建治理分支（建议 `docs/governance-learning-mode`）；创建后停止，不 stage。
- [x] `G00.5` 你明确授权仅 stage 列出的路径；Coordinator stage 后展示 `git diff --cached`；停止。
- [x] `G00.6` 你确认 staged diff，并单独授权创建治理基线 commit；commit 后停止，不 push。
- [x] `G00.7` Coordinator 报告 commit SHA、未提交文件和远程差异；停止。
- [x] `G00.8` 你单独授权 push 当前治理分支；push 后停止，不创建 PR。
- [x] `G00.9` 你单独授权创建 draft PR；返回链接后停止。
- [x] `G00.10` 初轮治理 QA 失败：公开文档含真实库存/样本细节，且缺少本地敏感资产忽略规则；修复后的新一轮独立 G00.10 已通过；停止。
- [ ] `G00.11` 独立治理复审中，只复核初轮失败项；初轮 Reviewer 因 PR 描述陈旧及 G00.11/G00.12、W0 边界歧义而失败。本轮结论待 Reviewer 给出；通过前不得进入 `G00.13` 或启动 `MOD-00`；停止。
- [x] `G00.12` 已修复本轮 G00.10/G00.11 的治理失败项；本次经用户明确授权修改了 `05-w1-jobs.md`、GitHub Issue #3/#10 和 PR #11 正文。修复后新的独立 G00.10 已通过，新的 G00.11 正在复审；不得跳过。
- [ ] `G00.13` 返回 Coordinator，只做合并/基线就绪判断；停止。
- [ ] `G00.14` Coordinator 给出 READY 后，由你单独授权 squash merge；停止。
- [ ] `G00.15` Coordinator 验证远程基线、更新进度到 `F00.1`，但只有你明确授权后才修改进度文件。

## 排除项

- 真实库存表和任何真实业务样本；
- APK、App 私有数据、原始响应；
- Token、Cookie、签名、设备标识；
- 你尚未确认归属的删除或修改。

## 退出条件

- `AGENTS.md` 和本目录存在于所有后续 worktree 的基线 commit；
- GitHub Issue #1 仍为唯一可开发的 ready Issue；
- 工作树中剩余的用户文件已明确标记“不属于本次提交”；
- 你知道如何从 SHA 回到治理基线；
- 尚未开始 MOD-00 生产实现。
