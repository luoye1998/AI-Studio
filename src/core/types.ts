/**
 * WorkStream 领域模型
 * 融合两套体系：
 *  - 洋子工作台：九阶段流水线 / 阶段隔离 / 锁稿 / 71 项导演技能 / LIRA 色卡 / 资产四视图
 *  - AIGC 编排平台：DAG + 人工闸口 / 模板版本钉住 / 预算闸口 / 成本计量 / 事件审计
 */

export type StageId =
  | 'concept'
  | 'characters'
  | 'world'
  | 'outline'
  | 'script'
  | 'stress'
  | 'lira'
  | 'acting'
  | 'cinedance';

export type StageStatus = 'idle' | 'drafting' | 'review' | 'locked' | 'skipped';

export type GateKind = 'g1' | 'g2' | 'budget';

export type GateStatus = 'idle' | 'waiting' | 'approved' | 'rejected';

export type AssetKind = 'character' | 'scene' | 'prop' | 'style';

export type Tier = 'novice' | 'pro' | 'master';

export type AspectRatio = '9:16' | '16:9' | '1:1';

export type ProviderKind = 'text' | 'image' | 'video';

export interface SkillDef {
  code: string;
  stage: string; // '00' | '01' ... '09'
  title: string;
  summary: string;
}

export interface StageDef {
  id: StageId;
  order: number;
  code: string; // 01..09
  name: string;
  en: string;
  tagline: string;
  purpose: string;
  deliverable: string;
  optional: boolean;
  checks: string[];
  skillStage: string;
  /** 单次生成的估算成本（元） */
  estimate: number;
  /** 阶段产出属于哪类资源，决定计费口径 */
  unit: 'text' | 'image' | 'video';
}

export interface StageVersion {
  id: string;
  createdAt: number;
  content: string;
  skills: string[];
  note: string;
  cost: number;
}

export interface StageState {
  status: StageStatus;
  content: string;
  notes: string;
  selectedSkills: string[];
  versions: StageVersion[];
  lockedVersionId: string | null;
  lockedAt: number | null;
}

export interface AssetVersionRef {
  id: string;
  createdAt: number;
  uri: string; // 本地对象 URL / 占位符
  note: string;
  approved: boolean;
}

export interface Asset {
  id: string;
  kind: AssetKind;
  name: string;
  role: string;
  prompt: string;
  views: { key: string; label: string; versionId: string | null }[];
  versions: AssetVersionRef[];
  approvedVersionId: string | null;
  createdAt: number;
}

export interface Shot {
  id: string;
  index: number;
  scene: string;
  beat: string;
  size: string; // 景别
  move: string; // 运镜
  seconds: number;
  line: string; // 台词
  prompt: string;
  refs: string[]; // 资产 id
  status: 'planned' | 'generated' | 'approved';
  color: string;
}

export interface Gate {
  id: string;
  kind: GateKind;
  title: string;
  after: StageId;
  status: GateStatus;
  createdAt: number;
  decidedAt: number | null;
  decision: 'approve' | 'reject' | null;
  comment: string;
  issues: string[];
  rerunScope: 'affected' | 'node' | 'all';
}

export interface CostEntry {
  id: string;
  at: number;
  label: string;
  kind: ProviderKind | 'compose';
  units: number;
  amount: number;
  stage?: StageId;
}

export interface LogEntry {
  id: string;
  at: number;
  type: string;
  message: string;
  level: 'info' | 'warn' | 'error' | 'success';
}

export interface KnowledgeDoc {
  id: string;
  name: string;
  kind: 'method' | 'script' | 'reference';
  words: number;
  enabled: boolean;
}

export interface KnowledgeBinding {
  mounted: boolean;
  folder: string;
  mode: 'smart' | 'method-only' | 'off';
  docs: KnowledgeDoc[];
}

export interface ProviderConfig {
  kind: ProviderKind;
  provider: string;
  baseUrl: string;
  model: string;
  /** 仅存本机 localStorage，不上传；留空则走本地推演引擎 */
  apiKey?: string;
  enabled: boolean;
}

export interface Project {
  id: string;
  name: string;
  logline: string;
  genre: string;
  ratio: AspectRatio;
  tier: Tier;
  budget: number;
  createdAt: number;
  updatedAt: number;
  templateVersion: string;
  stages: Record<StageId, StageState>;
  gates: Gate[];
  assets: Asset[];
  shots: Shot[];
  costs: CostEntry[];
  logs: LogEntry[];
  knowledge: KnowledgeBinding;
  palette: string | null;
}

export interface Settings {
  providers: ProviderConfig[];
  theme: 'noir' | 'paper';
  reduceMotion: boolean;
}
