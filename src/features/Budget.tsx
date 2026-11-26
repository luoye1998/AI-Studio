import { Icon } from '../ui/Icons';
import { Progress, SectionTitle, Stat } from '../ui/kit';
import { formatCNY, remaining, spent } from '../core/budget';
import { stageById } from '../core/stages';
import { useActive, useApp } from '../store/store';

const KIND_LABEL: Record<string, string> = { text: '文本', image: '图像', video: '视频', compose: '合成' };

export default function Budget() {
  const project = useActive();
  const setBudget = useApp((s) => s.setBudget);
  const setGateOpen = useApp((s) => s.setGateOpen);
  const pushToast = useApp((s) => s.pushToast);

  const used = spent(project);
  const left = remaining(project);
  const pct = Math.min(100, Math.round((used / Math.max(1, project.budget)) * 100));
  const gates = project.gates;

  const exportCsv = () => {
    const rows = [
      ['时间', '项目', '类型', '数量', '金额'],
      ...project.costs.map((c) => [new Date(c.at).toISOString(), c.label, KIND_LABEL[c.kind] ?? c.kind, String(c.units), c.amount.toFixed(2)]),
    ];
    const csv = '\uFEFF' + rows.map((r) => r.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${project.name}-成本明细.csv`;
    a.click();
    pushToast({ kind: 'success', title: '已导出成本明细' });
  };

  return (
    <div className="scroll" style={{ flex: 1 }}>
      <div className="row" style={{ padding: '14px 22px', borderBottom: '1px solid var(--line)' }}>
        <div>
          <h2>成本与预算</h2>
          <div className="sm dim" style={{ marginTop: 2 }}>
            生成前先算账：预估 → 确认 → 扣费；超支自动挂起，追加预算需人工审批。
          </div>
        </div>
        <div className="grow" />
        <button className="btn" onClick={exportCsv}><Icon name="download" />导出 CSV</button>
      </div>

      <div style={{ padding: '18px 22px 40px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div className="card pad">
          <div className="row" style={{ marginBottom: 14 }}>
            <Stat value={formatCNY(project.budget)} label="预算上限" />
            <div style={{ width: 28 }} />
            <Stat value={formatCNY(used)} label="已花费" tone="var(--gold)" />
            <div style={{ width: 28 }} />
            <Stat value={formatCNY(left)} label="剩余" tone={left < 0 ? 'var(--red)' : 'var(--green)'} />
            <div className="grow" />
            <div style={{ width: 180 }}>
              <div className="row tiny dim" style={{ marginBottom: 5 }}>
                <span>用量</span>
                <span className="grow" />
                <span className="mono">{pct}%</span>
              </div>
              <Progress value={pct} tone={pct > 90 ? 'gold' : 'green'} />
            </div>
          </div>

          <div className="row" style={{ gap: 10 }}>
            <span className="label">调整预算</span>
            <input
              type="number"
              value={project.budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              style={{ width: 120 }}
              min={0}
            />
            <span className="tiny dim">保存后立即生效；低于已花费时会进入超支状态</span>
          </div>
        </div>

        <div className="card pad">
          <SectionTitle right={<span className="tiny dim">80% 提醒 · 100% 硬停</span>}>闸口</SectionTitle>
          <div className="col" style={{ gap: 8 }}>
            {gates.map((g) => (
              <div key={g.id} className="row card" style={{ padding: '10px 12px' }}>
                <Icon name="shield" style={{ width: 14, height: 14, color: g.status === 'approved' ? 'var(--green)' : g.status === 'waiting' ? 'var(--amber)' : 'var(--text-3)' }} />
                <span className="sm">{g.title}</span>
                <span className={`tag ${g.status === 'approved' ? 'green' : g.status === 'waiting' ? 'amber' : g.status === 'rejected' ? 'red' : ''}`}>
                  {g.status === 'approved' ? '已通过' : g.status === 'waiting' ? '待审批' : g.status === 'rejected' ? '已打回' : '未触发'}
                </span>
                <span className="grow" />
                <button className="btn sm" onClick={() => setGateOpen(g.id)}>查看</button>
              </div>
            ))}
          </div>
        </div>

        <div className="card pad">
          <SectionTitle right={<span className="tiny dim">{project.costs.length} 条</span>}>消费明细</SectionTitle>
          <table className="tbl">
            <thead>
              <tr>
                <th>时间</th>
                <th>事由</th>
                <th style={{ width: 70 }}>类型</th>
                <th style={{ width: 80 }}>阶段</th>
                <th style={{ width: 90 }}>金额</th>
              </tr>
            </thead>
            <tbody>
              {project.costs.map((c) => (
                <tr key={c.id}>
                  <td className="mono tiny dim">{new Date(c.at).toLocaleString('zh-CN', { hour12: false })}</td>
                  <td className="sm">{c.label}</td>
                  <td className="sm muted">{KIND_LABEL[c.kind] ?? c.kind}</td>
                  <td className="sm dim">{c.stage ? stageById(c.stage).code : '—'}</td>
                  <td className="mono sm">{formatCNY(c.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!project.costs.length ? <div className="empty">还没有消费记录</div> : null}
        </div>
      </div>
    </div>
  );
}
