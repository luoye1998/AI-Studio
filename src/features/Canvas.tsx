import { useMemo } from 'react';
import { Icon } from '../ui/Icons';
import StageIcon from '../ui/StageIcon';
import { STAGES } from '../core/stages';
import { useActive, useApp } from '../store/store';
import type { StageId } from '../core/types';
import { formatCNY, stageEstimate } from '../core/budget';

const NODE_W = 178;
const NODE_H = 84;
const COL = 212;
const ROW_H = 208;
const PAD = 44;

function layout() {
  const pos: Record<string, { x: number; y: number }> = {};
  const row1 = STAGES.slice(0, 5);
  const row2 = STAGES.slice(5);
  row1.forEach((s, i) => (pos[s.id] = { x: PAD + i * COL, y: PAD }));
  row2.forEach((s, i) => (pos[s.id] = { x: PAD + (row1.length - 1 - i) * COL, y: PAD + ROW_H }));
  return pos;
}

const centerX = (p: { x: number }) => p.x + NODE_W / 2;
const centerY = (p: { y: number }) => p.y + NODE_H / 2;

function wire(a: { x: number; y: number }, b: { x: number; y: number }) {
  const ac = { x: centerX(a), y: centerY(a) };
  const bc = { x: centerX(b), y: centerY(b) };
  const right = bc.x > ac.x;
  const x1 = right ? a.x + NODE_W : a.x;
  const x2 = right ? b.x : b.x + NODE_W;
  const dx = Math.max(40, Math.abs(x2 - x1) * 0.45);
  return (
    <path
      d={`M ${x1} ${ac.y} C ${x1 + (right ? dx : -dx)} ${ac.y}, ${x2 - (right ? dx : -dx)} ${bc.y}, ${x2} ${bc.y}`}
      stroke="rgba(255,255,255,0.13)"
      strokeWidth={1.3}
      fill="none"
    />
  );
}

function elbowDown(a: { x: number; y: number }, b: { x: number; y: number }, dashed = false) {
  const ax = centerX(a);
  const ay = a.y + 30;
  const bx = centerX(b);
  const by = b.y;
  const midY = ay + (by - ay) * 0.55;
  return (
    <path
      d={`M ${ax} ${ay} V ${midY} Q ${ax} ${by}, ${bx} ${by}`}
      stroke={dashed ? 'rgba(240,167,66,0.42)' : 'rgba(255,255,255,0.13)'}
      strokeWidth={1.3}
      strokeDasharray={dashed ? '5 5' : undefined}
      fill="none"
    />
  );
}

function vlink(a: { x: number; y: number }, b: { x: number; y: number }, dashed = false) {
  const ax = centerX(a);
  const ay = a.y + NODE_H;
  const bx = centerX(b);
  const by = b.y;
  return (
    <path
      d={`M ${ax} ${ay} C ${ax} ${ay + 34}, ${bx} ${by - 34}, ${bx} ${by}`}
      stroke={dashed ? 'rgba(240,167,66,0.42)' : 'rgba(255,255,255,0.13)'}
      strokeWidth={1.3}
      strokeDasharray={dashed ? '5 5' : undefined}
      fill="none"
    />
  );
}

export default function Canvas() {
  const project = useActive();
  const openStage = useApp((s) => s.openStage);
  const setGateOpen = useApp((s) => s.setGateOpen);
  const pos = useMemo(layout, []);

  const g1 = project.gates.find((g) => g.kind === 'g1');
  const g2 = project.gates.find((g) => g.kind === 'g2');
  const budgetGate = project.gates.find((g) => g.kind === 'budget' && g.status === 'waiting');

  const gateW = 150;
  const g1Pos = { x: PAD + 5 * COL + 6, y: PAD + 6 };
  const g2Pos = { x: pos.cinedance.x, y: pos.cinedance.y + NODE_H + 52 };

  const width = PAD + 6 * COL + gateW + 40;
  const height = PAD + ROW_H + NODE_H + 210;

  const locked = STAGES.filter((s) => project.stages[s.id].status === 'locked').length;
  const review = STAGES.filter((s) => project.stages[s.id].status === 'review').length;
  const next = STAGES.find((s) => project.stages[s.id].status !== 'locked' && project.stages[s.id].status !== 'skipped');

  return (
    <div className="scroll" style={{ flex: 1 }}>
      <div className="page-head">
        <div>
          <h1>画布视图</h1>
          <div className="lede">
            流水线的可执行形态 —— 阶段是节点，闸口是边；只有通过闸口，下游才被解锁。
          </div>
        </div>
        <div className="grow" />
        <span className="tag green"><span className="dot" />已锁定 {locked}</span>
        <span className="tag amber"><span className="dot" />待审阅 {review}</span>
        <span className="tag mono">{project.templateVersion}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', minHeight: 0, flex: 1 }}>
        <div className="canvas-wrap">
          <div className="dag" style={{ width, height }}>
            <svg className="wires">
              {STAGES.slice(0, 4).map((s, i) => (
                <g key={s.id}>{wire(pos[s.id], pos[STAGES[i + 1].id])}</g>
              ))}
              <path
                d={`M ${pos.script.x + NODE_W} ${centerY(pos.script)} L ${g1Pos.x} ${centerY(pos.script)}`}
                stroke="rgba(240,167,66,0.42)"
                strokeWidth={1.3}
                strokeDasharray="5 5"
              />
              {elbowDown(g1Pos, pos.stress, true)}
              {wire(pos.stress, pos.lira)}
              {wire(pos.lira, pos.acting)}
              {wire(pos.acting, pos.cinedance)}
              {vlink(pos.cinedance, g2Pos, true)}
            </svg>

            {STAGES.map((s) => {
              const st = project.stages[s.id];
              const p = pos[s.id];
              const cls = st.status === 'locked' ? 'locked' : st.status === 'review' ? 'review' : '';
              return (
                <div
                  key={s.id}
                  className={`dag-node ${cls}`}
                  style={{ left: p.x, top: p.y }}
                  onClick={() => openStage(s.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && openStage(s.id)}
                >
                  <div className="n-code" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <StageIcon id={s.id} size={12} />
                    STAGE {s.code}
                  </div>
                  <div className="n-name">{s.name}</div>
                  <div className="n-meta">
                    <Icon
                      name={st.status === 'locked' ? 'lock' : st.status === 'review' ? 'eye' : 'clock'}
                      style={{ width: 11, height: 11 }}
                    />
                    {st.status === 'locked' ? '已锁定' : st.status === 'review' ? '待审阅' : '未开始'}
                    <span className="grow" />
                    <span>{formatCNY(stageEstimate(project, s.id as StageId))}</span>
                  </div>
                </div>
              );
            })}

            {g1 ? (
              <div
                className={`dag-gate ${g1.status === 'approved' ? 'approved' : g1.status === 'waiting' ? 'waiting' : ''}`}
                style={{ left: g1Pos.x, top: g1Pos.y, width: gateW }}
                onClick={() => setGateOpen(g1.id)}
                role="button"
                tabIndex={0}
              >
                <Icon name="shield" style={{ width: 12, height: 12, verticalAlign: -2, marginRight: 4 }} />
                G1 剧本定稿
              </div>
            ) : null}

            {g2 ? (
              <div
                className={`dag-gate ${g2.status === 'approved' ? 'approved' : g2.status === 'waiting' ? 'waiting' : ''}`}
                style={{ left: g2Pos.x, top: g2Pos.y, width: gateW }}
                onClick={() => setGateOpen(g2.id)}
                role="button"
                tabIndex={0}
              >
                <Icon name="shield" style={{ width: 12, height: 12, verticalAlign: -2, marginRight: 4 }} />
                G2 成片终审
              </div>
            ) : null}

            {budgetGate ? (
              <div
                className="dag-gate waiting"
                style={{ left: g2Pos.x + 178, top: g2Pos.y, width: gateW }}
                onClick={() => setGateOpen(budgetGate.id)}
                role="button"
                tabIndex={0}
              >
                预算闸口 · 待审批
              </div>
            ) : null}

            <div style={{ position: 'absolute', left: PAD, top: height - 44 }} className="row">
              <span className="tag"><span className="dot" style={{ background: 'var(--dim)' }} />实线 = 依赖</span>
              <span className="tag amber"><span className="dot" />虚线 = 闸口约束</span>
              <span className="tiny dim">点节点进入阶段 · 点闸口进入审批</span>
            </div>
          </div>
        </div>

        <div style={{ borderLeft: '1px solid var(--hair)', padding: 16, overflowY: 'auto', background: 'rgba(0,0,0,0.16)' }}>
          <div className="label" style={{ marginBottom: 8 }}>运行状态</div>
          <div className="card pad" style={{ marginBottom: 12 }}>
            <div className="kv"><span className="k">模板</span><span className="v">{project.templateVersion}</span></div>
            <div className="kv"><span className="k">阶段完成</span><span className="v">{locked} / {STAGES.length}</span></div>
            <div className="kv"><span className="k">待审阅</span><span className="v">{review}</span></div>
            <div className="kv"><span className="k">画幅</span><span className="v">{project.ratio}</span></div>
          </div>

          <div className="label" style={{ marginBottom: 8 }}>闸口</div>
          <div className="col" style={{ gap: 8, marginBottom: 16 }}>
            {project.gates.map((g) => (
              <button
                key={g.id}
                className="card pad"
                style={{ textAlign: 'left', cursor: 'pointer', padding: '10px 12px' }}
                onClick={() => setGateOpen(g.id)}
              >
                <div className="row">
                  <Icon name="shield" style={{ width: 13, height: 13, color: g.status === 'approved' ? 'var(--teal)' : g.status === 'waiting' ? 'var(--amber)' : 'var(--dim)' }} />
                  <span className="sm">{g.title}</span>
                </div>
                <div className="row" style={{ marginTop: 4 }}>
                  <span className={`tag ${g.status === 'approved' ? 'green' : g.status === 'waiting' ? 'amber' : g.status === 'rejected' ? 'red' : ''}`}>
                    {g.status === 'approved' ? '已通过' : g.status === 'waiting' ? '待审批' : g.status === 'rejected' ? '已打回' : '未触发'}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {next ? (
            <>
              <div className="label" style={{ marginBottom: 8 }}>下一步</div>
              <div className="card pad">
                <div className="sm strong">{next.code} {next.name}</div>
                <div className="tiny dim" style={{ marginTop: 3 }}>{next.tagline}</div>
                <button className="btn primary block sm" style={{ marginTop: 10 }} onClick={() => openStage(next.id)}>
                  进入阶段
                </button>
              </div>
            </>
          ) : (
            <div className="card pad">
              <div className="sm strong">全部阶段完成</div>
              <div className="tiny dim" style={{ marginTop: 3 }}>前往镜头页合成与交付。</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
