import { beforeEach, describe, expect, it } from 'vitest';
import { createDemoProject } from '../src/core/seed';
import type { Project, StageId } from '../src/core/types';

// zustand/persist 需要 localStorage
const mem = new Map<string, string>();
(globalThis as unknown as { localStorage: Storage }).localStorage = {
  getItem: (k: string) => mem.get(k) ?? null,
  setItem: (k: string, v: string) => void mem.set(k, v),
  removeItem: (k: string) => void mem.delete(k),
  clear: () => mem.clear(),
  key: () => null,
  length: 0,
} as Storage;

const { useApp } = await import('../src/store/store');

function reset(budget?: number): Project {
  const p = createDemoProject();
  if (budget !== undefined) p.budget = budget;
  useApp.setState({
    projects: [p],
    activeId: p.id,
    ui: { ...useApp.getState().ui, generating: null, gateOpen: null },
  });
  return p;
}

const stage = (id: StageId) => useApp.getState().active().stages[id];
const gate = (kind: 'g1' | 'g2' | 'budget') => useApp.getState().active().gates.find((g) => g.kind === kind);

describe('锁稿与闸口', () => {
  beforeEach(() => reset());

  it('锁定剧本会同时打开 G1 闸口', async () => {
    expect(stage('script').status).toBe('review');
    useApp.getState().lockStage('script');
    expect(useApp.getState().active().stages.script.status).toBe('locked');
    expect(gate('g1')?.status).toBe('waiting');
  });

  it('非闸口阶段锁定不会触发闸口', () => {
    useApp.getState().lockStage('outline');
    expect(stage('outline').status).toBe('locked');
    expect(gate('g1')?.status).toBe('idle');
  });

  it('空内容不允许锁定', () => {
    useApp.setState((s) => ({
      projects: s.projects.map((p) => ({
        ...p,
        stages: { ...p.stages, script: { ...p.stages.script, content: '   ' } },
      })),
    }));
    useApp.getState().lockStage('script');
    expect(useApp.getState().active().stages.script.status).not.toBe('locked');
  });

  it('G1 通过后状态为 approved', () => {
    useApp.getState().lockStage('script');
    const g1 = gate('g1')!;
    useApp.getState().decideGate(g1.id, 'approve', '通过', [], 'affected');
    expect(gate('g1')?.status).toBe('approved');
  });

  it('G1 打回会把剧本退回待审阅', () => {
    useApp.getState().lockStage('script');
    const g1 = gate('g1')!;
    useApp.getState().decideGate(g1.id, 'reject', '台词太书面', ['第三场改口语'], 'affected');
    const s = useApp.getState().active();
    expect(s.gates.find((g) => g.id === g1.id)?.status).toBe('rejected');
    expect(s.stages.script.status).toBe('review');
    expect(s.stages.script.lockedVersionId).toBeNull();
  });
});

describe('解锁与下游失效', () => {
  beforeEach(() => reset());

  it('解锁上游会把已锁定的下游退回待确认', () => {
    const before = useApp.getState().active();
    expect(before.stages.concept.status).toBe('locked');
    expect(before.stages.outline.status).toBe('locked');

    useApp.getState().unlockStage('concept');

    const after = useApp.getState().active();
    expect(after.stages.concept.status).toBe('review');
    expect(after.stages.characters.status).toBe('review');
    expect(after.stages.outline.status).toBe('review');
  });
});

describe('生成与预算', () => {
  beforeEach(() => reset());

  it('正常生成后进入待审阅、写入版本与成本', async () => {
    const before = useApp.getState().active();
    const costBefore = before.costs.length;

    await useApp.getState().generateStage('world');

    const after = useApp.getState().active();
    expect(after.stages.world.status).toBe('review');
    expect(after.stages.world.content.length).toBeGreaterThan(50);
    expect(after.stages.world.versions.length).toBe(1);
    expect(after.costs.length).toBe(costBefore + 1);
    expect(useApp.getState().ui.generating).toBeNull();
  });

  it('超预算时生成被拦截并挂出预算闸口', async () => {
    reset(1); // 预算 1 元，已花费 2.8 元
    const before = useApp.getState().active();
    const costBefore = before.costs.length;

    await useApp.getState().generateStage('world');

    const after = useApp.getState().active();
    expect(after.costs.length).toBe(costBefore);
    expect(after.stages.world.status).not.toBe('review');
    const budgetGate = after.gates.find((g) => g.kind === 'budget');
    expect(budgetGate?.status).toBe('waiting');
  });

  it('已锁定的阶段拒绝再次生成', async () => {
    const before = useApp.getState().active().stages.concept.content;
    await useApp.getState().generateStage('concept');
    expect(useApp.getState().active().stages.concept.content).toBe(before);
  });
});

describe('专业约束与工程导入', () => {
  beforeEach(() => reset());

  it('技能勾选可增可删', () => {
    const code = '05-D'; // 演示工程默认只勾了 05-A/05-B/05-C
    expect(stage('script').selectedSkills).not.toContain(code);
    useApp.getState().toggleSkill('script', code);
    expect(stage('script').selectedSkills).toContain(code);
    useApp.getState().toggleSkill('script', code);
    expect(stage('script').selectedSkills).not.toContain(code);
  });

  it('导入工程会覆盖同名并切换激活项', () => {
    const incoming = createDemoProject();
    incoming.name = '导入的片';
    const n = useApp.getState().importProjects([incoming]);
    expect(n).toBe(1);
    const st = useApp.getState();
    expect(st.activeId).toBe(incoming.id);
    expect(st.projects.find((p) => p.id === incoming.id)?.name).toBe('导入的片');
  });

  it('导入非法数据返回 0 且不改动', () => {
    const before = useApp.getState().projects.length;
    expect(useApp.getState().importProjects([])).toBe(0);
    expect(useApp.getState().importProjects([{ bad: true } as unknown as Project])).toBe(0);
    expect(useApp.getState().projects.length).toBe(before);
  });
});
