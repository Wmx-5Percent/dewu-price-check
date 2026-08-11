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
- [x] `V05.3` 新建 Evidence Developer，完成威胁/数据流审计与允许范围内最小实现。
- [x] `V05.4` `AUTONOMOUS_DELIVERY_MODE` 批准 allowlist、redaction、hash、atomic-write 最小切片。
- [x] `V05.5` Developer 实现并用合成数据自检。
- [x] `V05.6` Developer 检查 raw response、Token、设备标识不会落盘；仅 allowlist 字段持久化。
- [x] `V05.7` Developer 精确 stage 允许路径。
- [x] `V05.8` Developer commit：`af95daf`。
- [x] `V05.9` Developer push：`agent/mod-05/4-evidence`。
- [x] `V05.10` Developer 创建 Draft PR [#23](https://github.com/Wmx-5Percent/dewu-price-check/pull/23)。
- [ ] `V05.11` 新建 Evidence QA，执行秘密模式、崩溃写入、hash 回溯和路径攻击测试；进行中。
- [ ] `V05.12` QA 分流，任何真实秘密测试输入都视为错误。
- [ ] `V05.13` 新建 Evidence Reviewer，只读安全审查；停止。
- [ ] `V05.14` Review 分流。
- [ ] `V05.15` Coordinator 判断 merge readiness；停止。
- [ ] `V05.16` 用户授权 merge；停止。
- [ ] `V05.17` Coordinator 验证 #4 done；用户批准后进入 `X06.1`。
