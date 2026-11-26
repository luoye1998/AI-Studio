import type { SkillDef } from './types';

/**
 * 71 项专业导演技能（按阶段分组）
 * 直接对应洋子工作台附录速查表；用途：不写长 prompt，勾一下就把专业约束注入上下文
 */
export const SKILLS: SkillDef[] = [
  // 00 镜头语言工具箱
  { code: '00-A', stage: '00', title: '观众离人物多近', summary: '用远景、中景、近景和特写控制情绪距离。' },
  { code: '00-B', stage: '00', title: '摄影机为什么要动', summary: '选择有剧情理由的推、拉、摇、移、跟或环绕。' },
  { code: '00-C', stage: '00', title: '人物在画面里怎么站', summary: '用构图、前后景和留白表现人物关系。' },
  { code: '00-D', stage: '00', title: '光从哪里来', summary: '锁定光向、反差和色温，让光线参与叙事并保持连续。' },
  { code: '00-E', stage: '00', title: '什么时候切镜', summary: '选择动作匹配、遮挡、声音先行等合理剪切点。' },
  { code: '00-F', stage: '00', title: '特殊角度看世界', summary: '按需使用主观、俯拍、仰拍、贴地、虫视或鹰视。' },
  { code: '00-G', stage: '00', title: '复杂镜头怎么走', summary: '写清复合运镜的起点、路径、跟随对象和终点。' },

  // 01 概念锚定
  { code: '01-A', stage: '01', title: '保住作者自己的味道', summary: '把色彩、节奏、禁忌和偏好写成后续必须遵守的规则。' },
  { code: '01-B', stage: '01', title: '找适合的导演语言', summary: '按题材和情绪推荐视觉方向，只借方法不抄袭。' },
  { code: '01-C', stage: '01', title: '两种题材怎么结合', summary: '明确主类型和副类型分工，避免元素乱炖。' },
  { code: '01-D', stage: '01', title: '国漫仙侠方向', summary: '先定力量审美、气质和制作尺度，避免后面乱加大招。' },
  { code: '01-E', stage: '01', title: '真人短剧方向', summary: '强化开场黄金 3 秒钩子、人物欲望和短时长快节奏推进。' },

  // 02 角色圣经
  { code: '02-A', stage: '02', title: '古代宫廷人物', summary: '让身份、礼制、服装和行为相互匹配。' },
  { code: '02-B', stage: '02', title: '古代市井职业', summary: '用职业工具、生活痕迹和习惯把角色写鲜活。' },
  { code: '02-C', stage: '02', title: '古风男性造型', summary: '区分发型、冠饰、服装层级、身形和气质。' },
  { code: '02-D', stage: '02', title: '现代男性造型', summary: '用职业、年龄、穿着、体态拉开人物差异。' },
  { code: '02-E', stage: '02', title: '都市群像区分', summary: '给每个人不同的外形抓手、说话习惯和做事方式，不脸谱化。' },
  { code: '02-F', stage: '02', title: '女性造型区分', summary: '把发型、妆面、服装、年龄和人物目标连起来。' },
  { code: '02-G', stage: '02', title: '战斗身份', summary: '锁定训练背景、趁手武器、发力习惯和弱点限制。' },

  // 03 世界观
  { code: '03-A', stage: '03', title: '古风环境体系', summary: '统一建筑、街道、生活方式和空间层级。' },
  { code: '03-B', stage: '03', title: '都市环境体系', summary: '让地点符合人物贫富阶层和剧情功能。' },
  { code: '03-C', stage: '03', title: '混合题材地点', summary: '规定赛博修仙、现代奇幻等两种元素怎么自然共存。' },
  { code: '03-D', stage: '03', title: '法术属性规则', summary: '写清能力来源、表现、代价和克制关系，拒绝无脑开挂。' },
  { code: '03-E', stage: '03', title: '国漫大招体系', summary: '先定大招的剧情意义、蓄力前摇、代价和后果。' },
  { code: '03-F', stage: '03', title: '战斗空间规则', summary: '写清高低差、掩体障碍、退路和可利用机关。' },

  // 04 分场大纲
  { code: '04-A', stage: '04', title: '每场戏该有多长', summary: '按事件、对白和情绪做每场戏的秒数预算。' },
  { code: '04-B', stage: '04', title: '这场戏到底要完成什么', summary: '定清人物目标、冲突和关系变化，不提前乱拆碎镜头。' },
  { code: '04-C', stage: '04', title: '人物怎么进出和站位', summary: '规划从哪进门、站哪块区域，给后面摆机位留空间。' },
  { code: '04-D', stage: '04', title: '场与场怎么接', summary: '设计好看的上下场衔接点，不靠生硬特效转场。' },
  { code: '04-E', stage: '04', title: '动作戏先讲清因果', summary: '写清谁先动手、局势怎么反转、最后谁赢谁伤。' },
  { code: '04-F', stage: '04', title: '拆一部参考片的方法', summary: '只学优秀电影的场次结构与节拍，不抄台词剧情。' },

  // 05 正式剧本
  { code: '05-A', stage: '05', title: '台词像人说话', summary: '删掉生硬的说明书式台词，补上停顿、打断和话外之音。' },
  { code: '05-B', stage: '05', title: '每个人说话不一样', summary: '让霸总、老匠人、小姑娘开口就是各自的味儿。' },
  { code: '05-C', stage: '05', title: '前后不能穿帮', summary: '自动核对道具在谁手里、伤在哪只手、白天黑夜连不连贯。' },
  { code: '05-D', stage: '05', title: '动作写得能拍', summary: '把“两人大战三百回合”改成真能拍出来的一招一式。' },
  { code: '05-E', stage: '05', title: '大招必须推动剧情', summary: '让放大招跟人物抉择和代价绑在一起。' },
  { code: '05-F', stage: '05', title: '真人表演质感', summary: '去掉浮夸瞪眼式表演，补上真实生活小动作。' },

  // 07 图像资产 LIRA
  { code: '07-A', stage: '07', title: '角色 2×2 身份卡', summary: '一张图固定正面、侧面、全身和背面，最大程度防变脸换装。' },
  { code: '07-B', stage: '07', title: '主场景多角度图', summary: '先锁死门窗地标和光源方向，再换机位画正反打背景。' },
  { code: '07-C', stage: '07', title: '故事板一致性', summary: '用连环小图先查人物场景顺序对不对。' },
  { code: '07-D', stage: '07', title: '白模分镜与空间草图', summary: '先出黏土白模或铅笔草图核对空间遮挡。' },
  { code: '07-E', stage: '07', title: '构图与透视', summary: '定好前景遮挡、中景人物和远景纵深。' },
  { code: '07-F', stage: '07', title: '灯光与材质', summary: '固定冷暖色温、阴影反差和布料皮肤质感。' },
  { code: '07-G', stage: '07', title: '真人感', summary: '强化真实毛孔皮肤、自然衣褶和生活环境光，去 AI 油腻感。' },
  { code: '07-H', stage: '07', title: '古风场景资产', summary: '补足雕梁画栋、案几器物与时代烟火气。' },
  { code: '07-I', stage: '07', title: '静图能否直接微动', summary: '提前检查头发、衣摆和景深，让图生视频不容易崩坏融化。' },
  { code: '07-J', stage: '07', title: '导演风格与本机色卡', summary: '按资产挂载电影大师色调与构图参考。' },

  // 08 表演设计
  { code: '08-A', stage: '08', title: '微表情和真实反应', summary: '把情绪写成眼神躲闪、吞咽、呼吸停顿和手指动作。' },
  { code: '08-B', stage: '08', title: '情绪变成可见行为', summary: '把“内心纠结”变成看得见的动作节拍。' },
  { code: '08-C', stage: '08', title: '台词能自然说完', summary: '算准语速和换气时间，说不完就提醒拆镜头或精简字数。' },
  { code: '08-D', stage: '08', title: '配音怎么说', summary: '标清重音落在哪个词、用气声还是颤音、语速快慢。' },
  { code: '08-E', stage: '08', title: '声音和配乐任务', summary: '分清环境底噪、动作音效、人声留白和音乐进出点。' },
  { code: '08-F', stage: '08', title: '动作怎么表演', summary: '写清身体重心、受力后退和痛感反馈。' },
  { code: '08-G', stage: '08', title: '真人表演校正', summary: '加入真实的欲言又止、磕绊和视线转移。' },

  // 09 镜头与视频提示词
  { code: '09-A', stage: '09', title: '导演顾问', summary: '先定每个镜头为什么这么拍、在哪切镜，你拍板后后面严格执行。' },
  { code: '09-B', stage: '09', title: '叙事分镜与跨段接力', summary: '按剧情变化拆镜头，锁死上一段结尾姿势接下一段开头。' },
  { code: '09-C', stage: '09', title: '多人站位连续性', summary: '锁死左右轴线和朝向，不让两个人聊着天突然瞬移换边。' },
  { code: '09-D', stage: '09', title: '动作镜头设计', summary: '按“起势 → 碰撞 → 结果 → 反应”拆解动作戏。' },
  { code: '09-E', stage: '09', title: '特殊运镜', summary: '按剧情选用贴地跟拍、高空俯冲或环绕镜头。' },
  { code: '09-F', stage: '09', title: '静图微动视频', summary: '控制动作幅度，保护人物五官稳定不崩脸。' },
  { code: '09-G', stage: '09', title: '生成废片返修', summary: '视频抽卡翻车时，帮你精准找病根只改那一句提示词。' },
  { code: '09-H', stage: '09', title: '打斗动作与镜头增强', summary: '把攻防拆招、打击感和快慢镜头节奏写扎实。' },
  { code: '09-I', stage: '09', title: '兵器怎么打', summary: '按刀剑长枪的真实攻击距离、握法和收招设计镜头。' },
  { code: '09-J', stage: '09', title: '徒手怎么打', summary: '写清步法、拳脚落点和挨打后的真实身体反应。' },
  { code: '09-K', stage: '09', title: '战场怎么利用', summary: '把柱子、窄巷、悬崖地形用进打戏里。' },
  { code: '09-L', stage: '09', title: '特殊技能怎么接战斗', summary: '写清放技能的触发动作、波及范围和物理破坏。' },
  { code: '09-M', stage: '09', title: '打斗自检', summary: '自动排查穿模、左右方向打反和违反物理常识的动作。' },
  { code: '09-N', stage: '09', title: '大招完整五段链', summary: '按“前摇 → 聚能 → 释放 → 对抗 → 胜负结果”拆成震撼镜头链。' },
  { code: '09-O', stage: '09', title: '属性招式专项', summary: '设计火焰、雷电、冰雪、水墨等不同属性的粒子光影与环境互动。' },
  { code: '09-P', stage: '09', title: '国漫级奇观设计', summary: '拉开远近空间尺度升级视觉震撼感，不乱改胜负结局。' },
  { code: '09-Q', stage: '09', title: 'Seedance 精细适配', summary: '把确认好的镜头编译成多参考图、分秒控制的专用视频提示词。' },
];

export const SKILL_STAGE_LABEL: Record<string, string> = {
  '00': '镜头语言工具箱',
  '01': '概念锚定',
  '02': '角色圣经',
  '03': '世界观',
  '04': '分场大纲',
  '05': '正式剧本',
  '06': '剧本压力测试',
  '07': '图像资产',
  '08': '表演设计',
  '09': '镜头提示词',
};

export const skillsForStage = (stage: string): SkillDef[] =>
  SKILLS.filter((s) => s.stage === stage);

export const skillByCode = (code: string): SkillDef | undefined =>
  SKILLS.find((s) => s.code === code);
