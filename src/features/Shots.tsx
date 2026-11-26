import { useState } from 'react';
import { Icon } from '../ui/Icons';
import { SectionTitle, Empty } from '../ui/kit';
import { compileShotPrompt } from '../core/prompt';
import { formatCNY, lineSeconds, UNIT_PRICE } from '../core/budget';
import { useActive, useApp } from '../store/store';

const STATUS: Record<string, { cls: string; text: string }> = {
  planned: { cls: '', text: '待生成' },
  generated: { cls: 'indigo', text: '已生成' },
  approved: { cls: 'green', text: '已通过' },
};

export default function Shots() {
  const project = useActive();
  const generateShots = useApp((s) => s.generateShots);
  const regenerateShot = useApp((s) => s.regenerateShot);
  const approveShot = useApp((s) => s.approveShot);
  const updateShot = useApp((s) => s.updateShot);
  const pushToast = useApp((s) => s.pushToast);

  const [sel, setSel] = useState<string | null>(project.shots[0]?.id ?? null);
  const shot = project.shots.find((s) => s.id === sel) ?? project.shots[0];

  const totalSec = project.shots.reduce((a, s) => a + s.seconds, 0);
  const approved = project.shots.filter((s) => s.status === 'approved').length;
  const pending = project.shots.filter((s) => s.status !== 'approved').length;

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      pushToast({ kind: 'success', title: '提示词已复制' });
    } catch {
      pushToast({ kind: 'error', title: '复制失败' });
    }
  };

  return (
    <div className="scroll" style={{ flex: 1 }}>
      <div className="page-head">
        <div>
          <h1>镜头</h1>
          <div className="lede">
            场次表是主视图，画布是辅助视图 —— 单镜头可重做，且永不覆盖旧结果。
          </div>
        </div>
        <div className="grow" />
        <span className="tag"><span className="dot" style={{ background: 'var(--iris)' }} />总时长 {totalSec}s</span>
        <span className="tag green"><span className="dot" />{approved}/{project.shots.length} 已通过</span>
        <button className="btn primary" disabled={!pending} onClick={generateShots}>
          <Icon name="spark" />批量生成 · {formatCNY(pending * UNIT_PRICE.video)}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', minHeight: 0, flex: 1 }}>
        <div style={{ overflowY: 'auto', padding: '8px 0 40px' }}>
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ width: 46 }}>#</th>
                <th>场次 / 内容</th>
                <th style={{ width: 92 }}>景别 · 运镜</th>
                <th style={{ width: 62 }}>秒数</th>
                <th style={{ width: 92 }}>状态</th>
                <th style={{ width: 118 }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {project.shots.map((s) => (
                <tr key={s.id} onClick={() => setSel(s.id)} style={{ cursor: 'pointer', background: s.id === shot?.id ? 'rgba(255,255,255,0.035)' : undefined }}>
                  <td className="th-num">{String(s.index).padStart(2, '0')}</td>
                  <td>
                    <div style={{ fontSize: 12.5 }}>{s.scene}</div>
                    <div className="tiny dim" style={{ marginTop: 1 }}>{s.beat}</div>
                  </td>
                  <td className="sm muted">{s.size} · {s.move}</td>
                  <td className="mono sm">{s.seconds}s</td>
                  <td><span className={`tag ${STATUS[s.status].cls}`}>{STATUS[s.status].text}</span></td>
                  <td>
                    <div className="row" style={{ gap: 4 }}>
                      <button className="btn ghost sm" title="复制提示词" onClick={(e) => { e.stopPropagation(); copy(compileShotPrompt(project, s)); }}>
                        <Icon name="copy" />
                      </button>
                      <button className="btn ghost sm" title="单镜头重做" onClick={(e) => { e.stopPropagation(); regenerateShot(s.id); }}>
                        <Icon name="refresh" />
                      </button>
                      <button className="btn ghost sm" title="通过" onClick={(e) => { e.stopPropagation(); approveShot(s.id); }}>
                        <Icon name="check" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!project.shots.length ? (
            <Empty title="还没有镜头" hint="先在 09 阶段拆镜，或在这里手动添加。" illustration="shots" />
          ) : null}
        </div>

        <div style={{ borderLeft: '1px solid var(--hair)', overflowY: 'auto', padding: 16 }}>
          {shot ? (
            <>
              <SectionTitle right={<span className="mono tiny dim">SHOT {String(shot.index).padStart(2, '0')}</span>}>
                镜头详情
              </SectionTitle>

              <div
                className="shot-thumb"
                style={{ width: 118, marginBottom: 12, background: `linear-gradient(160deg, ${shot.color}, #05060a)` }}
              >
                {shot.seconds}s
              </div>

              <div className="grid-2" style={{ marginBottom: 10 }}>
                <div>
                  <div className="label" style={{ marginBottom: 4 }}>景别</div>
                  <input type="text" value={shot.size} onChange={(e) => updateShot(shot.id, { size: e.target.value })} />
                </div>
                <div>
                  <div className="label" style={{ marginBottom: 4 }}>运镜</div>
                  <input type="text" value={shot.move} onChange={(e) => updateShot(shot.id, { move: e.target.value })} />
                </div>
              </div>

              <div className="label" style={{ marginBottom: 4 }}>画面内容</div>
              <textarea value={shot.beat} onChange={(e) => updateShot(shot.id, { beat: e.target.value })} style={{ minHeight: 62 }} />

              <div className="label" style={{ margin: '10px 0 4px' }}>台词</div>
              <textarea
                value={shot.line}
                onChange={(e) => updateShot(shot.id, { line: e.target.value, seconds: Math.max(shot.seconds, Math.ceil(lineSeconds(e.target.value)) + 1) })}
                style={{ minHeight: 52 }}
                placeholder="没有台词可留空"
              />

              <div className="row" style={{ marginTop: 8 }}>
                <span className="tiny dim">台词估算 {lineSeconds(shot.line).toFixed(1)}s</span>
                {lineSeconds(shot.line) > shot.seconds ? (
                  <span className="tag red">超时长，建议拆镜</span>
                ) : (
                  <span className="tag green">可容纳</span>
                )}
                <span className="grow" />
                <span className="tiny dim">镜头</span>
                <input
                  type="number"
                  value={shot.seconds}
                  onChange={(e) => updateShot(shot.id, { seconds: Number(e.target.value) })}
                  style={{ width: 62 }}
                  min={1}
                />
              </div>

              <div className="sep" />
              <SectionTitle right={<button className="btn ghost sm" onClick={() => copy(compileShotPrompt(project, shot))}><Icon name="copy" />复制</button>}>
                编译后的视频提示词
              </SectionTitle>
              <pre
                className="doc"
                style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid var(--hair)', borderRadius: 10, padding: 12, fontSize: 11.5, whiteSpace: 'pre-wrap', margin: 0 }}
              >
                {compileShotPrompt(project, shot)}
              </pre>
            </>
          ) : (
            <div className="empty">选择左侧任一镜头</div>
          )}
        </div>
      </div>
    </div>
  );
}
