# E01：W1 / MOD-01 Environment

| 项目 | 内容 |
| --- | --- |
| GitHub Issue | #2 |
| Developer 任务 | `[DEV][MOD-01][#2] Environment` |
| 分支 | `agent/mod-01/2-environment` |
| 依赖 | #1 已合并 |
| 主要路径 | `src/environment/`、批准的环境脚本 |
| 特殊风险 | 安装 Java/SDK、创建 AVD、Root、Frida Server、APK 与设备状态 |

## 逐步清单

- [x] `E01.1` Coordinator 只读确认 #1 已合并、#2 ready；停止。
- [x] `E01.2` 用户批准只启动 MOD-01；停止。
- [x] `E01.3` Developer 完成本机环境探测和变更计划；停止。
- [x] `E01.4` 用户逐项批准软件安装和新 AVD 方案；保留现有 `Medium_Phone`；停止。
- [x] `E01.5` Developer 实现最小 doctor/bootstrap dry-run；停止。
- [x] `E01.6` 用户检查路径可移植性、设备 serial 和回滚说明；停止。
- [x] `E01.7` 用户授权 stage 指定文件；停止。
- [x] `E01.8` 用户授权 commit：`82aaac4`；停止。
- [x] `E01.9` 用户授权 push：`agent/mod-01/2-environment`；停止。
- [x] `E01.10` 用户授权 draft PR：[\#19](https://github.com/Wmx-5Percent/dewu-price-check/pull/19)；停止。
- [x] `E01.11` 独立 QA 完成离线测试，并在明确授权下通过新 Root AVD/Frida smoke test；停止。
- [x] `E01.12` QA 分流完成；仅使用专用 `Dewu_Root_API35_arm64`，未触碰现有 AVD 或真实业务数据。
- [x] `E01.13` 独立 Environment Reviewer 通过，重点核对 destructive actions、绝对路径和版本锁；停止。
- [x] `E01.14` Review 无需返工分流；停止。
- [x] `E01.15` Coordinator 核对受控 live evidence 与 merge readiness；通过并停止。
- [x] `E01.16` 用户授权后，PR #19 squash merge 为 `21031b86`；停止。
- [x] `E01.17` Coordinator 验证 #2 已关闭，#6 所有依赖门已满足并标为 ready；进入 `J04.1`。

## 学习模式顺序

虽然 #3–#5 此时也可能 ready，暂不并行。先完整体验 MOD-01 的 Developer→QA→Reviewer→Merge。
