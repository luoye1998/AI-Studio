import { Icon } from '../ui/Icons';
import { SectionTitle } from '../ui/kit';
import { pickFolder } from '../core/desktop';
import { useActive, useApp } from '../store/store';

const MODES = [
  { key: 'smart' as const, name: '智能匹配剧本和方法书', desc: '按当前题材自动挑出最对路的参考资料，可勾选后联合写稿' },
  { key: 'method-only' as const, name: '只查方法书', desc: '只借用编剧技巧，不读取具体剧本文本' },
  { key: 'off' as const, name: '不调用', desc: '完全靠你自己和 AI 原创发挥' },
];

const KIND: Record<string, string> = { method: '方法书', script: '参考剧本', reference: '参考资料' };

export default function Knowledge() {
  const project = useActive();
  const toggleKnowledge = useApp((s) => s.toggleKnowledge);
  const setKnowledgeMode = useApp((s) => s.setKnowledgeMode);
  const setKnowledgeFolder = useApp((s) => s.setKnowledgeFolder);
  const toggleDoc = useApp((s) => s.toggleDoc);
  const pushToast = useApp((s) => s.pushToast);

  const k = project.knowledge;
  const enabled = k.docs.filter((d) => d.enabled).length;

  return (
    <div className="scroll" style={{ flex: 1 }}>
      <div className="row" style={{ padding: '14px 22px', borderBottom: '1px solid var(--line)' }}>
        <div>
          <h2>剧本知识库</h2>
          <div className="sm dim" style={{ marginTop: 2 }}>
            挂载你自有的编剧方法书与参考剧本，建立本地索引后检索调用 —— 让 05 阶段的写稿接上你的方法论。
          </div>
        </div>
        <div className="grow" />
        <button className={`btn ${k.mounted ? 'ok' : ''}`} onClick={() => { toggleKnowledge(); pushToast({ kind: 'info', title: k.mounted ? '已卸载知识库' : '已挂载知识库' }); }}>
          <Icon name={k.mounted ? 'check' : 'book'} />
          {k.mounted ? '已挂载' : '挂载文件夹'}
        </button>
      </div>

      <div style={{ padding: '18px 22px 40px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div className="card pad">
          <div className="row">
            <div className="grow">
              <div className="label" style={{ marginBottom: 6 }}>索引目录</div>
              <div className="row">
                <span className="mono sm dim">{k.folder || '尚未选择文件夹'}</span>
                <span className="grow" />
                <button
                  className="btn sm"
                  onClick={async () => {
                    const folder = await pickFolder();
                    if (folder) {
                      setKnowledgeFolder(folder);
                      pushToast({ kind: 'success', title: '知识库已挂载', detail: folder });
                    } else {
                      pushToast({ kind: 'info', title: '浏览器版无法读取本地目录', detail: '请使用桌面客户端（Win / macOS）选择文件夹' });
                    }
                  }}
                >
                  更换文件夹
                </button>
                <button className="btn sm" onClick={() => pushToast({ kind: 'success', title: '索引已更新', detail: `已收录 ${k.docs.length} 篇文档` })}>
                  <Icon name="refresh" />更新索引
                </button>
              </div>
            </div>
            <div style={{ width: 140 }}>
              <div className="label" style={{ marginBottom: 6 }}>状态</div>
              <span className={`tag ${k.mounted ? 'green' : ''}`}>
                <span className="dot" />
                {k.mounted ? `${k.docs.length} 篇 · ${enabled} 启用` : '未挂载'}
              </span>
            </div>
          </div>
        </div>

        <div className="card pad">
          <SectionTitle>配合方式</SectionTitle>
          <div className="col" style={{ gap: 8 }}>
            {MODES.map((m) => (
              <button
                key={m.key}
                className="card pad"
                style={{
                  textAlign: 'left',
                  cursor: 'pointer',
                  borderColor: k.mode === m.key ? 'rgba(224,176,85,0.45)' : undefined,
                  background: k.mode === m.key ? 'var(--gold-soft)' : undefined,
                }}
                onClick={() => setKnowledgeMode(m.key)}
              >
                <div className="row">
                  <b style={{ fontSize: 12.5 }}>{m.name}</b>
                  {k.mode === m.key ? <span className="tag gold">当前</span> : null}
                </div>
                <div className="sm dim" style={{ marginTop: 3 }}>{m.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="card pad">
          <SectionTitle right={<span className="tiny dim">点一行开关启用 / 停用</span>}>已索引文档</SectionTitle>
          <div className="col" style={{ gap: 6 }}>
            {k.docs.map((d) => (
              <button
                key={d.id}
                className="row card"
                style={{ padding: '9px 12px', cursor: 'pointer', textAlign: 'left', borderColor: d.enabled ? 'rgba(69,214,155,0.28)' : undefined }}
                onClick={() => toggleDoc(d.id)}
              >
                <Icon name="book" style={{ width: 14, height: 14, color: d.enabled ? 'var(--green)' : 'var(--text-3)' }} />
                <span className="sm">{d.name}</span>
                <span className="tag">{KIND[d.kind]}</span>
                <span className="grow" />
                <span className="mono tiny dim">{(d.words / 1000).toFixed(0)}k 字</span>
                <span className={`tag ${d.enabled ? 'green' : ''}`}>{d.enabled ? '启用' : '停用'}</span>
              </button>
            ))}
            {!k.docs.length ? <div className="empty">选择文件夹后会自动索引其中的 .md 文件</div> : null}
          </div>
        </div>

        <div className="card pad" style={{ background: 'rgba(123,140,255,0.05)', borderColor: 'rgba(123,140,255,0.2)' }}>
          <div className="row" style={{ alignItems: 'flex-start' }}>
            <Icon name="info" style={{ width: 15, height: 15, color: 'var(--indigo)', marginTop: 2 }} />
            <div className="sm muted">
              知识库只用于 05 正式剧本阶段：把「方法书」的结构习惯与「参考剧本」的节奏借过来，
              不会直接复制文本。启用文档越多，上下文越长、成本越高 —— 按需开启。
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
