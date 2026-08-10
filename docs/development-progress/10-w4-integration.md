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

- [ ] `I07.1` Coordinator 核对所有上游 SHA 和 contract；停止。
- [ ] `I07.2` 用户批准启动 MOD-07；停止。
- [ ] `I07.3` 新建 Integration Developer，只画数据流和适配器清单；停止。
- [ ] `I07.4` 用户批准最小统一 CLI 端到端切片；停止。
- [ ] `I07.5` Developer 只装配模块并实现 CLI；停止。
- [ ] `I07.6` 用户检查是否复制上游逻辑、增加隐式合同或逐 SKU UI；停止。
- [ ] `I07.7` 用户授权 stage；停止。
- [ ] `I07.8` 用户授权 commit；停止。
- [ ] `I07.9` 用户授权 push；停止。
- [ ] `I07.10` 用户授权 draft PR；停止。
- [ ] `I07.11` 新建 Integration QA：fixture 全链路、12 条同刻对照、50 条响应级运行；停止。
- [ ] `I07.12` QA 分流，未满足 live 前提必须标 BLOCKED 而非 PASS。
- [ ] `I07.13` 新建 Integration Reviewer，只读检查模块边界和端到端证据；停止。
- [ ] `I07.14` Review 分流。
- [ ] `I07.15` Coordinator 判断 merge readiness；停止。
- [ ] `I07.16` 用户授权 merge；停止。
- [ ] `I07.17` Coordinator 验证 #8 done；用户批准后进入 `Q08.1`。
