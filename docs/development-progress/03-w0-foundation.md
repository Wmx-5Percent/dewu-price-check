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

- [x] `F00.1` Coordinator 只读确认 #1 ready 和治理基线 SHA；停止。
- [x] `F00.2` 用户批准只启动 MOD-00；停止。
- [x] `F00.3` 新建 MOD-00 Developer/worktree，只做实现审计；停止。
- [x] `F00.4` 用户批准 contract v1 的最小文件清单；停止。
- [x] `F00.5` Developer 实现仓库骨架、contract/schema、依赖 lock 和 CI 基线；自检后停止。
- [ ] `F00.6` 用户要求 Developer 解释目录、contracts、依赖和回滚；停止。（已被用户转入 F00.7，未验收）
- [x] `F00.7` 用户仅授权 stage 明确路径；查看 staged diff；停止。
- [x] `F00.8` 用户仅授权 commit；记录 SHA：`45aaedb577cd12f501baf1cf25d2e3bba802bf8c`；停止。
- [x] `F00.9` 用户仅授权 push 模块分支；远端 SHA：`45aaedb577cd12f501baf1cf25d2e3bba802bf8c`；停止。
- [x] `F00.10` 用户仅授权创建 draft PR；PR：[\#13](https://github.com/Wmx-5Percent/dewu-price-check/pull/13)；停止。
- [x] `F00.11` 新建 Foundation QA，独立运行 contracts、unit、dependency-audit；FAIL：secret-guard 缺少 `GITHUB_TOKEN`。
- [x] `F00.12` QA 分流；两次修复后由新的独立 QA 复验 PASS。
- [x] `F00.13` 新建 Foundation Reviewer，只读审查 contracts 和 CI；REQUEST_CHANGES：三个 P1。
- [x] `F00.14` Review 分流；RPC 秘密边界、Frida 完整安装证据和 QA 留痕均完成；返修后新 QA/Reviewer 通过。
- [x] `F00.15` Coordinator 判断 merge readiness；READY，精确 head `2c46bf6787271b1ffafa459ba52ec378b975a1ca`；停止。
- [x] `F00.16` 用户授权非作者 squash merge；PR #13 合并为 `959865fd191e0318f0e4cc722459361671ee3909`，Issue #1 自动关闭；停止。
- [x] `F00.17` Coordinator 验证远端 `main` 与 #1 done；用户批准 #2–#5 为可启动候选，进入 `E01.1`。

## 你应该学会

- contract 为什么必须早于模块实现；
- `package-lock.json` 如何固定可重复环境；
- CI 通过、QA 通过和 Reviewer 通过为什么是三件事；
- merge 前为什么必须知道精确 SHA。
