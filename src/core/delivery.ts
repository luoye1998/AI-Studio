import type { Project, Shot } from './types';
import { lineSeconds } from './budget';
import { compileShotPrompt } from './prompt';
import { STAGES } from './stages';

export const FPS = 24;

export interface TimelineBlock {
  shot: Shot;
  startSec: number;
  endSec: number;
  startTc: string;
  endTc: string;
}

export const pad2 = (n: number) => String(n).padStart(2, '0');

/** 秒 → 时间码 HH:MM:SS:FF（按 FPS 取整到帧） */
export function timecode(seconds: number, fps = FPS): string {
  const totalFrames = Math.max(0, Math.round(seconds * fps));
  const frames = totalFrames % fps;
  const totalSeconds = Math.floor(totalFrames / fps);
  return `${pad2(Math.floor(totalSeconds / 3600))}:${pad2(Math.floor((totalSeconds % 3600) / 60))}:${pad2(
    totalSeconds % 60
  )}:${pad2(frames)}`;
}

/** 按镜头顺序累加时长，得到时间线区块 */
export function timeline(project: Project): TimelineBlock[] {
  let cursor = 0;
  return project.shots
    .slice()
    .sort((a, b) => a.index - b.index)
    .map((shot) => {
      const startSec = cursor;
      const endSec = cursor + Math.max(0, shot.seconds);
      cursor = endSec;
      return {
        shot,
        startSec,
        endSec,
        startTc: timecode(startSec),
        endTc: timecode(endSec),
      };
    });
}

export const totalSeconds = (project: Project) => project.shots.reduce((a, s) => a + Math.max(0, s.seconds), 0);

export interface CheckItem {
  key: string;
  label: string;
  ok: boolean;
  detail: string;
}

/** 交付前自检：把「能不能交片」拆成可判定的条目 */
export function deliveryChecks(project: Project): CheckItem[] {
  const shots = project.shots;
  const approved = shots.filter((s) => s.status === 'approved').length;
  const overflow = shots.filter((s) => s.line && lineSeconds(s.line) > s.seconds + 0.5);
  const chars = project.assets.filter((a) => a.kind === 'character');
  const charsLocked = chars.filter((a) => a.approvedVersionId).length;
  const stageDone = STAGES.filter((s) => {
    const st = project.stages[s.id];
    return st.status === 'locked' || st.status === 'skipped';
  }).length;
  const overspend = project.costs.reduce((a, c) => a + c.amount, 0) > project.budget;

  return [
    {
      key: 'stages',
      label: '九阶段已全部锁定或跳过',
      ok: stageDone === STAGES.length,
      detail: `${stageDone}/${STAGES.length}`,
    },
    {
      key: 'shots',
      label: '所有镜头都已生成',
      ok: shots.length > 0 && shots.every((s) => s.status !== 'planned'),
      detail: `${shots.filter((s) => s.status === 'planned').length} 个待生成`,
    },
    {
      key: 'approved',
      label: '所有镜头已通过',
      ok: shots.length > 0 && approved === shots.length,
      detail: `${approved}/${shots.length}`,
    },
    {
      key: 'timing',
      label: '台词时长不超镜',
      ok: overflow.length === 0,
      detail: overflow.length ? `${overflow.length} 个镜头超时` : '全部达标',
    },
    {
      key: 'assets',
      label: '角色资产已定稿',
      ok: chars.length === 0 || charsLocked === chars.length,
      detail: `${charsLocked}/${chars.length}`,
    },
    {
      key: 'budget',
      label: '预算未超支',
      ok: !overspend,
      detail: overspend ? '已超支' : '正常',
    },
  ];
}

/** CMX3600 EDL：可直接导入 DaVinci Resolve / Premiere */
export function buildEdl(project: Project): string {
  const blocks = timeline(project);
  const lines: string[] = [`TITLE: ${project.name}`, `FCM: NON-DROP FRAME`, ''];
  blocks.forEach((b, i) => {
    const n = String(i + 1).padStart(3, '0');
    const name = `SHOT_${String(b.shot.index).padStart(2, '0')}_${b.shot.scene}`.replace(/\s+/g, '_');
    lines.push(
      `${n}  AX       V     C        ${b.startTc} ${b.endTc} ${b.startTc} ${b.endTc}`,
      `* FROM CLIP NAME: ${name}`,
      ''
    );
  });
  lines.push('* 由 WorkStream Studio 导出，时间码基准 24fps');
  return lines.join('\n');
}

/** 交付清单（Markdown）：镜头表 + 每镜提示词 */
export function buildManifest(project: Project): string {
  const blocks = timeline(project);
  const total = totalSeconds(project);
  const out: string[] = [];
  out.push(`# ${project.name} · 交付清单`);
  out.push('');
  out.push(`- 画幅：${project.ratio}`);
  out.push(`- 镜头数：${blocks.length}`);
  out.push(`- 总时长：${total}s（${timecode(total)}）`);
  out.push(`- 模板：${project.templateVersion}`);
  out.push(`- 导出时间：${new Date().toLocaleString('zh-CN', { hour12: false })}`);
  out.push('');
  out.push('## 镜头表');
  out.push('');
  out.push('| # | 场次 | 景别 | 运镜 | 秒 | 入点 | 出点 | 台词 | 状态 |');
  out.push('|---|---|---|---|---|---|---|---|---|');
  for (const b of blocks) {
    out.push(
      `| ${String(b.shot.index).padStart(2, '0')} | ${b.shot.scene} | ${b.shot.size} | ${b.shot.move} | ${
        b.shot.seconds
      } | ${b.startTc} | ${b.endTc} | ${b.shot.line || '—'} | ${
        b.shot.status === 'approved' ? '已通过' : b.shot.status === 'generated' ? '已生成' : '待生成'
      } |`
    );
  }
  out.push('');
  out.push('## 每镜提示词');
  for (const b of blocks) {
    out.push('');
    out.push(`### 镜头 ${String(b.shot.index).padStart(2, '0')} · ${b.shot.scene}`);
    out.push('```');
    out.push(compileShotPrompt(project, b.shot));
    out.push('```');
  }
  return out.join('\n');
}

/** 镜头表 CSV（带 BOM，Excel 直接打开不乱码） */
export function buildCsv(project: Project): string {
  const rows = [
    ['序号', '场次', '景别', '运镜', '秒数', '入点', '出点', '台词', '状态'],
    ...timeline(project).map((b) => [
      String(b.shot.index),
      b.shot.scene,
      b.shot.size,
      b.shot.move,
      String(b.shot.seconds),
      b.startTc,
      b.endTc,
      b.shot.line,
      b.shot.status,
    ]),
  ];
  const csv = rows.map((r) => r.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(',')).join('\n');
  return `\uFEFF${csv}`;
}
