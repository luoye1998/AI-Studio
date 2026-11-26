# 安装与分发

WorkStream Studio 提供三种安装形态，按平台选最省事的那条。

## 一、Windows（原生安装包）

```powershell
# 产物
release\WorkStream-Studio-Windows-0.1.0-Setup.exe
```

1. 双击安装包，可以改安装目录（默认装在用户目录，不需要管理员权限）
2. 首次运行如弹出「Windows 已保护你的电脑」→「更多信息」→「仍要运行」
   （安装包未做代码签名，这是正常的）
3. 安装后桌面与开始菜单会有「WorkStream Studio」

体积约 78 MB，装完约 200 MB。

## 二、macOS（PWA 安装，已验证）

这是当前**立刻可用**的 macOS 形态：独立窗口、有 Dock 图标、离线可打开、数据存本机。

### Safari
1. 打开部署好的 WorkStream 地址（任意静态托管均可，如 `https://your-domain/workstream/`）
2. 菜单栏 **文件 → 添加到程序坞**
3. 之后从启动台/Dock 直接启动

### Chrome / Edge
1. 打开地址
2. 地址栏右侧点「安装」图标，或菜单 → **投放、保存和共享 → 安装页面为应用**

> PWA 与原生客户端共用同一份构建产物，数据存在浏览器本地存储里，不会上传。

## 三、macOS（原生 dmg，需要 macOS 或 CI）

Electron 的 dmg 必须在 macOS 上产出（需要 `hdiutil` 与 `codesign`）。两条路：

### A. 有 Mac
```bash
cd desktop
npm install
npm run build:mac        # 产出 release/WorkStream-Studio-macOS-0.1.0-universal.dmg
```

### B. 用 GitHub Actions（推荐）
1. 把 `docs/ci/release.yml.example` 复制为 `.github/workflows/release.yml` 并提交
   - 注意：推送 workflow 文件要求 token 具备 **Workflows: Read and write**
   - 也可以在 GitHub 网页端直接新建该文件，网页操作不受此限制
2. 打 tag：`git tag v0.1.0 && git push origin v0.1.0`
3. Actions 会在 `macos-latest` 上产出 x64 + arm64 的 dmg，并附到 Release

> 产物未签名，macOS 首次打开需要右键 →「打开」，或执行
> `xattr -dr com.apple.quarantine "/Applications/WorkStream Studio.app"`。

## 四、网页版（开发 / 自托管）

```bash
npm install
npm run dev            # http://127.0.0.1:5180
npm run build          # 产出 dist/，丢到任意静态服务器即可
```

`dist/` 自带 `manifest.webmanifest` 与 `sw.js`，所以自托管后立即具备 PWA 安装能力。

## 五、验证清单

| 检查项 | 命令 / 方式 |
|---|---|
| 类型 | `npm run typecheck` |
| 单测 | `npm run test`（20 用例） |
| 构建 | `npm run build` |
| 桌面运行 | `desktop\release\win-unpacked\WorkStream Studio.exe` |
| PWA 资源 | 部署后访问 `/manifest.webmanifest`、`/sw.js` 应返回 200 |
