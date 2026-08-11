# V05：W1 / MOD-05 Evidence

| 项目 | 内容 |
| --- | --- |
| GitHub Issue | #4 |
| Developer 任务 | `[DEV][MOD-05][#4] Evidence` |
| 分支 | `agent/mod-05/4-evidence` |
| 依赖 | #1 已合并 |
| 主要路径 | `src/evidence/` |
| 特殊风险 | 秘密泄漏、非原子写入、证据不可回溯 |

## 逐步清单

- [x] `V05.1` Coordinator 确认 #4 ready：#1 closed、#4 OPEN/ready、无 MOD-05 PR、main CI/Secret Guard 成功。
- [x] `V05.2` `AUTONOMOUS_DELIVERY_MODE` 授权启动 MOD-05。
- [ ] `V05.3` 新建 Evidence Developer，只做威胁/数据流审计与允许范围内最小实现；进行中。
- [ ] `V05.4` 用户批准 allowlist、redaction、hash、atomic-write 最小切片；停止。
- [ ] `V05.5` Developer 实现并用合成数据自检；停止。
- [ ] `V05.6` 用户检查任何 raw response、Token、设备标识是否可能落盘；停止。
- [ ] `V05.7` 用户授权 stage；停止。
- [ ] `V05.8` 用户授权 commit；停止。
- [ ] `V05.9` 用户授权 push；停止。
- [ ] `V05.10` 用户授权 draft PR；停止。
- [ ] `V05.11` 新建 Evidence QA，执行秘密模式、崩溃写入、hash 回溯和路径攻击测试；停止。
- [ ] `V05.12` QA 分流，任何真实秘密测试输入都视为错误。
- [ ] `V05.13` 新建 Evidence Reviewer，只读安全审查；停止。
- [ ] `V05.14` Review 分流。
- [ ] `V05.15` Coordinator 判断 merge readiness；停止。
- [ ] `V05.16` 用户授权 merge；停止。
- [ ] `V05.17` Coordinator 验证 #4 done；用户批准后进入 `X06.1`。
