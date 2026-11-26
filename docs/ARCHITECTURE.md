# WorkStream Studio 技术架构

> 单页前端 + Electron 壳，无后端依赖；领域逻辑集中在 `src/core`，状态集中在单一 store。

## 技术选型

| 选择 | 版本 | 理由 |
|---|---|---|
| React | 19.3 | 函数组件 + hooks；不引路由库，7 个视图由 `ui.view` 条件渲染，hash 手动同步 |
| Vite | 8.3 | `base: './'`，dev 端口 5180；同一份 `dist` 同时服务 Web 与 Electron `file://` |
| TypeScript | 5.9 | `strict`、`noUnusedLocals`、`noUnusedParameters`、`noEmit`；领域模型即契约 |
| Zustand | 5.0 | 单一 store + `persist`，只持久化 `projects` / `activeId` / `settings`；写操作集中，便于审计 |
| 零 UI 库 | — | `styles.css` 手写令牌与组件类，`kit.tsx` 提供 5 个原语，图标自绘；视觉需要细控，避免默认样式覆盖 |
| Electron | 33 | `desktop/main.js` + `preload.js`；`contextIsolation` 开、`nodeIntegration` 关；electron-builder 25 出 Windows / macOS / Linux 包 |

`core` 层不依赖 React 与 store，可单独测试、复用；`features` 只做展示与交互，业务计算全部下沉。

## 目录结构

```
WorkStream/
├─ index.html               入口，lang=zh-CN，挂载 #root
├─ src/
│  ├─ main.tsx              createRoot 挂载 App
│  ├─ App.tsx               应用壳：左栏、顶栏、视图切换、快捷键、hash、新建项目、Toast
│  ├─ core/                 纯 TS 领域层
│  │  ├─ types.ts           领域模型与枚举
│  │  ├─ stages.ts          九阶段定义、stageById、upstreamLocked
│  │  ├─ skills.ts          71 项技能与按阶段查询
│  │  ├─ palettes.ts        24 套 LIRA 色卡
│  │  ├─ budget.ts          单价、估算、预算闸口、台词秒数
│  │  ├─ prompt.ts          compileStagePrompt / compileShotPrompt / mockGenerate
│  │  ├─ seed.ts            演示项目、空项目、默认设置、uid
│  │  └─ desktop.ts         Electron 桥接与浏览器降级
│  ├─ store/store.ts        唯一 store、全部 action、persist 配置
│  ├─ features/             7 个视图 + GateModal + CommandPalette
│  └─ ui/                   Icons.tsx / kit.tsx / styles.css
├─ desktop/                 Electron 壳：main.js、preload.js、electron-builder.yml
├─ docs/                    产品、架构、设计文档
├─ vite.config.ts / tsconfig.json / package.json
```

## 领域模型

| 实体 | 关键字段 | 关系 |
|---|---|---|
| `Project` | `id`、`name`、`logline`、`genre`、`ratio`、`tier`、`budget`、`templateVersion`、`stages`、`gates`、`assets`、`shots`、`costs`、`logs`、`knowledge`、`palette` | 聚合根：1–9 `StageState`，1–* 其余实体 |
| `StageState` | `status`（idle / drafting / review / locked / skipped）、`content`、`notes`、`selectedSkills`、`versions`、`lockedVersionId`、`lockedAt` | 1–* `StageVersion`（content / skills / note / cost） |
| `Asset` | `kind`（character / scene / prop / style）、`name`、`role`、`prompt`、`views`、`versions`、`approvedVersionId` | 1–* `AssetVersionRef`；被 `Shot.refs` 引用 |
| `Shot` | `index`、`scene`、`beat`、`size`、`move`、`seconds`、`line`、`prompt`、`refs`、`status`（planned / generated / approved）、`color` | `refs: string[]` 指向 `Asset.id` |
| `Gate` | `kind`（g1 / g2 / budget）、`after: StageId`、`status`、`decision`、`comment`、`issues`、`rerunScope`（affected / node / all）、`decidedAt` | `after` 指向阶段；budget 闸口由超支动态创建 |
| `CostEntry` | `at`、`label`、`kind`（text / image / video / compose）、`units`（当前固定 1）、`amount`、`stage?` | 1–* 挂在 `Project.costs` |
| `KnowledgeBinding` | `mounted`、`folder`、`mode`（smart / method-only / off）、`docs` | 1–* `KnowledgeDoc`（name / kind / words / enabled） |
| `LogEntry` | `at`、`type`、`message`、`level` | 保留最近 200 条 |
| `Settings` | `providers`（text / image / video 三组）、`theme`、`reduceMotion` | 全局，不属于项目 |

静态表：`STAGES`（九阶段，含 `checks`、`estimate`、`unit`）、`SKILLS`（71）、`PALETTES`（24），项目只存 id 或引用。

```
Project 1 ── 9 StageState 1 ── * StageVersion
Project 1 ── * Gate.after ──→ StageId
Project 1 ── * Asset 1 ── * AssetVersionRef
Project 1 ── * Shot.refs ──→ Asset.id
Project 1 ── * CostEntry / LogEntry
Project 1 ── 1 KnowledgeBinding 1 ── * KnowledgeDoc
Project.palette ──→ PALETTES.id；Project.templateVersion 钉住模板快照
```

## 状态管理

- 单一 `useApp`；`persist` 的 `partialize` 排除 `ui`（当前视图、Toast、命令面板、闸口弹窗都是临时态），key 为 `workstream-studio-v1`，`version: 1`。
- `onRehydrateStorage` 修正失效的 `activeId`；页面用 `useActive()` 取当前项目。
- 写入统一走 action：不可变替换 `projects`，`log()` 追加事件并截断 200 条，`addCost()` 统一记账。
- 派生值不落库：`spent` / `remaining` / `projectEstimate` / `stageEstimate` / `checkBudget` / `lineSeconds`。

| 分组 | 动作 |
|---|---|
| UI | `setView`、`openStage`、`pushToast`、`dismissToast`、`setCommandOpen`、`setGateOpen` |
| 项目 | `createProject`、`deleteProject`、`selectProject`、`renameProject`、`patchActive`、`setPalette` |
| 阶段 | `setStageNotes`、`toggleSkill`、`generateStage`、`saveDraft`、`lockStage`、`unlockStage`、`skipStage` |
| 闸口 | `decideGate` |
| 资产 | `addAsset`、`updateAsset`、`generateAssetVersion`、`approveAsset`、`removeAsset` |
| 镜头 | `updateShot`、`generateShots`、`regenerateShot`、`approveShot` |
| 知识库 | `toggleKnowledge`、`setKnowledgeMode`、`setKnowledgeFolder`、`toggleDoc` |
| 设置 | `updateProvider`、`setBudget` |

`deleteProject`、`renameProject`、`patchActive`、`updateAsset` 已在 store 中，界面尚未暴露入口。

## 关键流程时序

1. `generateStage(id)`：若 `status==='locked'` 直接拒绝；按 `def.estimate × (1 + min(技能数, 6) × 0.06)` 估算；调 `checkBudget`。
2. 预算通过：`mockGenerate` 产出 → 新建 `StageVersion`（content / skills / cost / note）入栈（截断 20）→ `status='review'` → `addCost(kind = def.unit)` → `stage.generated` 日志 → Toast。
3. 预算不通过：创建 `Gate(kind='budget', after=id, status='waiting')` → `budget.block` 日志 → 打开 GateModal → 中止，不扣费。
4. 审阅：`saveDraft` 回写正文（idle → drafting）；`lockStage` 校验非空，生成「确认采用」版本（cost 0），置 `locked`、`lockedVersionId`、`lockedAt`。
5. 触发闸口：05 锁定且 G1 为 idle → G1 转 `waiting`；09 锁定且 G2 为 idle → G2 转 `waiting`。
6. `decideGate`：approve → 闸口 approved；预算闸口额外把 `budget × 1.2`；reject → 闸口 rejected，目标阶段回 `review` 并清空 `lockedVersionId`；决定写入日志并关闭模态。
7. 资产 / 镜头：`generateAssetVersion` 固定 ¥2 并追加占位版本（截断 12）；`approveAsset` 只改 `approvedVersionId`；`generateShots` 按未通过镜数 ×¥12；`regenerateShot` 记一笔视频成本并把镜头置回 generated；预算不足只 Toast，不创建 Gate。

## 提示词编译管线

`compileStagePrompt(project, stage)` 按顺序拼：

1. 任务：`StageDef.code / name / en`，声明只做本阶段交付物；
2. 影片设定：片名、logline、题材、画幅，挂色卡时附 master / name / colors；
3. 交付标准：`StageDef.checks` 编号列表；
4. 已锁定上游：`lockedContext` 只取阶段顺序之前且 `status==='locked'` 的正文，每段截断 4000 字；没有则声明本步为基础；
5. 专业约束：`selectedSkills` → `SkillDef.code / title / summary`；
6. 本步需求：`StageState.notes`，作为硬规则；
7. 输出要求：Markdown，只给交付物。

关键约束：只拼 `locked` 上游，不拼草稿；不拼资产、知识库与镜头；页面只负责预览与复制，不发网络请求。

`compileShotPrompt(project, shot)`：镜头号与场次 → 景别 / 运镜 / 秒数 / 画幅 → 画面内容 `beat` → 台词与秒数校准 → 参考图（`refs` → `Asset` 名称与「定妆版本」）→ 影调（色卡三色 + mood）→ 连续性约束（轴线、朝向、动作衔接、无字幕水印）。在镜头详情实时渲染，可一键复制。

## 前端与后端边界

当前是纯前端：视图、快捷键、hash 路由、提示词编译、mock 推演、预算估算、CSV 与打印在浏览器完成，JSON 导出在桌面端走系统保存对话框。

| 能力 | 现在 | 接入后端时替换 |
|---|---|---|
| 生成 | `mockGenerate` | provider adapter（文本 / 图像 / 视频），保持返回结构接 `StageVersion` / `AssetVersionRef` |
| 预算 | 本地 `UNIT_PRICE` + `checkBudget` | 服务端价格表、预扣与结算、预算闸口审批 API |
| 持久化 | Zustand `persist` → localStorage | Project / Asset / Cost / Event API + 对象存储；store 改走 repository |
| 知识库 | 本地文档元数据与启停 | 服务端解析、切分、向量检索，注入 05 提示词 |
| 权限与审批 | 无角色 | 账号体系；G1 制片、G2 导演等审批角色 |
| 桌面能力 | `core/desktop.ts` 封装 IPC | 保留；本地文件、系统菜单继续由 Electron 负责，Web 走降级 |

## 已知限制与演进

- 生成全部是本地推演；`Settings.providers` 只存配置，没有请求层与流式输出。
- 闸口状态只驱动界面与审批记录，没有拦截下游 `generateStage`；`rerunScope` 只落库并把目标阶段退回 `review`，不会真的批量重跑上游。
- 镜头没有版本历史，重做只改状态并记一笔成本；资产版本是占位 URI，没有媒体文件与合成。
- 知识库文档没有进入 `compileStagePrompt`，也没有真实索引。
- 数据单机存储在 localStorage；`openProjectFile` 已封装但未接 UI，刷新后的视图靠 hash 恢复（`ui` 不持久化）。
- 没有自动化测试、lint 与 CI。
- 演进方向：真实 provider 适配层 → 服务端状态机与审计事件 → IndexedDB 或文件存储 + 素材库 → 模板迁移与多项目 → 协作审批与权限。
