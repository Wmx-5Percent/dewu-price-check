# 人工开发进度板

> GitHub 是代码与依赖状态事实来源；此表为当前 Coordinator 状态快照。

| 项目 | 状态 |
| --- | --- |
| 模式 | `AUTONOMOUS_DELIVERY_MODE` |
| 当前步骤 | `G32.2`（authorized source audit: NO-GO） |
| 已合并模块 | 8 / 9（#1–#8） |
| 当前 Issue | #32（MOD-00 架构/合同 go-no-go：blocked） |
| W5 / #9 | fixture gate 已合并；live、恢复/性能与第二电脑证据未完成 |
| W6 / #10 | blocked by #9；未开始任何真实库存运行 |

## 已完成模块

| Module | Issue | 状态 |
| --- | ---: | --- |
| MOD-00 Foundation | #1 | merged / closed |
| MOD-01 Environment | #2 | merged / closed |
| MOD-04 Jobs | #3 | merged / closed |
| MOD-05 Evidence | #4 | merged / closed |
| MOD-06 Export | #5 | merged / closed |
| MOD-02 Protocol | #6 | merged / closed；Profile 仍 fail-closed |
| MOD-03 Frida guard | #7 | merged / closed；不是 live Agent |
| MOD-07 Integration | #8 | merged / closed；真实 pilot 未执行 |

## 当前架构边界

Frida/App 内通道不再作为 v1 生产数据路径：受控 attach 会导致目标 App `EXIT_SELF`。不得规避保护。Issue #32 的官方来源审计为 NO-GO：公开文档不能证明所需字段与授权范围。因此自动化大批量采集在现有边界下不可用；#9/#10 保持 blocked，等待提供商的明确授权和字段文档。
