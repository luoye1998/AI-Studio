import { useEffect, useState } from 'react';
import { Icon } from '../ui/Icons';
import { Modal } from '../ui/kit';
import { stageById } from '../core/stages';
import { useActive, useApp } from '../store/store';

export default function GateModal() {
  const project = useActive();
  const gateId = useApp((s) => s.ui.gateOpen);
  const setGateOpen = useApp((s) => s.setGateOpen);
  const decideGate = useApp((s) => s.decideGate);

  const gate = project.gates.find((g) => g.id === gateId);
  const [comment, setComment] = useState('');
  const [issue, setIssue] = useState('');
  const [issues, setIssues] = useState<string[]>([]);
  const [scope, setScope] = useState<'affected' | 'node' | 'all'>('affected');

  useEffect(() => {
    if (gate) {
      setComment(gate.comment ?? '');
      setIssues(gate.issues ?? []);
      setScope(gate.rerunScope ?? 'affected');
      setIssue('');
    }
  }, [gate]);

  if (!gate) return null;

  const waiting = gate.status === 'waiting';
  const targetStage = stageById(gate.after);

  return (
    <Modal
      open={!!gate}
      title={gate.title}
      subtitle={
        gate.kind === 'budget'
          ? '预算闸口：预计超支时自动挂起，追加预算或终止由你决定。'
          : `人工闸口：通过后「${targetStage.name}」的定稿成为下游不可篡改的铁律。`
      }
      onClose={() => setGateOpen(null)}
      footer={
        waiting ? (
          <>
            <button className="btn" onClick={() => setGateOpen(null)}>稍后</button>
            <button
              className="btn danger"
              onClick={() => {
                decideGate(gate.id, 'reject', comment, issues, scope);
                setComment(''); setIssues([]);
              }}
            >
              <Icon name="x" />打回重做
            </button>
            <button
              className="btn primary"
              onClick={() => {
                decideGate(gate.id, 'approve', comment, issues, scope);
                setComment(''); setIssues([]);
              }}
            >
              <Icon name="check" />通过
            </button>
          </>
        ) : (
          <button className="btn" onClick={() => setGateOpen(null)}>关闭</button>
        )
      }
    >
      <div className="col" style={{ gap: 14 }}>
        <div className="row">
          <span className={`tag ${gate.status === 'approved' ? 'green' : gate.status === 'rejected' ? 'red' : gate.status === 'waiting' ? 'amber' : ''}`}>
            <span className="dot" />
            {gate.status === 'approved' ? '已通过' : gate.status === 'rejected' ? '已打回' : gate.status === 'waiting' ? '等待你决定' : '未触发'}
          </span>
          <span className="tag">关联阶段 {targetStage.code} {targetStage.name}</span>
          {gate.decidedAt ? (
            <span className="tiny dim">决定时间 {new Date(gate.decidedAt).toLocaleString('zh-CN', { hour12: false })}</span>
          ) : null}
        </div>

        {gate.kind !== 'budget' ? (
          <div className="card pad" style={{ background: 'rgba(0,0,0,0.22)' }}>
            <div className="label" style={{ marginBottom: 6 }}>本阶段审稿清单</div>
            <div className="checks">
              {targetStage.checks.map((c) => (
                <div className="check" key={c}><span className="box" /><span>{c}</span></div>
              ))}
            </div>
          </div>
        ) : null}

        <div>
          <div className="label" style={{ marginBottom: 6 }}>审批意见</div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={gate.kind === 'budget' ? '例如：同意追加 20%，但下不为例' : '例如：第三场台词太书面，改口语'}
            style={{ minHeight: 70 }}
            readOnly={!waiting}
          />
        </div>

        {waiting ? (
          <>
            <div>
              <div className="label" style={{ marginBottom: 6 }}>问题项（打回时至少一条）</div>
              <div className="row" style={{ marginBottom: 8 }}>
                <input
                  type="text"
                  value={issue}
                  onChange={(e) => setIssue(e.target.value)}
                  placeholder="写一条具体问题，回车添加"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && issue.trim()) {
                      setIssues([...issues, issue.trim()]);
                      setIssue('');
                    }
                  }}
                />
                <button
                  className="btn sm"
                  onClick={() => {
                    if (issue.trim()) { setIssues([...issues, issue.trim()]); setIssue(''); }
                  }}
                >
                  添加
                </button>
              </div>
              <div className="col" style={{ gap: 5 }}>
                {issues.map((it, i) => (
                  <div key={`${it}-${i}`} className="row card" style={{ padding: '6px 9px' }}>
                    <span className="tiny dim">{i + 1}</span>
                    <span className="sm">{it}</span>
                    <span className="grow" />
                    <button className="btn ghost sm" onClick={() => setIssues(issues.filter((_, j) => j !== i))}>
                      <Icon name="x" />
                    </button>
                  </div>
                ))}
                {!issues.length ? <div className="tiny dim">还没有问题项</div> : null}
              </div>
            </div>

            <div>
              <div className="label" style={{ marginBottom: 6 }}>打回后的重跑范围</div>
              <div className="row" style={{ gap: 8 }}>
                {[
                  { k: 'affected' as const, t: 'affected', d: '本阶段 + 前一个生成步骤' },
                  { k: 'node' as const, t: 'node', d: '仅当前阶段' },
                  { k: 'all' as const, t: 'all', d: '当前阶段前的全部生成步骤' },
                ].map((o) => (
                  <button
                    key={o.k}
                    className="card pad"
                    style={{ flex: 1, cursor: 'pointer', textAlign: 'left', borderColor: scope === o.k ? 'rgba(224,176,85,0.45)' : undefined, background: scope === o.k ? 'var(--gold-wash)' : undefined }}
                    onClick={() => setScope(o.k)}
                  >
                    <div className="mono sm">{o.t}</div>
                    <div className="tiny dim" style={{ marginTop: 2 }}>{o.d}</div>
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {issues.length ? (
              <div>
                <div className="label" style={{ marginBottom: 6 }}>问题项</div>
                <div className="col" style={{ gap: 5 }}>
                  {issues.map((it, i) => (
                    <div key={`${it}-${i}`} className="row card" style={{ padding: '6px 9px' }}>
                      <span className="tiny dim">{i + 1}</span><span className="sm">{it}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            {gate.kind === 'budget' && gate.status === 'waiting' ? (
              <div className="card pad" style={{ background: 'rgba(240,167,66,0.07)', borderColor: 'rgba(240,167,66,0.3)' }}>
                <div className="row" style={{ alignItems: 'flex-start' }}>
                  <Icon name="alert" style={{ width: 15, height: 15, color: 'var(--amber)', marginTop: 2 }} />
                  <div className="sm muted">{gate.comment}</div>
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
    </Modal>
  );
}
