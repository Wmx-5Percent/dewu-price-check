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

- [x] `Q08.1` Coordinator 核对 #2–#8 均为 closed；发布基线为 main `d83ecc7fb03cd6bc89d9f9ec11000366c028e86c`。Issue #9 的状态标签待同步为 ready。
- [ ] `Q08.2` 用户批准启动 MOD-08 测试基础设施；停止。
- [ ] `Q08.3` 新建 QA Infrastructure Developer，只做测试矩阵审计；停止。
- [ ] `Q08.4` 用户批准故障、恢复、秘密、性能、第二台电脑最小测试清单；停止。
- [ ] `Q08.5` Developer 实现测试/CI/文档，自检后停止。
- [ ] `Q08.6` 用户检查测试是否真的能失败、是否伪造 live evidence；停止。
- [ ] `Q08.7` 用户授权 stage；停止。
- [ ] `Q08.8` 用户授权 commit；停止。
- [ ] `Q08.9` 用户授权 push；停止。
- [ ] `Q08.10` 用户授权 draft PR；停止。
- [ ] `Q08.11` 新建 Release QA，在独立环境执行发布矩阵并出具证据；停止。
- [ ] `Q08.12` QA 分流，任何缺少的第二台电脑/live test 均为 BLOCKED。
- [ ] `Q08.13` 新建 Release Reviewer，只读审查测试质量和证据链；停止。
- [ ] `Q08.14` Review 分流。
- [ ] `Q08.15` Coordinator 判断 release-gate merge readiness；停止。
- [ ] `Q08.16` 用户授权 merge；停止。
- [ ] `Q08.17` Coordinator 验证 #9 done 并生成候选 release SHA；用户批准后进入 `R06.1`。
