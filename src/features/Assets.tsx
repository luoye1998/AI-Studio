import { useMemo, useState } from 'react';
import { Icon } from '../ui/Icons';
import { Modal, SectionTitle } from '../ui/kit';
import { PALETTE_CATEGORIES, PALETTES } from '../core/palettes';
import { formatCNY, UNIT_PRICE } from '../core/budget';
import { useActive, useApp } from '../store/store';
import type { Asset } from '../core/types';

const KIND_LABEL: Record<string, string> = { character: '角色', scene: '场景', prop: '道具', style: '风格' };

export default function Assets() {
  const project = useActive();
  const addAsset = useApp((s) => s.addAsset);
  const generateAssetVersion = useApp((s) => s.generateAssetVersion);
  const approveAsset = useApp((s) => s.approveAsset);
  const removeAsset = useApp((s) => s.removeAsset);
  const setPalette = useApp((s) => s.setPalette);
  const pushToast = useApp((s) => s.pushToast);

  const [addOpen, setAddOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [kind, setKind] = useState<Asset['kind']>('character');
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [prompt, setPrompt] = useState('');

  const groups = useMemo(() => {
    const g: Record<string, Asset[]> = { character: [], scene: [], prop: [], style: [] };
    project.assets.forEach((a) => g[a.kind]?.push(a));
    return g;
  }, [project.assets]);

  const current = PALETTES.find((p) => p.id === project.palette);

  return (
    <div className="scroll" style={{ flex: 1 }}>
      <div className="row" style={{ padding: '14px 22px', borderBottom: '1px solid var(--line)' }}>
        <div>
          <h2>资产库</h2>
          <div className="sm dim" style={{ marginTop: 2 }}>
            一致性靠锚点，不靠提示词 —— 角色先出 2×2 四视图，后续所有镜头只引用、不重画。
          </div>
        </div>
        <div className="grow" />
        <button className="btn" onClick={() => setPaletteOpen(true)}>
          <Icon name="wand" />
          {current ? `色卡：${current.name}` : '挂载 LIRA 色卡'}
        </button>
        <button className="btn primary" onClick={() => setAddOpen(true)}>
          <Icon name="plus" />添加资产
        </button>
      </div>

      <div style={{ padding: '18px 22px 40px' }}>
        {current ? (
          <div className="card pad" style={{ marginBottom: 18, display: 'flex', gap: 14, alignItems: 'center' }}>
            <div className="swatch" style={{ gap: 6 }}>
              {current.colors.map((c) => (
                <i key={c} style={{ background: c, width: 26, height: 34, borderRadius: 6 }} />
              ))}
            </div>
            <div>
              <div className="row">
                <b>{current.master}</b>
                <span className="tag gold">{current.name}</span>
                <span className="tag">{current.category}</span>
              </div>
              <div className="sm dim" style={{ marginTop: 2 }}>{current.mood} · 全片影调基准，所有资产生图沿用</div>
            </div>
          </div>
        ) : null}

        {(['character', 'scene', 'prop', 'style'] as const).map((k) =>
          groups[k].length ? (
            <div key={k} style={{ marginBottom: 24 }}>
              <SectionTitle right={<span className="tiny dim">{groups[k].length} 个</span>}>{KIND_LABEL[k]}</SectionTitle>
              <div className="grid-3">
                {groups[k].map((a) => {
                  const approved = a.versions.find((v) => v.id === a.approvedVersionId);
                  return (
                    <div className="card asset-card" key={a.id}>
                      <div className="row">
                        <b style={{ fontSize: 13 }}>{a.name}</b>
                        <span className="tag">{a.role}</span>
                        <span className="grow" />
                        {approved ? <span className="tag green"><span className="dot" />已定稿</span> : <span className="tag amber">未定稿</span>}
                      </div>

                      <div className="views">
                        {a.views.map((v) => {
                          const has = !!approved;
                          return (
                            <div key={v.key} className={`view-slot ${has ? 'filled' : ''}`} style={has ? { background: `linear-gradient(160deg, ${current?.colors[1] ?? '#222'}, ${current?.colors[0] ?? '#111'})` } : undefined}>
                              {has ? <span style={{ fontSize: 9.5, opacity: 0.75 }}>{v.label}</span> : v.label}
                            </div>
                          );
                        })}
                      </div>

                      <div className="sm dim" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {a.prompt}
                      </div>

                      <div className="row">
                        <span className="tiny dim">{a.versions.length} 个版本</span>
                        <span className="grow" />
                        <button className="btn ghost sm" onClick={() => removeAsset(a.id)} title="删除资产">
                          <Icon name="trash" />
                        </button>
                        <button className="btn sm" onClick={() => generateAssetVersion(a.id)}>
                          <Icon name="spark" />{formatCNY(UNIT_PRICE.image)}
                        </button>
                        <button
                          className="btn sm ok"
                          disabled={!a.versions.length}
                          onClick={() => {
                            if (!a.versions.length) return;
                            approveAsset(a.id, a.versions[0].id);
                            pushToast({ kind: 'success', title: '已定稿', detail: `${a.name} 的最新版本已锁定` });
                          }}
                        >
                          <Icon name="lock" />定稿
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null
        )}

        {!project.assets.length ? <div className="empty">还没有资产，先添加角色与场景。</div> : null}
      </div>

      <Modal
        open={addOpen}
        title="添加资产"
        subtitle="角色写清五官、发型、服装与标志道具，才画得出来。"
        onClose={() => setAddOpen(false)}
        footer={
          <>
            <button className="btn" onClick={() => setAddOpen(false)}>取消</button>
            <button
              className="btn primary"
              onClick={() => {
                if (!name.trim()) return;
                addAsset(kind, name.trim(), role.trim() || KIND_LABEL[kind], prompt.trim());
                setAddOpen(false);
                setName(''); setRole(''); setPrompt('');
              }}
            >
              创建
            </button>
          </>
        }
      >
        <div className="col" style={{ gap: 12 }}>
          <div className="row">
            <div className="grow">
              <div className="label" style={{ marginBottom: 6 }}>类型</div>
              <select value={kind} onChange={(e) => setKind(e.target.value as Asset['kind'])}>
                <option value="character">角色</option>
                <option value="scene">场景</option>
                <option value="prop">道具</option>
                <option value="style">风格</option>
              </select>
            </div>
            <div className="grow">
              <div className="label" style={{ marginBottom: 6 }}>名称</div>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="林深" />
            </div>
          </div>
          <div>
            <div className="label" style={{ marginBottom: 6 }}>定位</div>
            <input type="text" value={role} onChange={(e) => setRole(e.target.value)} placeholder="主角 · 男 32" />
          </div>
          <div>
            <div className="label" style={{ marginBottom: 6 }}>外观锚点（必须可画）</div>
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="窄长脸，颧骨高，左眉尾一道旧疤；短寸；洗到发灰的深蓝夹克，右袖口磨破。" />
          </div>
        </div>
      </Modal>

      <Modal
        open={paletteOpen}
        title="LIRA 导演色卡"
        subtitle="给全片一个统一视觉基准，解决「单张还行、十张放一起就露馅」。"
        onClose={() => setPaletteOpen(false)}
        width={760}
        footer={<button className="btn" onClick={() => setPaletteOpen(false)}>完成</button>}
      >
        <div className="col" style={{ gap: 16, paddingBottom: 8 }}>
          <button className="btn block" onClick={() => { setPalette(null); setPaletteOpen(false); }}>
            取消挂载（使用默认影调）
          </button>
          {PALETTE_CATEGORIES.map((cat) => (
            <div key={cat}>
              <div className="label" style={{ marginBottom: 8 }}>{cat}</div>
              <div className="grid-3">
                {PALETTES.filter((p) => p.category === cat).map((p) => (
                  <button
                    key={p.id}
                    className="card pad"
                    style={{ textAlign: 'left', cursor: 'pointer', borderColor: p.id === project.palette ? 'rgba(224,176,85,0.5)' : undefined }}
                    onClick={() => { setPalette(p.id); setPaletteOpen(false); pushToast({ kind: 'success', title: '色卡已挂载', detail: `${p.master} · ${p.name}` }); }}
                  >
                    <div className="row">
                      <b style={{ fontSize: 12.5 }}>{p.name}</b>
                      <span className="grow" />
                      {p.id === project.palette ? <Icon name="check" style={{ width: 13, height: 13, color: 'var(--gold)' }} /> : null}
                    </div>
                    <div className="tiny dim" style={{ marginTop: 1 }}>{p.master}</div>
                    <div className="swatch" style={{ marginTop: 8 }}>
                      {p.colors.map((c) => <i key={c} style={{ background: c, width: 22, height: 22 }} />)}
                    </div>
                    <div className="tiny dim" style={{ marginTop: 6 }}>{p.mood}</div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
