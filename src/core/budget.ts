import type { Project, StageId } from './types';
import { stageById } from './stages';

/** 单价表（元）：可按服务商实际价格覆盖 */
export const UNIT_PRICE = {
  text: 0.8,
  image: 2.0,
  video: 12.0,
  compose: 2.5,
} as const;

export function stageEstimate(project: Project, id: StageId): number {
  const def = stageById(id);
  const st = project.stages[id];
  const skillFactor = 1 + Math.min(st.selectedSkills.length, 6) * 0.06;
  return round2(def.estimate * skillFactor);
}

export function projectEstimate(project: Project): number {
  let sum = 0;
  for (const id of Object.keys(project.stages) as StageId[]) {
    const st = project.stages[id];
    if (st.status === 'locked' || st.status === 'skipped') continue;
    sum += stageEstimate(project, id);
  }
  const shotCost = project.shots.reduce((acc, s) => acc + (s.status === 'planned' ? UNIT_PRICE.video : 0), 0);
  return round2(sum + shotCost);
}

export function spent(project: Project): number {
  return round2(project.costs.reduce((a, c) => a + c.amount, 0));
}

export function remaining(project: Project): number {
  return round2(project.budget - spent(project));
}

export interface BudgetVerdict {
  ok: boolean;
  projected: number;
  remaining: number;
  message: string;
}

/** 预算闸口：预计超支则挂起，等待人工追加预算 */
export function checkBudget(project: Project, nextCost: number): BudgetVerdict {
  const left = remaining(project);
  const projected = round2(left - nextCost);
  if (projected < 0) {
    return {
      ok: false,
      projected,
      remaining: left,
      message: `本次预计 ${nextCost.toFixed(2)} 元，将超出预算 ${Math.abs(projected).toFixed(2)} 元`,
    };
  }
  return { ok: true, projected, remaining: left, message: `本次 ${nextCost.toFixed(2)} 元，剩余 ${projected.toFixed(2)} 元` };
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** 台词秒数估算：中文约 4.2 字/秒，含换气与停顿系数 1.18 */
export function lineSeconds(text: string): number {
  const chars = text.replace(/\s/g, '').length;
  if (!chars) return 0;
  return round2((chars / 4.2) * 1.18);
}

export function formatCNY(n: number): string {
  return `¥${n.toFixed(2)}`;
}
