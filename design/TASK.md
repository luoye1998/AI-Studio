# 设计任务书 · WorkStream Studio

> 给 WorkBuddy 的任务卡。读完本文件与 `BRIEF.md` 后直接在 `design/assets/` 下产出文件。

## 你要做的是一个「AI 影视生产流水线」产品 WorkStream Studio 的视觉资产

产品气质：**深色、电影感、克制、专业**。参考审美：Linear / Vercel / Arc / Framer 的深色界面，加一点 Blackmagic Design、DaVinci Resolve 的工业感。**不要**做成霓虹赛博、不要紫粉渐变、不要 3D 卡通、不要插画风圆润小人。

## 交付清单

全部输出到 `design/assets/`，**SVG 优先**（除特别注明）。

### A. 品牌
| 文件 | 规格 | 说明 |
|---|---|---|
| `logo-mark.svg` | 64×64 viewBox | 图形标：金色渐变圆角方块 + 深色 W 形折线。要能缩到 16px 还认得出 |
| `logo-mark-mono.svg` | 64×64 | 单色版（currentColor），用于浅底与印刷 |
| `logo-wordmark.svg` | 320×80 | 图形标 + 「WorkStream」字标（字标请用 path 转曲，别用 <text>） |
| `app-icon-1024.png` | 1024×1024 | 应用图标，圆角方块内留 20% 安全边距，macOS 风格 |
| `og-cover.svg` | 1200×630 | 社交分享封面：左侧标题「WorkStream Studio / AI 影视生产流水线」，右侧图形标 |

### B. 九阶段图标（24×24 grid，1.6 描边，仅线条）
`stage-01-concept.svg` … `stage-09-cinedance.svg`，每阶段一个意象：
1 概念锚定=锚/靶心 2 角色圣经=人物档案 3 世界观=层叠地形 4 分场大纲=分栏表格 5 正式剧本=文稿页 6 压力测试=脉冲/心率 7 图像资产=画框叠层 8 表演设计=面部侧影 9 镜头语言=取景框+光轴

### C. 空状态插画（480×320，线性 + 极淡填充，单色金）
- `empty-pipeline.svg` 空流水线
- `empty-assets.svg` 空资产库
- `empty-shots.svg` 空镜头
- `empty-budget.svg` 无消费记录
- `empty-knowledge.svg` 未挂载知识库

### D. 状态与徽标
- `badge-locked.svg` / `badge-review.svg` / `badge-budget.svg`（各 96×32，胶囊形，深色底 + 语义色描边）

### E. 设计令牌
- `tokens.json`：输出颜色 / 圆角 / 阴影 / 字号四组令牌，键名与 `BRIEF.md` 一致

## 硬性要求
1. **颜色只用 `BRIEF.md` 里的令牌**，不要自创色值。
2. 所有 SVG 必须：`viewBox` 存在、无外部字体引用、无 `<image>` 位图、无滤镜过大导致渲染卡顿。
3. 描边统一 `stroke-linecap="round"`，线条终点对齐像素网格。
4. 每个文件顶部加一行注释：`<!-- WorkStream Studio · <用途> -->`。
5. 交付时在 `design/assets/README.md` 里列一张表：文件名 / 尺寸 / 用在哪。

## 完成后
把 `design/assets/` 整个目录留在原地即可，代码侧会自动引用；另在 `design/assets/README.md` 末尾写一句「DONE」。
