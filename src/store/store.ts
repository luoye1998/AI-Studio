import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Asset,
  CostEntry,
  Gate,
  Project,
  Settings,
  Shot,
  StageId,
} from '../core/types';
import { STAGES, stageById } from '../core/stages';
import { DEFAULT_SETTINGS, createDemoProject, createEmptyProject, uid } from '../core/seed';
import { checkBudget, round2, stageEstimate, UNIT_PRICE } from '../core/budget';
import { generateStageContent } from '../core/gateway';

export type ViewKey = 'pipeline' | 'canvas' | 'assets' | 'shots' | 'budget' | 'knowledge' | 'settings';

interface Toast {
  id: string;
  kind: 'info' | 'success' | 'warn' | 'error';
  title: string;
  detail?: string;
}

interface UIState {
  view: ViewKey;
  activeStage: StageId;
  toasts: Toast[];
  commandOpen: boolean;
  gateOpen: string | null;
  generating: StageId | null;
}

interface AppState {
  projects: Project[];
  activeId: string;
  settings: Settings;
  ui: UIState;

  // ui
  setView: (v: ViewKey) => void;
  openStage: (id: StageId) => void;
  pushToast: (t: Omit<Toast, 'id'>) => void;
  dismissToast: (id: string) => void;
  setCommandOpen: (b: boolean) => void;
  setGateOpen: (id: string | null) => void;

  // project
  active: () => Project;
  createProject: (name: string, logline: string) => void;
  importProjects: (incoming: Project[]) => number;
  deleteProject: (id: string) => void;
  selectProject: (id: string) => void;
  renameProject: (name: string) => void;
  patchActive: (patch: Partial<Project>) => void;
  setPalette: (id: string | null) => void;

  // stages
  setStageNotes: (id: StageId, notes: string) => void;
  toggleSkill: (id: StageId, code: string) => void;
  generateStage: (id: StageId) => Promise<void>;
  saveDraft: (id: StageId, content: string) => void;
  lockStage: (id: StageId) => void;
  unlockStage: (id: StageId) => void;
  skipStage: (id: StageId) => void;

  // gates
  decideGate: (gateId: string, decision: 'approve' | 'reject', comment: string, issues: string[], rerunScope: 'affected' | 'node' | 'all') => void;

  // assets
  addAsset: (kind: Asset['kind'], name: string, role: string, prompt: string) => void;
  updateAsset: (id: string, patch: Partial<Asset>) => void;
  generateAssetVersion: (assetId: string) => void;
  approveAsset: (assetId: string, versionId: string) => void;
  removeAsset: (id: string) => void;

  // shots
  updateShot: (id: string, patch: Partial<Shot>) => void;
  generateShots: () => void;
  regenerateShot: (id: string) => void;
  approveShot: (id: string) => void;

  // knowledge
  toggleKnowledge: () => void;
  setKnowledgeMode: (mode: 'smart' | 'method-only' | 'off') => void;
  setKnowledgeFolder: (folder: string) => void;
  toggleDoc: (id: string) => void;

  // settings
  updateProvider: (kind: 'text' | 'image' | 'video', patch: Partial<Settings['providers'][number]>) => void;
  setBudget: (n: number) => void;
}

const log = (p: Project, type: string, message: string, level: 'info' | 'warn' | 'error' | 'success' = 'info'): Project => ({
  ...p,
  updatedAt: Date.now(),
  logs: [{ id: uid('l'), at: Date.now(), type, message, level }, ...p.logs].slice(0, 200),
});

const addCost = (p: Project, label: string, kind: CostEntry['kind'], amount: number, stage?: StageId): Project => ({
  ...p,
  costs: [{ id: uid('c'), at: Date.now(), label, kind, units: 1, amount: round2(amount), stage }, ...p.costs],
});

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      projects: [createDemoProject()],
      activeId: '',
      settings: DEFAULT_SETTINGS,
      ui: { view: 'pipeline', activeStage: 'script', toasts: [], commandOpen: false, gateOpen: null, generating: null },

      active: () => {
        const { projects, activeId } = get();
        return projects.find((p) => p.id === activeId) ?? projects[0];
      },

      setView: (view) => set((s) => ({ ui: { ...s.ui, view } })),
      openStage: (id) => set((s) => ({ ui: { ...s.ui, view: 'pipeline', activeStage: id } })),
      pushToast: (t) =>
        set((s) => ({ ui: { ...s.ui, toasts: [...s.ui.toasts, { ...t, id: uid('t') }].slice(-4) } })),
      dismissToast: (id) =>
        set((s) => ({ ui: { ...s.ui, toasts: s.ui.toasts.filter((t) => t.id !== id) } })),
      setCommandOpen: (commandOpen) => set((s) => ({ ui: { ...s.ui, commandOpen } })),
      setGateOpen: (gateOpen) => set((s) => ({ ui: { ...s.ui, gateOpen } })),

      createProject: (name, logline) => {
        const p = createEmptyProject(name, logline);
        set((s) => ({
          projects: [p, ...s.projects],
          activeId: p.id,
          ui: { ...s.ui, view: 'pipeline', activeStage: 'concept' },
        }));
        get().pushToast({ kind: 'success', title: '项目已创建', detail: p.name });
      },

      importProjects: (incoming) => {
        if (!Array.isArray(incoming) || !incoming.length) return 0;
        const valid = incoming.filter((p) => p && p.id && p.stages && p.name);
        if (!valid.length) return 0;
        set((s) => {
          const map = new Map(s.projects.map((p) => [p.id, p]));
          for (const p of valid) map.set(p.id, { ...p, updatedAt: Date.now() });
          const projects = Array.from(map.values());
          return { projects, activeId: valid[0].id, ui: { ...s.ui, view: 'pipeline', activeStage: 'concept' } };
        });
        return valid.length;
      },

      deleteProject: (id) =>
        set((s) => {
          const projects = s.projects.filter((p) => p.id !== id);
          return { projects, activeId: projects[0]?.id ?? '' };
        }),

      selectProject: (id) => set((s) => ({ activeId: id, ui: { ...s.ui, view: 'pipeline' } })),

      renameProject: (name) =>
        set((s) => ({
          projects: s.projects.map((p) => (p.id === s.activeId ? { ...p, name, updatedAt: Date.now() } : p)),
        })),

      patchActive: (patch) =>
        set((s) => ({
          projects: s.projects.map((p) => (p.id === s.activeId ? { ...p, ...patch, updatedAt: Date.now() } : p)),
        })),

      setPalette: (id) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === s.activeId ? log({ ...p, palette: id }, 'palette.set', id ? `已挂载 LIRA 色卡 ${id}` : '已取消色卡') : p
          ),
        })),

      setStageNotes: (id, notes) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === s.activeId
              ? { ...p, stages: { ...p.stages, [id]: { ...p.stages[id], notes } }, updatedAt: Date.now() }
              : p
          ),
        })),

      toggleSkill: (id, code) =>
        set((s) => ({
          projects: s.projects.map((p) => {
            if (p.id !== s.activeId) return p;
            const st = p.stages[id];
            const has = st.selectedSkills.includes(code);
            return {
              ...p,
              stages: {
                ...p.stages,
                [id]: { ...st, selectedSkills: has ? st.selectedSkills.filter((c) => c !== code) : [...st.selectedSkills, code] },
              },
              updatedAt: Date.now(),
            };
          }),
        })),

      generateStage: async (id) => {
        const p = get().active();
        if (p.stages[id].status === 'locked') {
          get().pushToast({ kind: 'warn', title: '该阶段已锁定', detail: '如需重做，请先解锁并说明原因' });
          return;
        }
        const cost = stageEstimate(p, id);
        const verdict = checkBudget(p, cost);
        if (!verdict.ok) {
          const gate: Gate = {
            id: uid('gate'),
            kind: 'budget',
            title: '预算闸口 · 预计超支',
            after: id,
            status: 'waiting',
            createdAt: Date.now(),
            decidedAt: null,
            decision: null,
            comment: verdict.message,
            issues: [],
            rerunScope: 'affected',
          };
          set((s) => ({
            projects: s.projects.map((x) =>
              x.id === p.id
                ? log({ ...x, gates: [...x.gates, gate] }, 'budget.block', `${stageById(id).name} 预计超支，已挂起等待审批`, 'warn')
                : x
            ),
            ui: { ...s.ui, gateOpen: gate.id },
          }));
          get().pushToast({ kind: 'error', title: '预算不足，已挂起', detail: verdict.message });
          return;
        }

        const next = STAGES.find((s) => s.id === id);
        set((s) => ({ ui: { ...s.ui, generating: id } }));

        let result;
        try {
          result = await generateStageContent(p, id, get().settings.providers);
        } finally {
          set((s) => ({ ui: { ...s.ui, generating: null } }));
        }
        const content = result.content;

        set((s) => ({
          projects: s.projects.map((x) => {
            if (x.id !== p.id) return x;
            const st = x.stages[id];
            const version = {
              id: uid('v'),
              createdAt: Date.now(),
              content,
              skills: st.selectedSkills,
              note: `第 ${st.versions.length + 1} 版${result.source === 'model' ? ` · ${result.model ?? '模型'}` : ' · 本地推演'}`,
              cost,
            };
            let proj: Project = {
              ...x,
              stages: {
                ...x.stages,
                [id]: { ...st, status: 'review', content, versions: [version, ...st.versions].slice(0, 20) },
              },
            };
            proj = addCost(proj, `${next?.code} ${next?.name} · 生成`, next?.unit ?? 'text', cost, id);
            return log(
              proj,
              'stage.generated',
              `${next?.name} 生成完成（${result.source === 'model' ? `模型 ${result.model}` : '本地推演'}，${Math.round(result.latencyMs)}ms）`,
              'success'
            );
          }),
        }));
        get().pushToast(
          result.note
            ? { kind: 'warn', title: '模型调用失败，已本地兜底', detail: result.note }
            : {
                kind: 'success',
                title: result.source === 'model' ? '模型生成完成' : '本地推演完成',
                detail: `${next?.name} · ¥${cost.toFixed(2)} · ${Math.round(result.latencyMs)}ms`,
              }
        );
      },

      saveDraft: (id, content) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === s.activeId
              ? { ...p, stages: { ...p.stages, [id]: { ...p.stages[id], content, status: p.stages[id].status === 'idle' ? 'drafting' : p.stages[id].status } }, updatedAt: Date.now() }
              : p
          ),
        })),

      lockStage: (id) => {
        const p = get().active();
        const st = p.stages[id];
        if (!st.content.trim()) {
          get().pushToast({ kind: 'warn', title: '还没有内容', detail: '先写或先生成本阶段稿件' });
          return;
        }
        const version = {
          id: uid('v'),
          createdAt: Date.now(),
          content: st.content,
          skills: st.selectedSkills,
          note: '确认采用',
          cost: 0,
        };
        set((s) => ({
          projects: s.projects.map((x) => {
            if (x.id !== p.id) return x;
            let gates = x.gates;
            if (id === 'script') {
              const g1 = x.gates.find((g) => g.kind === 'g1');
              if (g1 && g1.status === 'idle') gates = gates.map((g) => (g.id === g1.id ? { ...g, status: 'waiting', createdAt: Date.now() } : g));
            }
            if (id === 'cinedance') {
              const g2 = x.gates.find((g) => g.kind === 'g2');
              if (g2 && g2.status === 'idle') gates = gates.map((g) => (g.id === g2.id ? { ...g, status: 'waiting', createdAt: Date.now() } : g));
            }
            return log(
              {
                ...x,
                gates,
                stages: {
                  ...x.stages,
                  [id]: { ...st, status: 'locked', lockedVersionId: version.id, lockedAt: Date.now(), versions: [version, ...st.versions].slice(0, 20) },
                },
              },
              'stage.locked',
              `${stageById(id).name} 已锁定，作为下游不可篡改的铁律`,
              'success'
            );
          }),
        }));
        const gate = id === 'script' ? 'G1 剧本定稿' : id === 'cinedance' ? 'G2 成片终审' : null;
        get().pushToast({
          kind: 'success',
          title: `${stageById(id).name} 已锁定`,
          detail: gate ? `${gate}闸口已打开，请前往审批` : '下游将只读取此定稿',
        });
      },

      unlockStage: (id) => {
        const p = get().active();
        set((s) => ({
          projects: s.projects.map((x) => {
            if (x.id !== p.id) return x;
            const stages = { ...x.stages };
            stages[id] = { ...stages[id], status: 'review', lockedVersionId: null, lockedAt: null };
            const idx = STAGES.findIndex((st) => st.id === id);
            for (const st of STAGES.slice(idx + 1)) {
              if (stages[st.id].status === 'locked') stages[st.id] = { ...stages[st.id], status: 'review', lockedVersionId: null };
            }
            return log({ ...x, stages }, 'stage.unlocked', `${stageById(id).name} 已解锁，下游需重新确认`, 'warn');
          }),
        }));
        get().pushToast({ kind: 'warn', title: '已解锁', detail: '下游已锁定阶段已退回待确认' });
      },

      skipStage: (id) => {
        const def = stageById(id);
        if (!def.optional) return;
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === s.activeId
              ? log({ ...p, stages: { ...p.stages, [id]: { ...p.stages[id], status: 'skipped', content: p.stages[id].content } } }, 'stage.skipped', `${def.name} 已跳过`, 'info')
              : p
          ),
        }));
        get().pushToast({ kind: 'info', title: `${def.name} 已跳过` });
      },

      decideGate: (gateId, decision, comment, issues, rerunScope) => {
        const p = get().active();
        const gate = p.gates.find((g) => g.id === gateId);
        if (!gate) return;
        set((s) => ({
          projects: s.projects.map((x) => {
            if (x.id !== p.id) return x;
            const gates = x.gates.map((g) =>
              g.id === gateId
                ? { ...g, status: decision === 'approve' ? ('approved' as const) : ('rejected' as const), decision, comment, issues, rerunScope, decidedAt: Date.now() }
                : g
            );
            let stages = x.stages;
            if (decision === 'reject') {
              const target = gate.kind === 'budget' ? gate.after : gate.after;
              stages = { ...stages, [target]: { ...stages[target], status: 'review', lockedVersionId: null } };
            }
            if (gate.kind === 'budget' && decision === 'approve') {
              // 追加预算 20%
              return log({ ...x, gates, budget: round2(x.budget * 1.2) }, 'budget.approved', '预算追加 20%，运行继续', 'warn');
            }
            return log(
              { ...x, gates, stages },
              decision === 'approve' ? 'gate.approved' : 'gate.rejected',
              `${gate.title} ${decision === 'approve' ? '通过' : `打回（重跑范围 ${rerunScope}）`}`,
              decision === 'approve' ? 'success' : 'warn'
            );
          }),
          ui: { ...s.ui, gateOpen: null },
        }));
        get().pushToast({
          kind: decision === 'approve' ? 'success' : 'warn',
          title: decision === 'approve' ? '闸口已通过' : '已打回并退回重做',
          detail: comment || undefined,
        });
      },

      addAsset: (kind, name, role, prompt) => {
        const a: Asset = {
          id: uid('asset'),
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
          createdAt: Date.now(),
        };
        set((s) => ({
          projects: s.projects.map((p) => (p.id === s.activeId ? log({ ...p, assets: [a, ...p.assets] }, 'asset.created', `资产「${name}」已创建`) : p)),
        }));
      },

      updateAsset: (id, patch) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === s.activeId ? { ...p, assets: p.assets.map((a) => (a.id === id ? { ...a, ...patch } : a)), updatedAt: Date.now() } : p
          ),
        })),

      generateAssetVersion: (assetId) => {
        const p = get().active();
        const cost = UNIT_PRICE.image;
        const verdict = checkBudget(p, cost);
        if (!verdict.ok) {
          get().pushToast({ kind: 'error', title: '预算不足', detail: verdict.message });
          return;
        }
        set((s) => ({
          projects: s.projects.map((x) => {
            if (x.id !== p.id) return x;
            const assets = x.assets.map((a) => {
              if (a.id !== assetId) return a;
              const v = { id: uid('av'), createdAt: Date.now(), uri: `placeholder://${a.id}/${Date.now()}`, note: `v${a.versions.length + 1}`, approved: false };
              return { ...a, versions: [v, ...a.versions].slice(0, 12) };
            });
            return log(addCost({ ...x, assets }, '资产生图', 'image', cost), 'asset.generated', '资产新版本已生成');
          }),
        }));
      },

      approveAsset: (assetId, versionId) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === s.activeId
              ? log(
                  {
                    ...p,
                    assets: p.assets.map((a) =>
                      a.id === assetId
                        ? { ...a, approvedVersionId: versionId, versions: a.versions.map((v) => ({ ...v, approved: v.id === versionId })) }
                        : a
                    ),
                  },
                  'asset.approved',
                  '资产版本已定稿锁定'
                )
              : p
          ),
        })),

      removeAsset: (id) =>
        set((s) => ({
          projects: s.projects.map((p) => (p.id === s.activeId ? { ...p, assets: p.assets.filter((a) => a.id !== id) } : p)),
        })),

      updateShot: (id, patch) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === s.activeId ? { ...p, shots: p.shots.map((x) => (x.id === id ? { ...x, ...patch } : x)), updatedAt: Date.now() } : p
          ),
        })),

      generateShots: () => {
        const p = get().active();
        const pending = p.shots.filter((s) => s.status !== 'approved');
        const cost = round2(pending.length * UNIT_PRICE.video);
        const verdict = checkBudget(p, cost);
        if (!verdict.ok) {
          get().pushToast({ kind: 'error', title: '预算不足', detail: verdict.message });
          return;
        }
        set((s) => ({
          projects: s.projects.map((x) =>
            x.id === p.id
              ? log(
                  addCost(
                    { ...x, shots: x.shots.map((sh) => (sh.status === 'planned' ? { ...sh, status: 'generated' } : sh)) },
                    `分镜批量生成 · ${pending.length} 镜`,
                    'video',
                    cost
                  ),
                  'shots.generated',
                  `${pending.length} 个镜头已生成（¥${cost.toFixed(2)}）`,
                  'success'
                )
              : x
          ),
        }));
        get().pushToast({ kind: 'success', title: '分镜已生成', detail: `${pending.length} 镜 · ¥${cost.toFixed(2)}` });
      },

      regenerateShot: (id) => {
        const p = get().active();
        const verdict = checkBudget(p, UNIT_PRICE.video);
        if (!verdict.ok) {
          get().pushToast({ kind: 'error', title: '预算不足', detail: verdict.message });
          return;
        }
        set((s) => ({
          projects: s.projects.map((x) =>
            x.id === p.id
              ? log(addCost({ ...x, shots: x.shots.map((sh) => (sh.id === id ? { ...sh, status: 'generated' } : sh)) }, '单镜头重做', 'video', UNIT_PRICE.video), 'shot.regenerated', '单镜头已重做（不覆盖旧结果）')
              : x
          ),
        }));
        get().pushToast({ kind: 'info', title: '单镜头已重做', detail: '旧结果保留在历史里' });
      },

      approveShot: (id) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === s.activeId ? { ...p, shots: p.shots.map((x) => (x.id === id ? { ...x, status: 'approved' } : x)) } : p
          ),
        })),

      toggleKnowledge: () =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === s.activeId ? { ...p, knowledge: { ...p.knowledge, mounted: !p.knowledge.mounted } } : p
          ),
        })),

      setKnowledgeMode: (mode) =>
        set((s) => ({
          projects: s.projects.map((p) => (p.id === s.activeId ? { ...p, knowledge: { ...p.knowledge, mode } } : p)),
        })),

      setKnowledgeFolder: (folder) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === s.activeId
              ? {
                  ...p,
                  knowledge: {
                    ...p.knowledge,
                    folder,
                    mounted: Boolean(folder),
                    docs: p.knowledge.docs.length
                      ? p.knowledge.docs
                      : [
                          { id: uid('doc'), name: '故事·材质·结构·风格与银幕剧作原理', kind: 'method' as const, words: 182_000, enabled: true },
                          { id: uid('doc'), name: '编剧步步为营', kind: 'method' as const, words: 96_000, enabled: true },
                        ],
                  },
                }
              : p
          ),
        })),

      toggleDoc: (id) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === s.activeId
              ? { ...p, knowledge: { ...p.knowledge, docs: p.knowledge.docs.map((d) => (d.id === id ? { ...d, enabled: !d.enabled } : d)) } }
              : p
          ),
        })),

      updateProvider: (kind, patch) =>
        set((s) => ({
          settings: {
            ...s.settings,
            providers: s.settings.providers.map((p) => (p.kind === kind ? { ...p, ...patch } : p)),
          },
        })),

      setBudget: (n) =>
        set((s) => ({
          projects: s.projects.map((p) => (p.id === s.activeId ? { ...p, budget: n } : p)),
        })),
    }),
    {
      name: 'workstream-studio-v1',
      version: 1,
      partialize: (s) => ({ projects: s.projects, activeId: s.activeId, settings: s.settings }) as unknown as AppState,
      onRehydrateStorage: () => (state) => {
        if (state && (!state.activeId || !state.projects.find((p) => p.id === state.activeId))) {
          state.activeId = state.projects[0]?.id ?? '';
        }
      },
    }
  )
);

export const useActive = () => {
  const projects = useApp((s) => s.projects);
  const activeId = useApp((s) => s.activeId);
  return projects.find((p) => p.id === activeId) ?? projects[0];
};
