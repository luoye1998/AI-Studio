import { Icon } from '../ui/Icons';
import { SectionTitle } from '../ui/kit';
import { saveFile } from '../core/desktop';
import { buildCsv, buildEdl, buildManifest, deliveryChecks, timecode, timeline, totalSeconds } from '../core/delivery';
import { formatCNY, spent } from '../core/budget';
import { useActive, useApp } from '../store/store';

const STATUS_COLOR: Record<string, string> = {
  approved: 'var(--teal)',
  generated: 'var(--iris)',
  planned: 'rgba(255,255,255,0.18)',
};

export default function Deliver() {
  const project = useActive();
  const approveShot = useApp((s) => s.approveShot);
  const updateShot = useApp((s) => s.updateShot);
  const pushToast = useApp((s) => s.pushToast);

  const blocks = timeline(project);
  const total = totalSeconds(project);
  const checks = deliveryChecks(project);
  const passed = checks.filter((c) => c.ok).length;
  const ready = passed === checks.length;

  const exportFile = async (name: string, content: string, kind: string) => {
    const saved = await saveFile(name, content);
    if (saved) pushToast({ kind: 'success', title: `${kind}已导出`, detail: saved });
  };

  return (
    <div className="scroll" style={{ flex: 1 }}>
      <div className="page-head">
        <div>
          <h1>交付</h1>
          <div className="lede">
            镜头排布、自检与导出 —— 成片之前最后一道关。
          </div>
        </div>
        <div className="grow" />
        <span className="tag"><span className="dot" style={{ background: 'var(--iris)' }} />{blocks.length} 镜 · {total}s</span>
        <span className={`tag ${ready ? 'green' : 'amber'}`}>
          <span className="dot" />
          自检 {passed}/{checks.length}
        </span>
        <button className="btn primary" disabled={!blocks.length} onClick={() => void exportFile(`${project.name}-交付清单.md`, buildManifest(project), '交付清单')}>
          <Icon name="download" />导出交付清单
        </button>
      </div>

      <div style={{ padding: '18px 22px 40px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div className="card pad">
          <SectionTitle right={<span className="mono tiny dim">00:00:00:00 → {timecode(total)} · 24fps</span>}>
            时间线
          </SectionTitle>
          {blocks.length ? (
            <>
              <div className="timeline" style={{ height: 44 }}>
                {blocks.map((b) => (
                  <i
                    key={b.shot.id}
                    title={`${String(b.shot.index).padStart(2, '0')} ${b.shot.scene} · ${b.shot.seconds}s`}
                    style={{
                      width: `${Math.max(2, (b.shot.seconds / Math.max(1, total)) * 100)}%`,
                      background: STATUS_COLOR[b.shot.status],
                      borderRight: '1px solid rgba(0,0,0,0.5)',
                    }}
                  />
                ))}
              </div>
              <div className="row" style={{ marginTop: 10, flexWrap: 'wrap', gap: 6 }}>
                {blocks.map((b) => (
                  <span key={b.shot.id} className={`tag ${b.shot.status === 'approved' ? 'green' : b.shot.status === 'generated' ? 'indigo' : ''}`}>
                    {String(b.shot.index).padStart(2, '0')} · {b.shot.seconds}s
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div className="tiny dim">还没有镜头</div>
          )}
        </div>

        <div className="grid-2" style={{ alignItems: 'start' }}>
          <div className="card pad">
            <SectionTitle right={<span className={`tag ${ready ? 'green' : 'amber'}`}>{ready ? '可交付' : '未就绪'}</span>}>
              交付自检
            </SectionTitle>
            <div className="col" style={{ gap: 8 }}>
              {checks.map((c) => (
                <div key={c.key} className="row">
                  <Icon
                    name={c.ok ? 'check' : 'alert'}
                    style={{ width: 14, height: 14, color: c.ok ? 'var(--teal)' : 'var(--amber)' }}
                  />
                  <span className="sm">{c.label}</span>
                  <span className="grow" />
                  <span className="tiny dim">{c.detail}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card pad">
            <SectionTitle>导出</SectionTitle>
            <div className="col" style={{ gap: 8 }}>
              <button className="btn block" disabled={!blocks.length} onClick={() => void exportFile(`${project.name}-交付清单.md`, buildManifest(project), '交付清单')}>
                <Icon name="download" />交付清单（Markdown，含每镜提示词）
              </button>
              <button className="btn block" disabled={!blocks.length} onClick={() => void exportFile(`${project.name}-镜头表.csv`, buildCsv(project), '镜头表')}>
                <Icon name="grid" />镜头表（CSV，Excel 可开）
              </button>
              <button className="btn block" disabled={!blocks.length} onClick={() => void exportFile(`${project.name}.edl`, buildEdl(project), 'EDL 时间线')}>
                <Icon name="film" />EDL 时间线（导入达芬奇 / PR）
              </button>
            </div>
            <div className="sep" />
            <div className="kv"><span className="k">总时长</span><span className="v">{total}s</span></div>
            <div className="kv"><span className="k">时间码基准</span><span className="v">24 fps</span></div>
            <div className="kv"><span className="k">已花费</span><span className="v">{formatCNY(spent(project))}</span></div>
            <div className="sm dim" style={{ marginTop: 10 }}>
              EDL 里每个镜头按顺序首尾相接，导入后即可在剪辑软件里逐镜替换/精修。
            </div>
          </div>
        </div>

        <div className="card pad">
          <SectionTitle right={<span className="tiny dim">点状态可切换通过</span>}>镜头排布</SectionTitle>
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ width: 44 }}>#</th>
                <th>场次 / 画面</th>
                <th style={{ width: 82 }}>景别 · 运镜</th>
                <th style={{ width: 56 }}>秒</th>
                <th style={{ width: 108 }}>入点 → 出点</th>
                <th style={{ width: 84 }}>状态</th>
                <th style={{ width: 76 }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {blocks.map((b) => (
                <tr key={b.shot.id}>
                  <td className="th-num">{String(b.shot.index).padStart(2, '0')}</td>
                  <td>
                    <div className="sm">{b.shot.scene}</div>
                    <div className="tiny dim">{b.shot.beat}</div>
                  </td>
                  <td className="sm muted">{b.shot.size} · {b.shot.move}</td>
                  <td className="mono sm">{b.shot.seconds}</td>
                  <td className="mono tiny dim">{b.startTc.slice(3)} → {b.endTc.slice(3)}</td>
                  <td>
                    <span className={`tag ${b.shot.status === 'approved' ? 'green' : b.shot.status === 'generated' ? 'indigo' : ''}`}>
                      {b.shot.status === 'approved' ? '已通过' : b.shot.status === 'generated' ? '已生成' : '待生成'}
                    </span>
                  </td>
                  <td>
                    <div className="row" style={{ gap: 4 }}>
                      <button
                        className="btn ghost sm"
                        title={b.shot.status === 'approved' ? '撤销通过' : '通过'}
                        onClick={() => (b.shot.status === 'approved' ? updateShot(b.shot.id, { status: 'generated' }) : approveShot(b.shot.id))}
                      >
                        <Icon name={b.shot.status === 'approved' ? 'unlock' : 'check'} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!blocks.length ? <div className="empty">还没有镜头，先在 09 阶段拆镜</div> : null}
        </div>
      </div>
    </div>
  );
}
