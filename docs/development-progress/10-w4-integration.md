# I07：W4 / MOD-07 Integration

| 项目 | 内容 |
| --- | --- |
| GitHub Issue | #8 |
| 分支 | `agent/mod-07/8-integration` |
| 依赖 | #3、#4、#5、#7 已合并，contract 版本一致 |
| 主要路径 | `src/cli/`、`src/integration/` |
| 禁止 | 在集成层补写上游内部逻辑 |

## 完成清单

- [x] `I07.1`–`I07.3` Coordinator 核对上游 SHA/contract 并启动受管 MOD-07 Developer。
- [x] `I07.4`–`I07.10` 在 AUTONOMOUS_DELIVERY_MODE 下完成最小统一 CLI fixture 切片、开发自检、commit/push 与 Draft PR #30。
- [x] `I07.11`–`I07.14` 多轮 fresh QA/Reviewer 覆盖 fixture 全链路及 required-device、serial grammar、binding identity 和 failure guards；所有 P1 已闭合。
- [x] `I07.15` Coordinator merge-readiness：最终 QA、Reviewer、CI/Secret Guard 均通过。
- [x] `I07.16` 非作者 squash merge 已完成：main `d83ecc7fb03cd6bc89d9f9ec11000366c028e86c`。
- [x] `I07.17` Coordinator 验证 #8 closed；进入 `Q08.1`。

## 受控真实库存 pilot 边界

- 本机输入工作簿只能用于抽取小批 SKU；不能提交、上传或写入 fixture。
- 不需要预先 Golden Sample；采集后只生成严格六列的本机 Excel，供用户人工核对。
- 当前 checked-in Profile 仍为 synthetic/fail-closed；任何 Profile/session/schema/risk/version 失败必须全局阻断并停止。不得 UI-per-SKU fallback、持久化 raw response 或导出秘密。
