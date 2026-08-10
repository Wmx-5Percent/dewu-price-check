# X06：W1 / MOD-06 Export

| 项目 | 内容 |
| --- | --- |
| GitHub Issue | #5 |
| Developer 任务 | `[DEV][MOD-06][#5] Export` |
| 分支 | `agent/mod-06/5-export` |
| 依赖 | #1 已合并 |
| 主要路径 | `src/export/` |
| 强制合同 | 只输出 6 列 |

## 逐步清单

- [ ] `X06.1` Coordinator 确认 #5 ready；停止。
- [ ] `X06.2` 用户批准启动 MOD-06；停止。
- [ ] `X06.3` 新建 Export Developer，只做 6 列合同和 Excel 库审计；停止。
- [ ] `X06.4` 用户批准最小合成输入→Excel 切片；停止。
- [ ] `X06.5` Developer 实现并自检列名、特殊尺码、空报价、异常行；停止。
- [ ] `X06.6` 用户打开说明，确认没有库存尺码映射或内部字段；停止。
- [ ] `X06.7` 用户授权 stage；停止。
- [ ] `X06.8` 用户授权 commit；停止。
- [ ] `X06.9` 用户授权 push；停止。
- [ ] `X06.10` 用户授权 draft PR；停止。
- [ ] `X06.11` 新建 Export QA，独立检查 6 列、行粒度、公式错误和跨平台打开；停止。
- [ ] `X06.12` QA 分流。
- [ ] `X06.13` 新建 Export Reviewer，只读审查合同污染和格式推断；停止。
- [ ] `X06.14` Review 分流。
- [ ] `X06.15` Coordinator 判断 merge readiness；停止。
- [ ] `X06.16` 用户授权 merge；停止。
- [ ] `X06.17` Coordinator 验证 #5 done，并检查 W1 全部结果；用户批准后进入 `P02.1`。
