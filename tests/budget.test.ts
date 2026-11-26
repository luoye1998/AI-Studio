import { describe, it, expect } from 'vitest';
import { checkBudget, lineSeconds, projectEstimate, round2, spent, remaining, UNIT_PRICE } from '../src/core/budget';
import { createDemoProject, createEmptyProject } from '../src/core/seed';

describe('lineSeconds 台词读秒', () => {
  it('空台词返回 0', () => {
    expect(lineSeconds('')).toBe(0);
    expect(lineSeconds('   ')).toBe(0);
  });

  it('按 4.2 字/秒 + 1.18 停顿系数计算', () => {
    // 9 个字：9 / 4.2 * 1.18 ≈ 2.53
    expect(lineSeconds('你来得比我算的晚了')).toBeCloseTo(round2((9 / 4.2) * 1.18), 2);
  });

  it('忽略空白与换行', () => {
    expect(lineSeconds('行 吧\n')).toBeCloseTo(lineSeconds('行吧'), 5);
  });
});

describe('预算闸口', () => {
  const base = () => createDemoProject();

  it('预算充足时放行', () => {
    const p = base();
    p.budget = 1000;
    const v = checkBudget(p, 10);
    expect(v.ok).toBe(true);
    expect(v.projected).toBeCloseTo(round2(remaining(p) - 10), 2);
  });

  it('超支时拦截并给出超出金额', () => {
    const p = base();
    p.budget = 5;
    const v = checkBudget(p, 10);
    expect(v.ok).toBe(false);
    expect(v.message).toContain('超出预算');
  });

  it('剩余与花费互补', () => {
    const p = base();
    expect(round2(spent(p) + remaining(p))).toBeCloseTo(p.budget, 2);
  });

  it('已锁定的阶段不再计入预估', () => {
    const p = base();
    const before = projectEstimate(p);
    // 把一个未锁定阶段锁掉，预估应当下降
    const next = Object.keys(p.stages).find((k) => p.stages[k as keyof typeof p.stages].status !== 'locked');
    expect(next).toBeDefined();
    p.stages[next as keyof typeof p.stages].status = 'locked';
    expect(projectEstimate(p)).toBeLessThan(before);
  });
});

describe('单价表', () => {
  it('视频单价高于图像高于文本', () => {
    expect(UNIT_PRICE.video).toBeGreaterThan(UNIT_PRICE.image);
    expect(UNIT_PRICE.image).toBeGreaterThan(UNIT_PRICE.text);
  });
});

describe('项目工厂', () => {
  it('演示项目具备九阶段与两道闸口', () => {
    const p = createDemoProject();
    expect(Object.keys(p.stages)).toHaveLength(9);
    expect(p.gates.map((g) => g.kind)).toEqual(['g1', 'g2']);
    expect(p.shots.length).toBeGreaterThan(0);
    expect(p.palette).toBeTruthy();
  });

  it('新项目为空白且预算有默认值', () => {
    const p = createEmptyProject('测试片', '一句话');
    expect(Object.values(p.stages).every((s) => s.status === 'idle')).toBe(true);
    expect(p.budget).toBeGreaterThan(0);
    expect(p.assets).toHaveLength(0);
  });
});
