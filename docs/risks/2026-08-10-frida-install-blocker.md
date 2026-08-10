# Frida 17.16.4 完整安装阻塞记录

## 状态

阻塞中。此记录对应 GitHub Issue #1 的脱敏安装证据评论。

## 复现条件

- 日期：2026-08-10
- Node.js：v22.23.1
- npm：10.9.8
- 依赖：`frida@17.16.4`
- 命令：在新建临时目录中仅复制 `package.json` 和 `package-lock.json` 后运行 `npm ci --foreground-scripts`。

## 结果

命令以退出码 1 结束。Frida 安装脚本的预编译下载连接中断；脚本随后回退到源码构建，并在 Meson 阶段报告缺少 `package-lock.json`。

未将 `npm ci --ignore-scripts` 视为完整 Frida 安装成功。没有升级、降级、替换 Frida、使用未批准镜像或保存原始安装日志。

## 影响与后续

MOD-00 的离线 contract 检查仍可使用 `npm ci --ignore-scripts`，但这不构成 Frida 安装验收。任何完整安装修复、依赖变更、镜像使用或重试策略都需要新的用户批准和独立验证。

原始临时安装目录和日志已在发布脱敏 Issue 证据后删除；本文件不包含本地路径、凭据、Cookie、Token、APK 或设备信息。
