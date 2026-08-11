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
- [x] `V05.11` 新建 Evidence QA：FAIL；发现 records 中间目录 symlink 逃逸与 concurrent JSONL append 丢记录两项 P1。
- [x] `V05.12` QA 分流回原 Developer 修复两项 P1，并补合成 symlink/concurrency 回归测试；修复已推送至 `db35f6f`。
- [x] `V05.13` 新建 Evidence Reviewer：REQUEST_CHANGES；发现 file-level JSONL/record symlink 仍可读/泄漏 store 外内容。
- [x] `V05.14` Review 分流回原 Developer，执行 symlink 边界第二轮（最后一次自动）返修；已推送 `584ff07`。
- [x] `V05.11` 新建第二轮返修后的 fresh Evidence QA：验证 file-level/目录 symlink containment、并发 JSONL、既有证据合同与 CI；PASS，`584ff07`，Issue #4 已留存证据。
- [x] `V05.13` 新建第二轮返修后的 fresh Evidence Reviewer：APPROVE，`584ff07`，Issue #4 已留存证据。
- [x] `V05.15` Coordinator 判断 merge readiness：QA/Reviewer、范围和 18 项 CI/Secret Guard 均通过。
- [x] `V05.16` `AUTONOMOUS_DELIVERY_MODE` 预授权非作者 squash merge；PR #23 已合并为 `b59ac5b`。
- [x] `V05.17` Coordinator 验证 #4 closed；进入 `X06.1`。
