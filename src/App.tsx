import { useEffect, useMemo, useState } from 'react';
import { Icon, LogoMark, type IconName } from './ui/Icons';
import { Modal, Progress } from './ui/kit';
import { PALETTES } from './core/palettes';
import { STAGES } from './core/stages';
import { formatCNY, remaining, spent } from './core/budget';
import { useActive, useApp, type ViewKey } from './store/store';
import Pipeline from './features/Pipeline';
import Canvas from './features/Canvas';
import Assets from './features/Assets';
import Shots from './features/Shots';
import Budget from './features/Budget';
import Knowledge from './features/Knowledge';
import SettingsView from './features/Settings';
import CommandPalette from './features/CommandPalette';
import GateModal from './features/GateModal';

const NAV: { key: ViewKey; label: string; icon: IconName; hint: string }[] = [
  { key: 'pipeline', label: '流水线', icon: 'flow', hint: '⌘1' },
  { key: 'canvas', label: '画布视图', icon: 'graph', hint: '⌘2' },
  { key: 'assets', label: '资产库', icon: 'layers', hint: '⌘3' },
  { key: 'shots', label: '镜头', icon: 'film', hint: '⌘4' },
  { key: 'budget', label: '成本与预算', icon: 'wallet', hint: '⌘5' },
  { key: 'knowledge', label: '剧本知识库', icon: 'book', hint: '⌘6' },
];

export default function App() {
  const project = useActive();
  const view = useApp((s) => s.ui.view);
  const setView = useApp((s) => s.setView);
  const projects = useApp((s) => s.projects);
  const selectProject = useApp((s) => s.selectProject);
  const createProject = useApp((s) => s.createProject);
  const setCommandOpen = useApp((s) => s.setCommandOpen);
  const openStage = useApp((s) => s.openStage);
  const activeStage = useApp((s) => s.ui.activeStage);
  const toasts = useApp((s) => s.ui.toasts);
  const dismissToast = useApp((s) => s.dismissToast);

  const [newOpen, setNewOpen] = useState(false);
  const [name, setName] = useState('');
  const [logline, setLogline] = useState('');

  const lockedCount = useMemo(
    () => STAGES.filter((s) => project.stages[s.id].status === 'locked' || project.stages[s.id].status === 'skipped').length,
    [project]
  );
  const pct = Math.round((lockedCount / STAGES.length) * 100);
  const left = remaining(project);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandOpen(true);
      }
      if (mod && /^[1-6]$/.test(e.key)) {
        e.preventDefault();
        const map: ViewKey[] = ['pipeline', 'canvas', 'assets', 'shots', 'budget', 'knowledge'];
        setView(map[Number(e.key) - 1]);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setCommandOpen, setView]);

  useEffect(() => {
    const parse = () => {
      const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
      const v = parts[0] as ViewKey | undefined;
      const valid: ViewKey[] = ['pipeline', 'canvas', 'assets', 'shots', 'budget', 'knowledge', 'settings'];
      if (v && valid.includes(v)) setView(v);
      if (v === 'pipeline' && parts[1] && STAGES.some((s) => s.id === parts[1])) {
        openStage(parts[1] as (typeof STAGES)[number]['id']);
      }
    };
    parse();
    window.addEventListener('hashchange', parse);
    return () => window.removeEventListener('hashchange', parse);
  }, [setView, openStage]);

  useEffect(() => {
    const next = view === 'pipeline' ? `#/pipeline/${activeStage}` : `#/${view}`;
    if (location.hash !== next) history.replaceState(null, '', next);
  }, [view, activeStage]);

  const palette = PALETTES.find((p) => p.id === project.palette);

  return (
    <div className="app">
      <aside className="rail">
        <div className="brand">
          <div className="brand-mark"><LogoMark /></div>
          <div className="brand-text">
            <span className="brand-name">WorkStream</span>
            <span className="brand-sub">studio</span>
          </div>
        </div>

        <nav className="nav">
          {NAV.map((n) => (
            <button key={n.key} className={`nav-item ${view === n.key ? 'on' : ''}`} onClick={() => setView(n.key)}>
              <Icon name={n.icon} />
              <span>{n.label}</span>
              <span className="kbd">{n.hint}</span>
            </button>
          ))}
        </nav>

        <div className="rail-section">
          <span>项目</span>
          <button className="btn ghost sm" onClick={() => setNewOpen(true)} title="新建项目">
            <Icon name="plus" />
          </button>
        </div>

        <div className="projects">
          {projects.map((p) => (
            <button
              key={p.id}
              className={`project-item ${p.id === project.id ? 'on' : ''}`}
              onClick={() => selectProject(p.id)}
            >
              <span className="pname">
                {p.id === project.id ? <span className="dot" style={{ width: 5, height: 5 }} /> : null}
                {p.name}
              </span>
              <span className="pmeta">
                {p.ratio} · {formatCNY(p.budget)} · {p.templateVersion.split('@')[1]}
              </span>
            </button>
          ))}
        </div>

        <div className="rail-foot">
          <button className={`nav-item ${view === 'settings' ? 'on' : ''}`} onClick={() => setView('settings')} style={{ padding: '6px 4px' }}>
            <Icon name="settings" />
            <span>设置</span>
          </button>
          <div className="sep" style={{ margin: '10px 0' }} />
          <div className="who">
            <span className="dot" />
            <span>本地工作区</span>
            <span className="grow" />
            <span className="mono tiny dim">v0.1.0</span>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="crumb">
            <span>WorkStream</span>
            <Icon name="chevron" />
            <b>{project.name}</b>
            <Icon name="chevron" />
            <span>{NAV.find((n) => n.key === view)?.label ?? '设置'}</span>
          </div>

          <div className="topbar-right">
            {palette ? (
              <span className="tag gold" title={`${palette.master} · ${palette.mood}`}>
                <span className="swatch">
                  {palette.colors.slice(0, 3).map((c) => (
                    <i key={c} style={{ background: c }} />
                  ))}
                </span>
                {palette.name}
              </span>
            ) : (
              <span className="tag">未挂色卡</span>
            )}
            <div style={{ width: 120 }}>
              <Progress value={pct} tone="gold" />
            </div>
            <span className="mono tiny dim">{pct}%</span>
            <span className={`tag ${left < 0 ? 'red' : left < project.budget * 0.2 ? 'amber' : 'green'}`}>
              余 {formatCNY(left)}
            </span>
            <button className="btn sm" onClick={() => setCommandOpen(true)}>
              <Icon name="search" />
              搜索
              <span className="mono tiny dim" style={{ marginLeft: 4 }}>⌘K</span>
            </button>
            <button className="btn primary sm" onClick={() => setNewOpen(true)}>
              <Icon name="plus" />
              新建
            </button>
          </div>
        </header>

        <div className="content">
          {view === 'pipeline' && <Pipeline />}
          {view === 'canvas' && <Canvas />}
          {view === 'assets' && <Assets />}
          {view === 'shots' && <Shots />}
          {view === 'budget' && <Budget />}
          {view === 'knowledge' && <Knowledge />}
          {view === 'settings' && <SettingsView />}
        </div>
      </main>

      <CommandPalette />
      <GateModal />

      <div className="toasts">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.kind}`} onClick={() => dismissToast(t.id)} role="status">
            <span className="bar" />
            <div>
              <div className="tt">{t.title}</div>
              {t.detail ? <div className="td">{t.detail}</div> : null}
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={newOpen}
        title="新建项目"
        subtitle="一个项目 = 一条流水线；项目彼此隔离，素材不串。"
        onClose={() => setNewOpen(false)}
        footer={
          <>
            <button className="btn" onClick={() => setNewOpen(false)}>取消</button>
            <button
              className="btn primary"
              onClick={() => {
                createProject(name.trim() || '未命名项目', logline.trim());
                setNewOpen(false);
                setName('');
                setLogline('');
              }}
            >
              创建并进入
            </button>
          </>
        }
      >
        <div className="col" style={{ gap: 12 }}>
          <div>
            <div className="label" style={{ marginBottom: 6 }}>片名</div>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="例如：雨夜第七秒" autoFocus />
          </div>
          <div>
            <div className="label" style={{ marginBottom: 6 }}>一句话故事</div>
            <textarea
              value={logline}
              onChange={(e) => setLogline(e.target.value)}
              placeholder="一个被生活压住的男人，在旧城断电的十分钟里，终于说出憋了十年的话。"
              style={{ minHeight: 76 }}
            />
          </div>
          <div className="card pad" style={{ background: 'rgba(123,140,255,0.05)', borderColor: 'rgba(123,140,255,0.2)' }}>
            <div className="row" style={{ alignItems: 'flex-start' }}>
              <Icon name="info" style={{ width: 15, height: 15, color: 'var(--indigo)', marginTop: 2 }} />
              <div className="sm muted">
                新项目继承模板 <span className="mono">{project.templateVersion}</span>，并钉住该版本快照——之后模板升级不会影响已创建的项目。
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export function useProjectStats() {
  const p = useActive();
  return { spent: spent(p), left: remaining(p) };
}
