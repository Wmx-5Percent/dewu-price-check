# I07：W4 / MOD-07 Integration

| 项目 | 内容 |
| --- | --- |
| GitHub Issue | #8 |
| Developer 任务 | `[DEV][MOD-07][#8] Integration` |
| 分支 | `agent/mod-07/8-integration` |
| 依赖 | #3、#4、#5、#7 全部已合并，contract 版本一致 |
| 主要路径 | `src/cli/`、`src/integration/` |
| 禁止 | 在集成层补写任何上游内部逻辑 |

## 逐步清单

- [x] `I07.1` Coordinator 核对上游：#3/#4/#5/#7 已 closed，main 为 `7abbc2a`，CI/Secret Guard 成功；公共 contract 版本未变。
- [x] `I07.2` AUTONOMOUS_DELIVERY_MODE 与用户继续开发授权覆盖启动 MOD-07。
- [x] `I07.3` 新建受管 Integration Developer：仅画/实现数据流与适配器，直接回传 Coordinator。
- [x] `I07.4` AUTONOMOUS_DELIVERY_MODE 覆盖最小统一 CLI fixture 端到端切片；不得开展 live collection。
- [x] `I07.5` Developer 仅装配模块并实现 CLI/Integration；Draft PR #30 head `0e663fee`。
- [x] `I07.6` Developer 自检无上游逻辑复制、隐式合同或逐 SKU UI；Profile 继续 fail-closed。
- [x] `I07.7`–`I07.10` Developer 在允许路径内 stage、commit、push 并创建 Draft PR #30。
- [ ] `I07.4` 用户批准最小统一 CLI 端到端切片；停止。
- [ ] `I07.5` Developer 只装配模块并实现 CLI；停止。
- [ ] `I07.6` 用户检查是否复制上游逻辑、增加隐式合同或逐 SKU UI；停止。
- [ ] `I07.7` 用户授权 stage；停止。
- [ ] `I07.8` 用户授权 commit；停止。
- [ ] `I07.9` 用户授权 push；停止。
- [ ] `I07.10` 用户授权 draft PR；停止。
- [ ] `I07.11` 新建 Integration QA：fixture 全链路；受控小批本机真实 SKU 仅在 Agent/Profile 守卫通过后运行，并输出本机六列 Excel 供用户事后人工检查。预先 Golden Sample/12 条同刻 UI 对照已由用户明确免除；不得把真实数据写入 GitHub。停止。
- [ ] `I07.12` QA 分流，未满足 live 前提必须标 BLOCKED 而非 PASS。
- [ ] `I07.13` 新建 Integration Reviewer，只读检查模块边界和端到端证据；停止。
- [ ] `I07.14` Review 分流。
- [ ] `I07.15` Coordinator 判断 merge readiness；停止。
- [ ] `I07.16` 用户授权 merge；停止。
- [ ] `I07.17` Coordinator 验证 #8 done；用户批准后进入 `Q08.1`。

## 受控真实库存 pilot 边界（2026-08-12）

- 本机输入工作簿只用于抽取小批 SKU；不能提交、上传或写入 fixture。
- 不需要预先 Golden Sample；采集后只生成严格六列的本机 Excel，供用户人工核对。
- 任何 Profile/session/schema/risk/version 失败必须全局阻断并停止；不允许 UI-per-SKU fallback、raw response 持久化或秘密导出。
