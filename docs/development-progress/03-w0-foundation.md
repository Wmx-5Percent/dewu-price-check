# F00：W0 / MOD-00 Foundation

| 项目 | 内容 |
| --- | --- |
| GitHub Issue | #1 |
| Developer 任务 | `[DEV][MOD-00][#1] Foundation` |
| 分支 | `agent/mod-00/1-foundation` |
| 依赖 | 无，但 G00 治理基线必须完成 |
| 主要路径 | `package*.json`、`schemas/`、共享 contract、`.github/` |
| 非目标 | Android/Frida 实现、Jobs、Evidence、Export、集成业务逻辑 |

## 逐步清单

- [ ] `F00.1` Coordinator 只读确认 #1 ready 和治理基线 SHA；停止。
- [ ] `F00.2` 用户批准只启动 MOD-00；停止。
- [ ] `F00.3` 新建 MOD-00 Developer/worktree，只做实现审计；停止。
- [ ] `F00.4` 用户批准 contract v1 的最小文件清单；停止。
- [ ] `F00.5` Developer 实现仓库骨架、contract/schema、依赖 lock 和 CI 基线；自检后停止。
- [ ] `F00.6` 用户要求 Developer 解释目录、contracts、依赖和回滚；停止。
- [ ] `F00.7` 用户仅授权 stage 明确路径；查看 staged diff；停止。
- [ ] `F00.8` 用户仅授权 commit；记录 SHA；停止。
- [ ] `F00.9` 用户仅授权 push 模块分支；停止。
- [ ] `F00.10` 用户仅授权创建 draft PR；停止。
- [ ] `F00.11` 新建 Foundation QA，独立运行 contracts、unit、dependency-audit；停止。
- [ ] `F00.12` QA 分流；FAIL 返回原 Developer 并重复验证。
- [ ] `F00.13` 新建 Foundation Reviewer，只读审查 contracts 和 CI；停止。
- [ ] `F00.14` Review 分流；修改后重新 QA 和 Review。
- [ ] `F00.15` Coordinator 判断 merge readiness；停止。
- [ ] `F00.16` 用户单独授权 squash merge；停止。
- [ ] `F00.17` Coordinator 验证 #1 done，并只把 #2–#5 更新为可启动候选；用户批准后进入 `E01.1`。

## 你应该学会

- contract 为什么必须早于模块实现；
- `package-lock.json` 如何固定可重复环境；
- CI 通过、QA 通过和 Reviewer 通过为什么是三件事；
- merge 前为什么必须知道精确 SHA。
