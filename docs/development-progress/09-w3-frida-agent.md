# A03：W3 / MOD-03 Frida Agent

| 项目 | 内容 |
| --- | --- |
| GitHub Issue | #7 |
| Developer 任务 | `[DEV][MOD-03][#7] Frida Agent` |
| 分支 | `agent/mod-03/7-frida-agent` |
| 依赖 | #1、#2、#6 已合并 |
| 主要路径 | `agent/`、`src/frida/` |
| RPC | `health`、`searchBySku`、`getProduct`、`getQuotes` |

## 逐步清单

- [ ] `A03.1` Coordinator 核对 Profile、Frida 版本和 Issue #7 readiness；停止。
- [ ] `A03.2` 用户批准启动 MOD-03；停止。
- [ ] `A03.3` 新建 Frida Agent Developer，只做 RPC/contract 审计；停止。
- [ ] `A03.4` 用户批准最小 `health`→单搜索→详情→报价切片；停止。
- [ ] `A03.5` Developer 实现 RPC、分页、会话和版本守卫；停止。
- [ ] `A03.6` 用户检查是否导出秘密、静默 fallback 或回退 UI；停止。
- [ ] `A03.7` 用户授权 stage；停止。
- [ ] `A03.8` 用户授权 commit；停止。
- [ ] `A03.9` 用户授权 push；停止。
- [ ] `A03.10` 用户授权 draft PR；停止。
- [ ] `A03.11` 新建 Frida QA，先 fixture 后受控 live RPC，验证断连/版本/schema；停止。
- [ ] `A03.12` QA 分流。
- [ ] `A03.13` 新建 Frida Reviewer，只读审查进程内边界、分页和安全；停止。
- [ ] `A03.14` Review 分流。
- [ ] `A03.15` Coordinator 判断 merge readiness；停止。
- [ ] `A03.16` 用户授权 merge；停止。
- [ ] `A03.17` Coordinator 验证 #7 done 及 W4 全部上游；用户批准后进入 `I07.1`。
