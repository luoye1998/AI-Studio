# 交付状态

> 最后更新：2026-11-26

## 一、已完成并验证

| 交付物 | 位置 | 验证方式 |
|---|---|---|
| **网页版** | `src/` → `dist/` | `npm run build` 通过；六个视图在 Edge 中逐页截图确认 |
| **Windows 客户端** | `release\WorkStream-Studio-Windows-0.1.0-Setup.exe`（78 MB） | 解包版实际启动、窗口渲染完整（`docs/screenshots/desktop.png`） |
| **macOS 客户端（PWA）** | `dist/` + `manifest.webmanifest` + `sw.js` | 部署后 `/manifest.webmanifest`、`/sw.js`、图标均返回 200 |
| **文档** | `README.md`、`docs/` 5 篇 | — |
| **设计资产** | `design/assets/` 18 个文件 | 已接入界面（阶段图标、空状态插画） |
| **单元测试** | `tests/` 32 用例 | `npm run test` 全绿 |
| **源码托管** | https://github.com/luoye1998/AI-Studio | `main` = `15ba9af`，81 个文件 |

## 二、功能清单

九阶段流水线 · 锁稿铁律 · 三级锁定（资产/阶段/成片）· G1/G2 人工闸口 · 预算闸口（超支挂起 + 追加审批）·
71 项导演技能 · 24 套 LIRA 色卡 · 2×2 四视图资产卡 · 镜头表（台词秒数校验、单镜头重做、提示词编译）·
成本明细与 CSV 导出 · 剧本知识库 · 命令面板 · hash 深链 · 工程导出/导入 · 桌面 IPC（选目录/存文件）·
**模型双通道**（OpenAI 兼容真实调用 / 本地推演兜底，失败自动降级）。

## 三、尚未完成

| 缺口 | 原因 | 解除方式 |
|---|---|---|
| **macOS 原生 dmg** | dmg 需在 macOS 上构建（`hdiutil` + `codesign`）；手工组装 .app 会破坏 Electron 签名，不可用 | 在 Mac 上跑 `npm run build:mac`，或用 GitHub Actions（见下） |
| **CI workflow 未入库** | 推送与 API 写入 `.github/workflows/*` 都需要 token 的 `Workflows: Read and write` 权限（已实测 403） | 换一个带 Workflows 权限的 token，或在 GitHub 网页端新建该文件（网页操作不受限） |
| **真实模型调用** | 通道已实现，但没有可用的 Key | 在「设置 → 模型通道」填入 Base URL / Key / 模型名即可，无需改代码 |
| **知识库检索** | 目前是目录挂载与开关的交互原型 | 接入本地向量索引 |
| **WorkBuddy 设计产出** | 任务卡已发布（`design/TASK.md`），对方未回传 | 已用自建资产兜底；回传后替换 `design/assets/` |

## 四、下一轮可做

1. 用带 `Workflows` 权限的 token 补 CI，打 tag 产出真 dmg
2. Store 层状态流转测试（锁稿 → 闸口 → 打回重跑 → 下游失效）
3. WorkBuddy 的设计产出一旦回传，替换现有的兜底资产
4. 接一个真实文本模型，把推演引擎换成真调用（保留离线降级）
