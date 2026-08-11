# J04：W1 / MOD-04 Jobs

| 项目 | 内容 |
| --- | --- |
| GitHub Issue | #3 |
| Developer 任务 | `[DEV][MOD-04][#3] Jobs` |
| 分支 | `agent/mod-04/3-jobs` |
| 依赖 | #1 已合并 |
| 主要路径 | `src/jobs/` |
| 特殊目标 | 输入基线、去重、状态机、原子任务状态、1→2→4 并发、断点 |

## 逐步清单

- [x] `J04.1` Coordinator 确认 #3 ready、#1 已合并且 contract v1 可用；停止。
- [x] `J04.2` 用户批准启动 MOD-04；停止。
- [ ] `J04.3` 新建 Jobs Developer，只做输入/状态合同审计；停止。
- [ ] `J04.4` 用户批准最小离线状态机切片；停止。
- [ ] `J04.5` Developer 实现并做 fixture/self-check；停止。
- [ ] `J04.6` 用户检查是否写死运行时业务数量、真实文件路径或默认并发；停止。
- [ ] `J04.7` 用户授权 stage；停止。
- [ ] `J04.8` 用户授权 commit；停止。
- [ ] `J04.9` 用户授权 push；停止。
- [ ] `J04.10` 用户授权 draft PR；停止。
- [ ] `J04.11` 新建 Jobs QA，独立测试去重、失败、重试、崩溃恢复、全局阻塞；停止。
- [ ] `J04.12` QA 分流。
- [ ] `J04.13` 新建 Jobs Reviewer，只读审查状态转换和竞态；停止。
- [ ] `J04.14` Review 分流。
- [ ] `J04.15` Coordinator 判断 merge readiness；停止。
- [ ] `J04.16` 用户授权 merge；停止。
- [ ] `J04.17` Coordinator 验证 #3 done；用户批准后进入 `V05.1`。
