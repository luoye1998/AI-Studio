import type { Project, Shot, StageId } from './types';
import { STAGE_ORDER, stageById } from './stages';
import { skillByCode } from './skills';
import { paletteById } from './palettes';

/** 已锁定的上游定稿（上下文隔离：只喂这些，不喂草稿） */
export function lockedContext(project: Project, id: StageId): { stage: StageId; name: string; content: string }[] {
  const idx = STAGE_ORDER.indexOf(id);
  return STAGE_ORDER.slice(0, idx)
    .filter((s) => project.stages[s].status === 'locked')
    .map((s) => ({ stage: s, name: stageById(s).name, content: project.stages[s].content }));
}

export function compileStagePrompt(project: Project, id: StageId): string {
  const def = stageById(id);
  const st = project.stages[id];
  const palette = paletteById(project.palette);
  const skills = st.selectedSkills.map((c) => skillByCode(c)).filter(Boolean);

  const parts: string[] = [];
  parts.push(`# 任务：${def.code} ${def.name}（${def.en}）`);
  parts.push(`您是这部电影的总导演兼编剧。本步只做「${def.deliverable}」，不要越界写后面的内容。`);
  parts.push('');
  parts.push('## 影片设定');
  parts.push(`- 片名：${project.name}`);
  parts.push(`- 一句话故事：${project.logline || '（待补充）'}`);
  parts.push(`- 题材：${project.genre || '（待补充）'}`);
  parts.push(`- 画幅：${project.ratio}`);
  if (palette) parts.push(`- 视觉基准（LIRA 色卡）：${palette.master} · ${palette.name} · ${palette.colors.join(' / ')}`);

  if (def.checks.length) {
    parts.push('');
    parts.push('## 交付标准（必须逐条满足）');
    def.checks.forEach((c, i) => parts.push(`${i + 1}. ${c}`));
  }

  const ctx = lockedContext(project, id);
  if (ctx.length) {
    parts.push('');
    parts.push('## 已锁定的上游定稿（不可篡改，必须严格遵循）');
    for (const c of ctx) {
      parts.push(`### ${c.name}`);
      parts.push(c.content.slice(0, 4000));
      parts.push('');
    }
  } else {
    parts.push('');
    parts.push('## 上游状态：尚无锁定稿，本步即为基础。');
  }

  if (skills.length) {
    parts.push('## 本步启用的专业约束');
    skills.forEach((s) => parts.push(`- ${s!.code} ${s!.title}：${s!.summary}`));
  }

  if (st.notes.trim()) {
    parts.push('');
    parts.push('## 本步需求（硬规则）');
    parts.push(st.notes.trim());
  }

  parts.push('');
  parts.push(`## 输出要求：Markdown，直接给可用的「${def.deliverable}」，不要解释过程。`);
  return parts.join('\n');
}

export function compileShotPrompt(project: Project, shot: Shot): string {
  const palette = paletteById(project.palette);
  const refs = shot.refs
    .map((id) => project.assets.find((a) => a.id === id))
    .filter(Boolean)
    .map((a) => `${a!.name}（${a!.kind === 'character' ? '角色' : a!.kind === 'scene' ? '场景' : '道具'}·定妆版本）`);

  const lines: string[] = [];
  lines.push(`【镜头 ${String(shot.index).padStart(2, '0')}｜${shot.scene}】`);
  lines.push(`${shot.size}，${shot.move}，时长 ${shot.seconds}s，${project.ratio}`);
  lines.push(`画面内容：${shot.beat}`);
  if (shot.line) lines.push(`同期台词：「${shot.line}」（配音节奏已按 ${shot.seconds}s 校准）`);
  if (refs.length) lines.push(`参考图：${refs.join('、')}（严格保持人物五官、发型、服装一致）`);
  if (palette) lines.push(`影调：${palette.master} 风格，主色 ${palette.colors.slice(0, 3).join(' ')}，${palette.mood}`);
  lines.push(`连续性：与上一镜头保持轴线与朝向一致，动作无缝衔接；无字幕、无水印。`);
  return lines.join('\n');
}

/** 无 API Key 时的本地推演产出：结构真实、可直接编辑或替换 */
export function mockGenerate(project: Project, id: StageId): string {
  const st = project.stages[id];
  const skills = st.selectedSkills.map((c) => skillByCode(c)?.title).filter(Boolean);
  const skillLine = skills.length ? `> 已注入专业约束：${skills.join('、')}\n` : '';
  const name = project.name;
  const logline = project.logline || '一个被生活压住的人，决定赌一次。';

  switch (id) {
    case 'concept':
      return `${skillLine}# 《${name}》故事立项书

## 一句话故事
${logline}

## 类型与基调
- 题材：${project.genre || '都市悬疑'}
- 片长：${project.ratio === '9:16' ? '竖屏 3 分钟 / 约 6 场' : '横屏 12 分钟 / 约 9 场'}
- 影调关键词：潮湿、克制、冷光里有一点暖

## 主角
**（待命名）** —— 32 岁，做着一份随时会被替代的工作。他有一个不能说出口的执念，和一件不愿再提的旧事。

## 核心冲突
他必须在「保住现在拥有的」和「拿回本来属于他的」之间选一个，而这两个选项背后是同一个人。

## 开场 3 秒钩子
雨夜，他蹲在积水里，用镊子夹起一枚变形的黄铜弹壳——镜头抬起，他身后站着本不该出现的人。

## 结局方向
没有赢家，但他终于说出那句憋了十年的话。`;

    case 'characters':
      return `${skillLine}# 角色圣经

## 主角 · 林深（男，32）
- 脸型五官：窄长脸，颧骨高，左眉尾有一道旧疤；眼睛偏细长，看人时不自觉眯起
- 发型发色：短寸，鬓角有零星白发
- 标志服装：洗到发灰的深蓝夹克，右袖口磨破；内搭黑色圆领 T，胸前口袋总插着一支旧钢笔
- 性格脾气：话少，习惯先观察再开口；被逼急了会突然笑一下
- 说话口癖：喜欢用「行吧」结尾，句子里很少出现「我」

## 对手 · 苏晚（女，29）
- 脸型五官：鹅蛋脸，鼻梁挺，右眼角下方有一颗泪痣
- 发型发色：及肩黑直发，常年别在耳后
- 标志服装：米白风衣，手腕戴一只旧银表（表盘有裂纹）
- 性格脾气：表面温和，实际每一步都在计算
- 说话口癖：反问句多，「你觉得呢」是她的武器

## 配角 · 老周（男，55）
- 圆脸，啤酒肚，永远穿一件洗白的工装外套；说话爱重复对方最后三个字

## 可画性自检
- 三个角色的轮廓、发色、服装主色互不重叠 → 远景可区分
- 每人一个可复现的「小道具」→ 中近景可识别`;
    case 'world':
      return `${skillLine}# 世界观设定

## 空间层级
- 旧城区：1980 年代筒子楼、锈蚀水管、永远在滴水的天井
- 新区：玻璃幕墙、恒温大堂、地下车库三层
- 分界线：一条被高架遮住的老街，白天是新区的影子，夜里是旧城的出口

## 规则
- 旧城区夜里 11 点后会断电十分钟（历史遗留的限电），这十分钟是所有事发生的时间窗
- 新区门禁记录可查，但只保留 72 小时

## 时代风貌
- 手机是五年前的型号，屏幕有裂
- 没有无人机、没有全息；科技感只体现在监控与门禁的冷漠上`;
    case 'outline':
      return `${skillLine}# 分场大纲（总时长 178s）

| # | 场景 | 时间 | 出场 | 时长 | 这场戏要完成什么 |
|---|---|---|---|---|---|
| 1 | 旧城天井 | 夜/雨 | 林深 | 22s | 交代处境与执念：他在找一枚弹壳 |
| 2 | 新区大堂 | 夜 | 林深、苏晚 | 31s | 两人重逢，观众察觉他们有过往 |
| 3 | 老街高架下 | 夜 | 林深、老周 | 28s | 老周交出关键线索，代价是被看见 |
| 4 | 苏晚办公室 | 夜 | 苏晚 | 26s | 揭示她早已知道，且一直在等 |
| 5 | 旧城断电十分钟 | 夜 | 林深、苏晚 | 41s | 正面对峙，说出十年那句 |
| 6 | 天井清晨 | 日 | 林深 | 30s | 结局：没有赢家，但他放下了 |

## 节奏检查
- 前 3 场（81s）完成建置与第一次反转
- 第 5 场 41s 为全片最长，情绪峰值提前留足空间`;
    case 'script':
      return `${skillLine}# 正式剧本

## 第 1 场 · 旧城天井 · 夜 · 外

雨砸在铁皮雨棚上，声音像有人在上面走。

林深蹲在积水里，袖口泡得发黑。镊子尖端夹起半枚黄铜弹壳，泥水顺着缺口滴下来。

他把弹壳举到路灯下，缺口边缘有一道极细的划痕——是被人用刀刻过的那种。

**林深**（低声，像对自己说）
行吧。

他把弹壳塞进胸袋，起身时膝盖响了一声。

远处，新区的玻璃幕墙亮着，一动不动。

## 第 2 场 · 新区大堂 · 夜 · 内

恒温的空气里有一股柠檬味。

林深站在门口，鞋底还在滴水。保安看了他一眼，又看了一眼。

**苏晚**
你来得比我算的晚了四十分钟。

她转过身，右眼角的泪痣在灯下很浅。

**林深**
路上有雨。

**苏晚**
（笑了一下）
你还是这样。什么都不解释。

## 第 5 场 · 旧城断电十分钟 · 夜 · 外

11 点整。整片旧城沉进黑里。

只有远处高架的尾灯，一明一暗地扫过天井。

**苏晚**
（在黑暗里）
你找的那个东西，当年是我扔的。

林深的手停在半空。他没有回头。

**林深**
我知道。

**苏晚**
那你为什么还找。

**林深**
（停顿 2 秒）
因为除了这个，我没别的能证明那天真的发生过。`;
    case 'stress':
      return `${skillLine}# 剧本体检报告

## 结论
可拍，但有三处会拖慢节奏。

## 问题清单
1. **【高】第 3 场信息量偏低**：老周交线索的过程只有对白，缺少一个可视化的动作载体。建议让他把东西藏在某个只有镜头能看见的地方。
2. **【中】第 4 场苏晚独处**：目前只有背影与 OS，容易变成"解释性旁白"。建议加一个具体动作（焚纸 / 擦表 / 拉开抽屉）承担信息。
3. **【中】第 5 场台词偏长**：林深最后一句 38 字，按 4.2 字/秒需 9.1s，加停顿会突破 12s 单镜上限，建议拆成两个镜头。
4. **【低】第 6 场清晨**：缺少一个"回扣开场"的物件特写，情绪收束会弱。

## 不改稿声明
本报告不代表修改建议已执行；第 05 步定稿保持原样。`;
    case 'lira':
      return `${skillLine}# 美术资产清单（LIRA）

## 角色卡
| 资产 | 关键锚点 | 视图 | 生成要点 |
|---|---|---|---|
| 林深 | 左眉尾旧疤 / 深蓝夹克右袖口磨破 / 寸头 | 2×2 四视图 | 冷光下皮肤有油汗感，不要把疤画到右眉 |
| 苏晚 | 右眼角泪痣 / 米白风衣 / 裂表盘银表 | 2×2 四视图 | 泪痣必须在画面右侧 |
| 老周 | 圆脸啤酒肚 / 洗白工装 / 手背冻疮 | 2×2 四视图 | 手部细节要脏 |

## 场景图
- 旧城天井：三面楼夹出的窄天井，一面是砖，一面是瓷砖剥落，地面常年积水，唯一光源是二楼声控灯
- 新区大堂：冷白石材，6 米挑高，前台背板有品牌灯箱（可替换）
- 老街高架下：桥墩之间狭长通道，尾灯横向扫过

## 道具
- 半枚黄铜弹壳（缺口、刀刻划痕）
- 裂表盘旧银表
- 老周的牛皮纸袋（潮到发软）

## 一致性硬控
- 全部资产挂载同一 LIRA 色卡，不用默认滤镜
- 角色先出 \`07-A 2×2 身份卡\`，通过后再进入分镜生图`;
    case 'acting':
      return `${skillLine}# 表演设计表

| 场次 | 节拍 | 微表情 / 反应 | 台词 | 字数 | 秒数预算 |
|---|---|---|---|---|---|
| 1 | 发现弹壳 | 屏息 0.5s → 瞳孔收缩 → 吞咽 | 「行吧。」 | 3 | 1.8s（建议镜头 4s） |
| 2 | 重逢 | 视线先落在表上，再抬到脸 | 「路上有雨。」 | 5 | 2.4s |
| 2 | 被戳穿 | 手指无意识摩挲胸袋 | 「你还是这样。」 | 6 | 3.1s |
| 5 | 黑暗告白 | 手停半空 → 肩膀下沉 1cm | 「我知道。」 | 4 | 2.1s |
| 5 | 十年那句 | 深呼吸 → 喉结动 → 才开口 | 「因为除了这个……」 | 38 | **9.1s（超单镜，拆两镜）** |

## 声音设计
- 第 1 场：雨声占 70%，铁皮雨棚单独一层，混响短
- 第 5 场：断电瞬间全部环境声抽掉 0.8s，只留呼吸
- 全片不铺旋律，只用低频嗡鸣

## 硬提醒
第 5 场最后一句必须拆镜，否则人物会「话没说完就被切走」。`;
    case 'cinedance':
      return `${skillLine}# 分镜表

| # | 场 | 景别 | 运镜 | 秒 | 画面 |
|---|---|---|---|---|---|
| 01 | 天井 | 特写 | 固定 | 4 | 镊子夹起弹壳，雨水顺缺口滴落 |
| 02 | 天井 | 中景 | 缓推 | 5 | 林深蹲姿起身，膝盖作响 |
| 03 | 天井 | 大远景 | 固定 | 4 | 他身后的新区玻璃幕墙亮着 |
| 04 | 大堂 | 近景 | 固定 | 5 | 苏晚转身，泪痣入画 |
| 05 | 大堂 | 双人中景 | 横移 | 6 | 两人隔着三米对峙 |
| 06 | 高架 | 全景 | 跟移 | 7 | 尾灯横扫过桥墩，老周递袋 |
| 07 | 断电 | 全黑 | 固定 | 3 | 只剩呼吸声 |
| 08 | 断电 | 特写 | 固定 | 6 | 「我知道。」手停半空 |
| 09 | 断电 | 近景 | 缓推 | 5 | 黑暗里只剩轮廓 |
| 10 | 清晨 | 大远景 | 升 | 6 | 天井第一缕光，弹壳在积水里 |

## 视频提示词编译
每镜头已按 \`09-Q Seedance 精细适配\` 编译，含参考图、秒数、影调、连续性约束；在「镜头」页可逐条复制。`;
    default:
      return '（暂不支持该阶段）';
  }
}
