/**
 * LIRA 导演色卡
 * 作用：给全片一个统一的视觉基准，解决「单张还行、十张放一起就露馅」的 AI 塑料感。
 * 说明：这里收录 24 套可直接使用的影调方案（可自行扩展），按 10 大美学分类归档。
 */

export interface Palette {
  id: string;
  name: string;
  master: string;
  category: string;
  colors: string[];
  mood: string;
}

export const PALETTES: Palette[] = [
  { id: 'p-bong', name: '汉江阴冷', master: '奉俊昊', category: '黑色悬疑', colors: ['#1B2A24', '#3E5C4B', '#93A57F', '#D8C9A3'], mood: '潮湿、压抑、阶级感' },
  { id: 'p-villeneuve', name: '沙尘史诗', master: '维伦纽瓦', category: '动作史诗', colors: ['#2A2118', '#7A5C3E', '#C9A227', '#EDE3D0'], mood: '辽阔、肃穆、慢镜' },
  { id: 'p-wong', name: '霓虹暧昧', master: '王家卫', category: '霓虹赛博', colors: ['#0E1B1A', '#1F6F5C', '#E2453C', '#F2C14E'], mood: '暧昧、孤独、流动' },
  { id: 'p-miyazaki', name: '柔光治愈', master: '宫崎骏', category: '东方留白', colors: ['#2C4A3B', '#6FA287', '#C9DBA8', '#F4EFD9'], mood: '温暖、通透、童年' },
  { id: 'p-zhang', name: '浓烈东方', master: '张艺谋', category: '东方留白', colors: ['#2B0A0A', '#8C1C13', '#D64545', '#E8C547'], mood: '仪式感、高饱和、对称' },
  { id: 'p-nolan', name: '冷青秩序', master: '克里斯托弗·诺兰', category: '黑色悬疑', colors: ['#10161C', '#2C3E50', '#7C8FA6', '#DCE3EA'], mood: '理性、结构、压迫' },
  { id: 'p-fincher', name: '墨绿病态', master: '大卫·芬奇', category: '黑色悬疑', colors: ['#0B0F0D', '#2B3A2F', '#6B7F5E', '#C2B280'], mood: '冷静、精确、不安' },
  { id: 'p-kurosawa', name: '水墨风暴', master: '黑泽明', category: '东方留白', colors: ['#1A1A1A', '#4D4D4D', '#8C8C8C', '#E6E6E6'], mood: '动静对比、天气叙事' },
  { id: 'p-wes', name: '粉彩对称', master: '韦斯·安德森', category: '东方留白', colors: ['#F2D5B8', '#E8A0A0', '#7FB3D5', '#F6E7A1'], mood: '童话、秩序、幽默' },
  { id: 'p-cyber', name: '霓虹雨夜', master: '赛博朋克', category: '霓虹赛博', colors: ['#0A0A12', '#2B1B4D', '#E23CE8', '#3CE8E0'], mood: '高对比、潮湿、科技' },
  { id: 'p-wasteland', name: '废土黄沙', master: '乔治·米勒', category: '动作史诗', colors: ['#3A2A1A', '#8C5A2B', '#D98E32', '#E8D9B0'], mood: '狂躁、燥热、速度' },
  { id: 'p-noir', name: '黑白硬汉', master: '经典黑色电影', category: '黑色悬疑', colors: ['#0D0D0D', '#3D3D3D', '#9E9E9E', '#F2F2F2'], mood: '百叶窗、雨、阴影' },
  { id: 'p-anime', name: '国漫热血', master: '国产动画', category: '动作史诗', colors: ['#141024', '#4B2A7B', '#C63D6B', '#F2B33D'], mood: '大招、粒子、燃' },
  { id: 'p-ghibli-green', name: '夏日原野', master: '吉卜力', category: '东方留白', colors: ['#3D6B4A', '#7FB069', '#D9E5B0', '#F7F3E3'], mood: '风、云、草地' },
  { id: 'p-horror', name: '幽绿惊悚', master: '恐怖片语法', category: '黑色悬疑', colors: ['#0A1410', '#1E3A2A', '#4F7A5A', '#B8C9A8'], mood: '夜视、失控、呼吸' },
  { id: 'p-warm-drama', name: '暖调家庭', master: '是枝裕和', category: '东方留白', colors: ['#4A3A2A', '#A8845C', '#E0C9A6', '#F5EFE6'], mood: '日常、克制、温柔' },
  { id: 'p-cold-war', name: '冷灰谍战', master: '冷战片语法', category: '黑色悬疑', colors: ['#12181C', '#33454F', '#6E8891', '#C0CFD4'], mood: '克制、怀疑、低饱和' },
  { id: 'p-sakura', name: '绯樱和风', master: '日式唯美', category: '东方留白', colors: ['#2B1B24', '#7A3B54', '#E39AA8', '#F7E4E4'], mood: '樱、雪、慢门' },
  { id: 'p-neon-noir', name: '霓虹黑色', master: '《银翼杀手》', category: '霓虹赛博', colors: ['#0B0710', '#3A1244', '#C4217A', '#38B6C4'], mood: '雾、雨、霓虹反射' },
  { id: 'p-sand-dune', name: '赤沙黄昏', master: '沙漠片语法', category: '动作史诗', colors: ['#3B1E12', '#8A3B1E', '#D97A3D', '#F2D0A4'], mood: '剪影、热浪、孤绝' },
  { id: 'p-forest', name: '深林幽绿', master: '自然惊悚', category: '黑色悬疑', colors: ['#0F1A12', '#26402C', '#5C7F4F', '#AFC49A'], mood: '潮湿、窥视、苔痕' },
  { id: 'p-sunset-romance', name: '橘调恋爱', master: '爱情片语法', category: '东方留白', colors: ['#3A1F2B', '#9C4A4A', '#E8875A', '#F7D9B8'], mood: '逆光、暖、心动' },
  { id: 'p-ink', name: '青墨仙侠', master: '国风仙侠', category: '东方留白', colors: ['#101A1F', '#24424A', '#5E8C8A', '#D9E8E4'], mood: '云海、留白、清冷' },
  { id: 'p-gold-noir', name: '暗金权谋', master: '宫廷片语法', category: '东方留白', colors: ['#0F0B08', '#3A2A12', '#946B2D', '#E3C88A'], mood: '烛火、金器、阴影' },
];

export const PALETTE_CATEGORIES = Array.from(new Set(PALETTES.map((p) => p.category)));

export const paletteById = (id: string | null): Palette | undefined =>
  id ? PALETTES.find((p) => p.id === id) : undefined;
