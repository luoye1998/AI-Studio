import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon, type IconName } from '../ui/Icons';
import { STAGES } from '../core/stages';
import { useApp, type ViewKey } from '../store/store';

interface Item {
  id: string;
  label: string;
  kind: string;
  icon: IconName;
  run: () => void;
}

const VIEWS: { key: ViewKey; label: string; icon: IconName }[] = [
  { key: 'pipeline', label: '流水线', icon: 'flow' },
  { key: 'canvas', label: '画布视图', icon: 'graph' },
  { key: 'assets', label: '资产库', icon: 'layers' },
  { key: 'shots', label: '镜头', icon: 'film' },
  { key: 'budget', label: '成本与预算', icon: 'wallet' },
  { key: 'knowledge', label: '剧本知识库', icon: 'book' },
];

export default function CommandPalette() {
  const open = useApp((s) => s.ui.commandOpen);
  const setOpen = useApp((s) => s.setCommandOpen);
  const setView = useApp((s) => s.setView);
  const openStage = useApp((s) => s.openStage);
  const projects = useApp((s) => s.projects);
  const selectProject = useApp((s) => s.selectProject);
  const generateStage = useApp((s) => s.generateStage);
  const lockStage = useApp((s) => s.lockStage);

  const [q, setQ] = useState('');
  const [idx, setIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQ('');
      setIdx(0);
      setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [open]);

  const items = useMemo<Item[]>(() => {
    const list: Item[] = [];
    VIEWS.forEach((v) => list.push({ id: `v-${v.key}`, label: v.label, kind: '视图', icon: v.icon, run: () => setView(v.key) }));
    STAGES.forEach((s) =>
      list.push({ id: `s-${s.id}`, label: `${s.code} ${s.name}`, kind: '阶段', icon: 'flow', run: () => openStage(s.id) })
    );
    STAGES.forEach((s) => {
      list.push({ id: `g-${s.id}`, label: `生成：${s.name}`, kind: '动作', icon: 'spark', run: () => { openStage(s.id); generateStage(s.id); } });
      list.push({ id: `l-${s.id}`, label: `锁定：${s.name}`, kind: '动作', icon: 'lock', run: () => { openStage(s.id); lockStage(s.id); } });
    });
    projects.forEach((p) => list.push({ id: `p-${p.id}`, label: p.name, kind: '项目', icon: 'grid', run: () => selectProject(p.id) }));
    return list;
  }, [setView, openStage, generateStage, lockStage, projects, selectProject]);

  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase();
    if (!k) return items.slice(0, 40);
    return items.filter((i) => i.label.toLowerCase().includes(k) || i.kind.includes(k)).slice(0, 40);
  }, [items, q]);

  useEffect(() => setIdx(0), [q]);

  if (!open) return null;

  const exec = (item?: Item) => {
    if (!item) return;
    item.run();
    setOpen(false);
  };

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}>
      <div className="modal cmdk" role="dialog" aria-modal>
        <div className="row" style={{ padding: '0 6px' }}>
          <Icon name="search" style={{ width: 16, height: 16, marginLeft: 12, color: 'var(--text-3)' }} />
          <input
            ref={inputRef}
            type="text"
            value={q}
            placeholder="搜索阶段、动作、项目…"
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') { e.preventDefault(); setIdx((i) => Math.min(i + 1, filtered.length - 1)); }
              if (e.key === 'ArrowUp') { e.preventDefault(); setIdx((i) => Math.max(i - 1, 0)); }
              if (e.key === 'Enter') { e.preventDefault(); exec(filtered[idx]); }
              if (e.key === 'Escape') setOpen(false);
            }}
          />
        </div>
        <div className="cmdk-list">
          {filtered.map((item, i) => (
            <button
              key={item.id}
              className={`cmdk-item ${i === idx ? 'on' : ''}`}
              onMouseEnter={() => setIdx(i)}
              onClick={() => exec(item)}
            >
              <Icon name={item.icon} style={{ width: 14, height: 14 }} />
              <span>{item.label}</span>
              <span className="kind">{item.kind}</span>
            </button>
          ))}
          {!filtered.length ? <div className="empty">没有匹配项</div> : null}
        </div>
      </div>
    </div>
  );
}
