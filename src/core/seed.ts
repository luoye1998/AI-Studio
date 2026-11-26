import type { Asset, Gate, Project, Settings, Shot, StageId, StageState } from './types';
import { STAGES } from './stages';

const now = () => Date.now();
export const uid = (p = 'id') => `${p}_${Math.random().toString(36).slice(2, 10)}`;

function stageState(partial: Partial<StageState> = {}): StageState {
  return {
    status: 'idle',
    content: '',
    notes: '',
    selectedSkills: [],
    versions: [],
    lockedVersionId: null,
    lockedAt: null,
    ...partial,
  };
}

export function emptyStages(): Record<StageId, StageState> {
  const out = {} as Record<StageId, StageState>;
  for (const s of STAGES) out[s.id] = stageState();
  return out;
}

function asset(kind: Asset['kind'], name: string, role: string, prompt: string): Asset {
  const id = uid('asset');
  return {
    id,
    kind,
    name,
    role,
    prompt,
    views: [
      { key: 'front', label: '正面', versionId: null },
      { key: 'side', label: '侧面', versionId: null },
      { key: 'full', label: '全身', versionId: null },
      { key: 'back', label: '背面', versionId: null },
    ],
    versions: [],
    approvedVersionId: null,
    createdAt: now(),
  };
}

const DEFAULT_SHOTS: Array<Omit<Shot, 'id'>> = [
  { index: 1, scene: '旧城天井', beat: '镊子夹起半枚黄铜弹壳，雨水顺缺口滴落', size: '特写', move: '固定', seconds: 4, line: '', prompt: '', refs: [], status: 'planned', color: '#C9A227' },
  { index: 2, scene: '旧城天井', beat: '林深蹲姿起身，膝盖响了一声，胸袋露出钢笔', size: '中景', move: '缓推', seconds: 5, line: '', prompt: '', refs: [], status: 'planned', color: '#7A5C3E' },
  { index: 3, scene: '旧城天井', beat: '他身后的新区玻璃幕墙亮着，一动不动', size: '大远景', move: '固定', seconds: 4, line: '', prompt: '', refs: [], status: 'planned', color: '#2C3E50' },
  { index: 4, scene: '新区大堂', beat: '苏晚转身，右眼角泪痣入画，银表反光', size: '近景', move: '固定', seconds: 5, line: '你来得比我算的晚了四十分钟。', prompt: '', refs: [], status: 'planned', color: '#93A57F' },
  { index: 5, scene: '新区大堂', beat: '两人隔着三米对峙，冷白石材地面映出倒影', size: '双人中景', move: '横移', seconds: 6, line: '路上有雨。', prompt: '', refs: [], status: 'planned', color: '#6E8891' },
  { index: 6, scene: '老街高架下', beat: '尾灯横扫桥墩，老周把潮软的牛皮纸袋递过去', size: '全景', move: '跟移', seconds: 7, line: '', prompt: '', refs: [], status: 'planned', color: '#8A3B1E' },
  { index: 7, scene: '断电十分钟', beat: '整片旧城沉进黑里，只剩呼吸声', size: '全黑', move: '固定', seconds: 3, line: '', prompt: '', refs: [], status: 'planned', color: '#0B0F0D' },
  { index: 8, scene: '断电十分钟', beat: '「我知道。」林深的手停在半空，肩膀下沉', size: '特写', move: '固定', seconds: 6, line: '我知道。', prompt: '', refs: [], status: 'planned', color: '#3E5C4B' },
  { index: 9, scene: '断电十分钟', beat: '黑暗里只剩轮廓，苏晚的银表微微反光', size: '近景', move: '缓推', seconds: 5, line: '那你为什么还找。', prompt: '', refs: [], status: 'planned', color: '#4D4D4D' },
  { index: 10, scene: '天井清晨', beat: '第一缕光落进天井，弹壳躺在积水里', size: '大远景', move: '升', seconds: 6, line: '', prompt: '', refs: [], status: 'planned', color: '#E0C9A6' },
];

export function createDemoProject(): Project {
  const stages = emptyStages();
  const chars = [
    asset('character', '林深', '主角 · 男 32', `窄长脸，颧骨高，左眉尾一道旧疤；短寸，鬓角零星白发；洗到发灰的深蓝夹克，右袖口磨破；内搭黑色圆领 T，胸前插一支旧钢笔。`),
    asset('character', '苏晚', '对手 · 女 29', `鹅蛋脸，鼻梁挺，右眼角下方一颗泪痣；及肩黑直发别在耳后；米白风衣，腕戴裂表盘旧银表。`),
    asset('character', '老周', '配角 · 男 55', `圆脸，啤酒肚；洗白工装外套，手背有冻疮；说话爱重复对方最后三个字。`),
    asset('scene', '旧城天井', '主场景', `三面楼夹出的窄天井，一面砖墙一面瓷砖剥落，地面常年积水，唯一光源是二楼声控灯。`),
    asset('scene', '新区大堂', '对照场景', `冷白石材，6 米挑高，前台背板有品牌灯箱，恒温空气里有柠檬味。`),
  ];

  stages.concept = stageState({
    status: 'locked',
    content: `# 《雨夜第七秒》故事立项书

## 一句话故事
一个被生活压住的男人，在旧城断电的十分钟里，终于说出憋了十年的话。

## 类型与基调
- 题材：都市悬疑 / 情感
- 片长：竖屏 3 分钟 / 6 场
- 影调：潮湿、克制，冷光里有一点暖

## 主角
林深，32 岁，做着一份随时会被替代的工作。他有一枚不该存在的黄铜弹壳。

## 核心冲突
他必须在「保住现在」和「拿回属于他的」之间选一个，而这两个选项背后是同一个人。

## 开场 3 秒钩子
雨夜，他蹲在积水里，用镊子夹起一枚变形的黄铜弹壳——镜头抬起，他身后站着本不该出现的人。`,
    versions: [],
    lockedAt: now(),
  });
  stages.concept.lockedVersionId = uid('v');
  stages.concept.versions = [
    { id: stages.concept.lockedVersionId, createdAt: now(), content: stages.concept.content, skills: [], note: '定稿', cost: 0.8 },
  ];

  stages.characters = stageState({
    status: 'locked',
    content: `# 角色圣经

## 林深（男，32）
窄长脸，颧骨高，左眉尾一道旧疤；短寸，鬓角零星白发；洗到发灰的深蓝夹克，右袖口磨破；说话爱用「行吧」结尾。

## 苏晚（女，29）
鹅蛋脸，鼻梁挺，右眼角下一颗泪痣；及肩黑直发别在耳后；米白风衣，腕戴裂表盘旧银表；反问句多。

## 老周（男，55）
圆脸，啤酒肚；洗白工装外套，手背冻疮；爱重复对方最后三个字。`,
    versions: [],
    lockedAt: now(),
  });
  stages.characters.lockedVersionId = uid('v');
  stages.characters.versions = [
    { id: stages.characters.lockedVersionId, createdAt: now(), content: stages.characters.content, skills: ['02-D', '02-E'], note: '定稿', cost: 0.9 },
  ];

  stages.outline = stageState({
    status: 'locked',
    content: `# 分场大纲（总时长 178s）

| # | 场景 | 时间 | 出场 | 时长 | 这场戏要完成什么 |
|---|---|---|---|---|---|
| 1 | 旧城天井 | 夜/雨 | 林深 | 22s | 交代处境与执念 |
| 2 | 新区大堂 | 夜 | 林深、苏晚 | 31s | 两人重逢 |
| 3 | 老街高架下 | 夜 | 林深、老周 | 28s | 交出关键线索 |
| 4 | 苏晚办公室 | 夜 | 苏晚 | 26s | 揭示她早已知道 |
| 5 | 旧城断电十分钟 | 夜 | 林深、苏晚 | 41s | 正面对峙 |
| 6 | 天井清晨 | 日 | 林深 | 30s | 结局 |`,
    versions: [],
    lockedAt: now(),
  });
  stages.outline.lockedVersionId = uid('v');
  stages.outline.versions = [
    { id: stages.outline.lockedVersionId, createdAt: now(), content: stages.outline.content, skills: ['04-A'], note: '定稿', cost: 1.1 },
  ];

  stages.script = stageState({
    status: 'review',
    content: `# 正式剧本 · 第 1 场

雨砸在铁皮雨棚上，声音像有人在上面走。

林深蹲在积水里，袖口泡得发黑。镊子尖端夹起半枚黄铜弹壳，泥水顺着缺口滴下来。

**林深**（低声）
行吧。

## 第 2 场 · 新区大堂

**苏晚**
你来得比我算的晚了四十分钟。

**林深**
路上有雨。`,
    notes: '本片必须是 3 分钟竖屏，台词不准文绉绉。',
    selectedSkills: ['05-A', '05-B', '05-C'],
    versions: [],
  });

  const gates: Gate[] = [
    {
      id: uid('gate'),
      kind: 'g1',
      title: 'G1 · 剧本定稿闸口',
      after: 'script',
      status: 'idle',
      createdAt: now(),
      decidedAt: null,
      decision: null,
      comment: '',
      issues: [],
      rerunScope: 'affected',
    },
    {
      id: uid('gate'),
      kind: 'g2',
      title: 'G2 · 成片终审闸口',
      after: 'cinedance',
      status: 'idle',
      createdAt: now(),
      decidedAt: null,
      decision: null,
      comment: '',
      issues: [],
      rerunScope: 'affected',
    },
  ];

  const shots: Shot[] = DEFAULT_SHOTS.map((s) => ({ ...s, id: uid('shot') }));

  return {
    id: uid('proj'),
    name: '雨夜第七秒',
    logline: '一个被生活压住的男人，在旧城断电的十分钟里，终于说出憋了十年的话。',
    genre: '都市悬疑',
    ratio: '9:16',
    tier: 'pro',
    budget: 120,
    createdAt: now(),
    updatedAt: now(),
    templateVersion: 'tpl-shortfilm@1.2.0',
    stages,
    gates,
    assets: chars,
    shots,
    costs: [
      { id: uid('c'), at: now() - 3600_000, label: '01 概念锚定 · 文本生成', kind: 'text', units: 1, amount: 0.8 },
      { id: uid('c'), at: now() - 3400_000, label: '02 角色圣经 · 文本生成', kind: 'text', units: 1, amount: 0.9 },
      { id: uid('c'), at: now() - 3200_000, label: '04 分场大纲 · 文本生成', kind: 'text', units: 1, amount: 1.1 },
    ],
    logs: [
      { id: uid('l'), at: now() - 3600_000, type: 'stage.locked', message: '01 概念锚定 已锁定', level: 'success' },
      { id: uid('l'), at: now() - 3400_000, type: 'stage.locked', message: '02 角色圣经 已锁定', level: 'success' },
      { id: uid('l'), at: now() - 3200_000, type: 'stage.locked', message: '04 分场大纲 已锁定', level: 'success' },
      { id: uid('l'), at: now() - 600_000, type: 'stage.draft', message: '05 正式剧本 生成草稿，等待审阅', level: 'info' },
    ],
    knowledge: {
      mounted: true,
      folder: '~/Documents/screenwriting-books',
      mode: 'smart',
      docs: [
        { id: uid('doc'), name: '故事·材质·结构·风格与银幕剧作原理', kind: 'method', words: 182_000, enabled: true },
        { id: uid('doc'), name: '编剧步步为营', kind: 'method', words: 96_000, enabled: true },
        { id: uid('doc'), name: '参考剧本_雨夜类型合集', kind: 'script', words: 41_000, enabled: false },
      ],
    },
    palette: 'p-fincher',
  };
}

export function createEmptyProject(name: string, logline: string): Project {
  return {
    id: uid('proj'),
    name: name || '未命名项目',
    logline,
    genre: '都市悬疑',
    ratio: '9:16',
    tier: 'novice',
    budget: 100,
    createdAt: now(),
    updatedAt: now(),
    templateVersion: 'tpl-shortfilm@1.2.0',
    stages: emptyStages(),
    gates: [
      { id: uid('gate'), kind: 'g1', title: 'G1 · 剧本定稿闸口', after: 'script', status: 'idle', createdAt: now(), decidedAt: null, decision: null, comment: '', issues: [], rerunScope: 'affected' },
      { id: uid('gate'), kind: 'g2', title: 'G2 · 成片终审闸口', after: 'cinedance', status: 'idle', createdAt: now(), decidedAt: null, decision: null, comment: '', issues: [], rerunScope: 'affected' },
    ],
    assets: [],
    shots: [],
    costs: [],
    logs: [{ id: uid('l'), at: now(), type: 'project.created', message: `项目「${name || '未命名项目'}」已创建`, level: 'success' }],
    knowledge: { mounted: false, folder: '', mode: 'off', docs: [] },
    palette: null,
  };
}

export const DEFAULT_SETTINGS: Settings = {
  providers: [
    { kind: 'text', provider: 'OpenAI 兼容', baseUrl: 'https://api.deepseek.com/v1', model: 'deepseek-chat', enabled: true },
    { kind: 'image', provider: 'OpenAI 兼容', baseUrl: '', model: 'wanx-v1', enabled: false },
    { kind: 'video', provider: '可灵 / 即梦', baseUrl: '', model: '', enabled: false },
  ],
  theme: 'noir',
  reduceMotion: false,
};
