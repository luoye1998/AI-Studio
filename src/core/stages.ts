import type { StageDef, StageId } from './types';

/**
 * 九阶段流水线定义
 * 设计依据：洋子工作台九阶段（上下文隔离 + 锁稿铁律）
 * 增强依据：编排平台的薄状态机 / 预算闸口 / 成本计量
 */
export const STAGES: StageDef[] = [
  {
    id: 'concept',
    order: 1,
    code: '01',
    name: '概念锚定',
    en: 'CONCEPT',
    tagline: '定故事骨架、核心冲突与全片基调',
    purpose:
      '把一句话灵感扩写成有头有尾的「故事立项书」：主角是谁、钩子是什么、多长、什么画风、什么结局。先定骨架，别急着生图。',
    deliverable: '故事立项书',
    optional: false,
    checks: [
      '主角要干什么、遇到什么阻碍，写清楚了吗？',
      '画幅（16:9 / 9:16）与整体色调符合预期吗？',
      '开场 3 秒有没有能抓住人的钩子？',
    ],
    skillStage: '01',
    estimate: 1.0,
    unit: 'text',
  },
  {
    id: 'characters',
    order: 2,
    code: '02',
    name: '角色圣经',
    en: 'CHARACTERS',
    tagline: '给每个角色建「户口本」与外观锚点',
    purpose:
      '为全片所有出场角色建立人物档案：年龄、脸型五官、发型发色、标志服装、性格脾气、说话口癖。这是第 07 步锁死长相不穿帮的文字根基。',
    deliverable: '角色档案卡',
    optional: false,
    checks: [
      '每个角色的衣服、发型、年龄特征写具体了吗？',
      '描述是不是「可画」的（不要只写“很帅”）？',
      '主角与配角有没有外形抓手，能一眼区分？',
    ],
    skillStage: '02',
    estimate: 1.0,
    unit: 'text',
  },
  {
    id: 'world',
    order: 3,
    code: '03',
    name: '世界观',
    en: 'WORLD',
    tagline: '搭架空规则体系 · 现代日常戏可跳过',
    purpose:
      '为玄幻、科幻、架空历史建立空间建筑规则、战力等级与时代风貌，防止后面战力崩坏、无脑开挂。现代都市题材可直接跳过。',
    deliverable: '世界观设定集',
    optional: true,
    checks: [
      '能力来源、表现、代价、克制关系写清了吗？',
      '空间与建筑层级统一吗？',
      '有没有和后面剧情冲突的硬设定？',
    ],
    skillStage: '03',
    estimate: 1.0,
    unit: 'text',
  },
  {
    id: 'outline',
    order: 4,
    code: '04',
    name: '分场大纲',
    en: 'OUTLINE',
    tagline: '排场次、定每场秒数预算与人物走位',
    purpose:
      '在写台词之前先把片子拆成场次：哪拍、白天黑夜、谁出场、这场多少秒、人物从哪进门站哪、情绪怎么转。秒数预算是后面镜头时长的基础。',
    deliverable: '分场表',
    optional: false,
    checks: [
      '场次数量与每场秒数加起来符合目标片长吗？',
      '每场戏都有明确的目标 / 冲突 / 关系变化吗？',
      '人物进出与站位给后面摆机位留了空间吗？',
    ],
    skillStage: '04',
    estimate: 1.2,
    unit: 'text',
  },
  {
    id: 'script',
    order: 5,
    code: '05',
    name: '正式剧本',
    en: 'SCRIPT',
    tagline: '写出能直接拍的动作与台词',
    purpose:
      '把分场大纲扩写成标准影视文学剧本：把“他很伤心、菜很香”这类拍不出来的虚话，全部转成摄影机拍得到的可见动作，以及符合人物性格的台词。',
    deliverable: '定稿剧本',
    optional: false,
    checks: [
      '每场戏的场景、动作、台词都完整定稿了吗？',
      '台词像真人说话吗？每个人说话方式不一样吗？',
      '道具在谁手里、伤在哪只手、白天黑夜，前后连得上吗？',
    ],
    skillStage: '05',
    estimate: 1.5,
    unit: 'text',
  },
  {
    id: 'stress',
    order: 6,
    code: '06',
    name: '剧本压力测试',
    en: 'STRESS',
    tagline: 'AI 剧本医生全面体检 · 只出报告绝不改稿',
    purpose:
      '在花钱画图做视频之前，让剧本医生挑刺：动机合不合理、爽点够不够密、有没有前后矛盾或没法拍的废戏。黄金保护机制：本步只出《体检诊断报告》，绝不擅自修改第 05 步已锁定的剧本。',
    deliverable: '体检诊断报告',
    optional: true,
    checks: [
      '报告里指出的问题，你认可吗？',
      '要回 05 微调，还是维持原稿继续推进？',
    ],
    skillStage: '06',
    estimate: 1.0,
    unit: 'text',
  },
  {
    id: 'lira',
    order: 7,
    code: '07',
    name: '图像资产',
    en: 'LIRA',
    tagline: '提取美术清单 · 挂色卡 · 2×2 身份卡锁脸',
    purpose:
      '从文字进入视觉：把定稿剧本里出现的角色、场景、道具梳理成美术资产清单与生图提示词，联动资产库与导演色卡把图画出来死死锁定。',
    deliverable: '角色卡 / 场景图 / 道具图',
    optional: false,
    checks: [
      '导演色卡选定了吗？全片影调统一吗？',
      '每个主角都有 2×2 四视图身份卡吗？',
      '主场景有多角度图，正反打不穿帮吗？',
    ],
    skillStage: '07',
    estimate: 24,
    unit: 'image',
  },
  {
    id: 'acting',
    order: 8,
    code: '08',
    name: '表演设计',
    en: 'ACTING',
    tagline: '抠微表情与反应 · 精准测算每句台词几秒',
    purpose:
      '把剧本拆解为微表情、肢体受力反应、配音语气、环境音，并且精确计算每句台词自然说完需要几秒——解决“人物像木头桩子干张嘴”“话没说完就切镜头”。',
    deliverable: '表演指导表',
    optional: false,
    checks: [
      '每场戏的情绪节拍标出来了吗？',
      '每句台词都有秒数预算了吗？',
      '说不完的长台词，拆镜头或精简了吗？',
    ],
    skillStage: '08',
    estimate: 1.2,
    unit: 'text',
  },
  {
    id: 'cinedance',
    order: 9,
    code: '09',
    name: '镜头与视频提示词',
    en: 'CINEDANCE',
    tagline: '拆镜 + 摆机位 + 编译精准视频提示词',
    purpose:
      '把剧本、锁定的资产、算好秒数的表演，正式拆成一个个分镜镜头：定死景别、运镜、参考图，并编译成可直接喂给可灵 / 即梦 / Seedance 的视频提示词。',
    deliverable: '分镜表 + 视频提示词',
    optional: false,
    checks: [
      '每个镜头的景别、运镜有剧情理由吗？',
      '上下镜头的动作与朝向接得上吗？',
      '每镜的参考图和秒数都挂好了吗？',
    ],
    skillStage: '09',
    estimate: 1.5,
    unit: 'text',
  },
];

export const STAGE_ORDER: StageId[] = STAGES.map((s) => s.id);

export const stageById = (id: StageId): StageDef =>
  STAGES.find((s) => s.id === id) as StageDef;

/** 上次锁定的上游阶段（用于上下文隔离：只喂已锁定的定稿） */
export function upstreamLocked(project: { stages: Record<StageId, { status: string }> }, id: StageId): StageId[] {
  const idx = STAGE_ORDER.indexOf(id);
  if (idx <= 0) return [];
  return STAGE_ORDER.slice(0, idx).filter((s) => project.stages[s].status === 'locked');
}
