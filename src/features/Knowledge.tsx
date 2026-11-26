import { useMemo, useState } from 'react';
import { Icon } from '../ui/Icons';
import { SectionTitle } from '../ui/kit';
import { mountKnowledgeFolder } from '../core/desktop';
import { buildIndex, search } from '../core/kb';
import { useActive, useApp } from '../store/store';

const MODES = [
  { key: 'smart' as const, name: '智能匹配剧本和方法书', desc: '按当前题材自动挑出最对路的参考资料，可勾选后联合写稿' },
  { key: 'method-only' as const, name: '只查方法书', desc: '只借用编剧技巧，不读取具体剧本文本' },
  { key: 'off' as const, name: '不调用', desc: '完全靠你自己和 AI 原创发挥' },
];

const KIND: Record<string, string> = { method: '方法书', script: '参考剧本', reference: '参考资料' };

export default function Knowledge() {
  const project = useActive();
  const setKnowledgeMode = useApp((s) => s.setKnowledgeMode);
  const mountDocs = useApp((s) => s.mountDocs);
  const toggleDoc = useApp((s) => s.toggleDoc);
  const pushToast = useApp((s) => s.pushToast);
  const [probe, setProbe] = useState('');

  const k = project.knowledge;
  const enabled = k.docs.filter((d) => d.enabled).length;
  const indexed = k.docs.filter((d) => d.content && d.content.trim());

  const hits = useMemo(() => {
    if (!probe.trim() || !indexed.length) return [];
    const docs = indexed.map((d) => ({ id: d.id, name: d.name, content: d.content ?? '' }));
    return search(buildIndex(docs), docs, probe, 3);
  }, [probe, indexed]);

  const doMount = async () => {
    const res = await mountKnowledgeFolder();
    if (!res) {
      pushToast({
        kind: 'info',
        title: '无法读取目录',
        detail: '桌面客户端可直接选择文件夹；浏览器需 Chromium 内核（Edge / Chrome）',
      });
      return;
    }
    mountDocs(res.folder, res.docs);
    pushToast({
      kind: 'success',
      title: `已挂载 ${res.docs.length} 篇文档`,
      detail: res.docs.length ? `索引目录：${res.folder}` : '该目录下没有 .md / .txt 文件',
    });
  };

  return (
    <div className="scroll" style={{ flex: 1 }}>
      <div className="page-head">
        <div>
          <h1>剧本知识库</h1>
          <div className="lede">
            挂载你自有的编剧方法书与参考剧本，建立本地索引后检索调用 —— 让 05 阶段的写稿接上你的方法论。
          </div>
        </div>
        <div className="grow" />
        <button className={`btn ${k.mounted ? 'ok' : ''}`} onClick={() => void doMount()}>
          <Icon name={k.mounted ? 'refresh' : 'book'} />
          {k.mounted ? '重新挂载 / 更新索引' : '挂载文件夹'}
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
                <button className="btn sm" onClick={() => void doMount()}>
                  选择 / 更换文件夹
                </button>
                <button
                  className="btn sm"
                  disabled={!indexed.length}
                  onClick={() => pushToast({ kind: 'success', title: '索引已就绪', detail: `${indexed.length} 篇可检索，共 ${indexed.reduce((a, d) => a + (d.content?.length ?? 0), 0).toLocaleString()} 字符` })}
                >
                  <Icon name="search" />查看索引状态
                </button>
              </div>
            </div>
            <div style={{ width: 160 }}>
              <div className="label" style={{ marginBottom: 6 }}>状态</div>
              <span className={`tag ${k.mounted ? 'green' : ''}`}>
                <span className="dot" />
                {k.mounted ? `${k.docs.length} 篇 · ${enabled} 启用` : '未挂载'}
              </span>
            </div>
          </div>
        </div>

        <div className="card pad">
          <SectionTitle right={<span className="tiny dim">{indexed.length ? `${indexed.length} 篇可检索` : '需先挂载带正文的文档'}</span>}>
            检索测试
          </SectionTitle>
          <div className="row" style={{ marginBottom: 10 }}>
            <input
              type="text"
              value={probe}
              onChange={(e) => setProbe(e.target.value)}
              placeholder="输入你正在写的题材或关键词，例如：雨夜 对峙 十年"
            />
          </div>
          {probe.trim() ? (
            hits.length ? (
              <div className="col" style={{ gap: 8 }}>
                {hits.map((h) => (
                  <div key={h.id} className="card pad" style={{ padding: '9px 12px', background: 'rgba(0,0,0,0.22)' }}>
                    <div className="row">
                      <Icon name="book" style={{ width: 13, height: 13, color: 'var(--gold)' }} />
                      <span className="sm strong">{h.name}</span>
                      <span className="grow" />
                      <span className="mono tiny dim">score {h.score.toFixed(2)}</span>
                    </div>
                    <div className="tiny muted" style={{ marginTop: 4, lineHeight: 1.6 }}>{h.snippet || '（无摘要）'}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="tiny dim">没有命中，换几个关键词试试（中文按双字匹配）</div>
            )
          ) : (
            <div className="tiny dim">检索走本地 TF-IDF，不联网；命中片段会自动注入 05 阶段的提示词。</div>
          )}
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
                  background: k.mode === m.key ? 'var(--gold-wash)' : undefined,
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
                <Icon name="book" style={{ width: 14, height: 14, color: d.enabled ? 'var(--teal)' : 'var(--dim)' }} />
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
            <Icon name="info" style={{ width: 15, height: 15, color: 'var(--iris)', marginTop: 2 }} />
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
