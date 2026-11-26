import { useMemo, useState } from 'react';
import { Icon } from '../ui/Icons';
import StageIcon from '../ui/StageIcon';
import { SectionTitle } from '../ui/kit';
import { STAGES, stageById, upstreamLocked } from '../core/stages';
import { skillsForStage } from '../core/skills';
import { compileStagePrompt, lockedContext } from '../core/prompt';
import { formatCNY, stageEstimate } from '../core/budget';
import { useActive, useApp } from '../store/store';

const STATUS_TAG: Record<string, { cls: string; text: string }> = {
  idle: { cls: '', text: '未开始' },
  drafting: { cls: 'indigo', text: '草稿中' },
  review: { cls: 'amber', text: '待审阅' },
  locked: { cls: 'green', text: '已锁定' },
  skipped: { cls: '', text: '已跳过' },
};

function StatusIcon({ status }: { status: string }) {
  if (status === 'locked') return <Icon name="check" className="s-locked" />;
  if (status === 'review') return <Icon name="eye" className="s-review" />;
  if (status === 'skipped') return <Icon name="x" className="s-skipped" />;
  if (status === 'drafting') return <Icon name="dots" className="s-review" />;
  return <span className="s-idle">·</span>;
}

export default function Pipeline() {
  const project = useActive();
  const activeStage = useApp((s) => s.ui.activeStage);
  const openStage = useApp((s) => s.openStage);
  const setStageNotes = useApp((s) => s.setStageNotes);
  const toggleSkill = useApp((s) => s.toggleSkill);
  const generateStage = useApp((s) => s.generateStage);
  const saveDraft = useApp((s) => s.saveDraft);
  const lockStage = useApp((s) => s.lockStage);
  const unlockStage = useApp((s) => s.unlockStage);
  const skipStage = useApp((s) => s.skipStage);
  const setGateOpen = useApp((s) => s.setGateOpen);
  const pushToast = useApp((s) => s.pushToast);
  const generating = useApp((s) => s.ui.generating);

  const def = stageById(activeStage);
  const state = project.stages[activeStage];
  const skills = skillsForStage(def.skillStage);
  const isLocked = state.status === 'locked';
  const est = stageEstimate(project, activeStage);
  const ctx = lockedContext(project, activeStage);
  const upstream = upstreamLocked(project, activeStage);
  const [tab, setTab] = useState<'doc' | 'preview'>('doc');

  const gate = useMemo(() => {
    if (activeStage === 'script') return project.gates.find((g) => g.kind === 'g1');
    if (activeStage === 'cinedance') return project.gates.find((g) => g.kind === 'g2');
    return undefined;
  }, [project.gates, activeStage]);

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(compileStagePrompt(project, activeStage));
      pushToast({ kind: 'success', title: '提示词已复制', detail: '可直接粘贴到任意大模型或 CLI' });
    } catch {
      pushToast({ kind: 'error', title: '复制失败', detail: '浏览器拒绝了剪贴板权限' });
    }
  };

  return (
    <div className="pipeline">
      <div className="stage-list">
        {STAGES.map((s, i) => {
          const st = project.stages[s.id];
          return (
            <div key={s.id}>
              <button className={`stage-item ${s.id === activeStage ? 'on' : ''}`} onClick={() => openStage(s.id)}>
                <span className={`stage-ico ${st.status === 'locked' ? 'locked' : ''}`}>
                  <StageIcon id={s.id} />
                </span>
                <span className="body">
                  <span className="nm">
                    <span className="tiny mono dim" style={{ marginRight: 2 }}>{s.code}</span>
                    {s.name}
                    {s.optional ? <span className="tag" style={{ height: 16, padding: '0 5px', fontSize: 9 }}>可选</span> : null}
                  </span>
                  <span className="sub">{s.tagline}</span>
                </span>
                <span className="state"><StatusIcon status={st.status} /></span>
              </button>
              {i < STAGES.length - 1 ? <div className="connector"><i /></div> : null}
            </div>
          );
        })}
      </div>

      <div className="stage-ws">
        <div className="ws-head">
          <div className="ws-title">
            <span className="code">{def.code}</span>
            <h1>{def.name}</h1>
            <span className="sm dim">{def.en}</span>
            <span className={`tag ${STATUS_TAG[state.status].cls}`}>
              <span className="dot" />
              {STATUS_TAG[state.status].text}
            </span>
            {state.lockedAt ? (
              <span className="tiny dim">
                锁定于 {new Date(state.lockedAt).toLocaleString('zh-CN', { hour12: false })}
              </span>
            ) : null}
            <span className="grow" />
            {state.status !== 'locked' ? (
              <>
                <button className="btn" onClick={copyPrompt}><Icon name="copy" />复制本步提示词</button>
                <button
                  className="btn"
                  disabled={generating === activeStage}
                  onClick={() => void generateStage(activeStage)}
                >
                  <Icon name={generating === activeStage ? 'clock' : 'spark'} />
                  {generating === activeStage ? '生成中…' : `生成初稿 · ${formatCNY(est)}`}
                </button>
                <button className="btn primary" onClick={() => lockStage(activeStage)}>
                  <Icon name="check" />确认采用
                </button>
              </>
            ) : (
              <>
                <button className="btn" onClick={copyPrompt}><Icon name="copy" />复制定稿提示词</button>
                <button className="btn" onClick={() => unlockStage(activeStage)}>
                  <Icon name="unlock" />解锁重做
                </button>
              </>
            )}
            {def.optional && state.status !== 'locked' && state.status !== 'skipped' ? (
              <button className="btn ghost" onClick={() => skipStage(activeStage)}>跳过本步</button>
            ) : null}
          </div>
          <div className="ws-purpose">{def.purpose}</div>
          {gate && gate.status === 'waiting' ? (
            <div
              className="card pad"
              style={{ marginTop: 12, borderColor: 'rgba(240,167,66,0.35)', background: 'rgba(240,167,66,0.06)', display: 'flex', alignItems: 'center', gap: 10 }}
            >
              <Icon name="shield" style={{ width: 16, height: 16, color: 'var(--amber)' }} />
              <div className="grow sm">
                <b>{gate.title}</b> 正在等待审批 —— 通过后下游才允许推进。
              </div>
              <button className="btn sm" onClick={() => setGateOpen(gate.id)}>去审批</button>
            </div>
          ) : null}
        </div>

        <div className="ws-body">
          <div className="ws-main">
            <div className="row" style={{ marginBottom: 10 }}>
              <button className={`btn sm ${tab === 'doc' ? 'on' : 'ghost'}`} onClick={() => setTab('doc')}>
                <Icon name="wand" />编辑
              </button>
              <button className={`btn sm ${tab === 'preview' ? 'on' : 'ghost'}`} onClick={() => setTab('preview')}>
                <Icon name="eye" />预览
              </button>
              <span className="grow" />
              <span className="tiny dim">交付物：{def.deliverable}</span>
            </div>

            {tab === 'doc' ? (
              <textarea
                key={activeStage + state.status}
                value={state.content}
                readOnly={isLocked}
                onChange={(e) => saveDraft(activeStage, e.target.value)}
                placeholder={`在这里写「${def.deliverable}」，或点右上角「生成初稿」让 AI 先给一版。\n\n锁定后此稿将成为下游不可篡改的铁律。`}
                style={{ minHeight: 'calc(100vh - 330px)', fontFamily: 'var(--font)', fontSize: 13, lineHeight: 1.75 }}
              />
            ) : (
              <div className="card pad" style={{ minHeight: 'calc(100vh - 330px)' }}>
                {state.content ? <div className="doc">{state.content}</div> : <div className="empty">还没有内容</div>}
              </div>
            )}

            <div style={{ marginTop: 18 }}>
              <SectionTitle>交付标准（审稿清单）</SectionTitle>
              <div className="checks">
                {def.checks.map((c) => (
                  <div className="check" key={c}>
                    <span className="box" />
                    <span>{c}</span>
                  </div>
                ))}
              </div>
            </div>

            {state.versions.length ? (
              <div style={{ marginTop: 18 }}>
                <SectionTitle right={<span className="tiny dim">{state.versions.length} 个版本 · 重跑不覆盖</span>}>
                  版本历史
                </SectionTitle>
                <div className="col" style={{ gap: 6 }}>
                  {state.versions.slice(0, 5).map((v) => (
                    <div key={v.id} className="row card" style={{ padding: '8px 10px' }}>
                      <span className="mono tiny dim">{new Date(v.createdAt).toLocaleString('zh-CN', { hour12: false })}</span>
                      <span className="tag">{v.note}</span>
                      {v.skills.length ? <span className="tiny dim">技能 {v.skills.length}</span> : null}
                      {v.cost ? <span className="tiny dim">{formatCNY(v.cost)}</span> : null}
                      <span className="grow" />
                      {v.id === state.lockedVersionId ? <span className="tag green">当前定稿</span> : null}
                      <button
                        className="btn ghost sm"
                        onClick={() => {
                          saveDraft(activeStage, v.content);
                          pushToast({ kind: 'info', title: '已载入该版本', detail: '内容已回填到编辑器，尚未锁定' });
                        }}
                      >
                        载入
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="ws-side">
            <SectionTitle>本步需求（硬规则）</SectionTitle>
            <textarea
              value={state.notes}
              onChange={(e) => setStageNotes(activeStage, e.target.value)}
              placeholder="例：本片必须是 3 分钟竖屏爽剧，台词不准文绉绉。"
              style={{ minHeight: 76, fontSize: 12 }}
            />

            <div style={{ height: 16 }} />
            <SectionTitle right={<span className="tiny dim">{state.selectedSkills.length} 项</span>}>
              专业约束
            </SectionTitle>
            <div className="skill-grid">
              {skills.map((s) => {
                const on = state.selectedSkills.includes(s.code);
                return (
                  <button key={s.code} className={`skill ${on ? 'on' : ''}`} onClick={() => toggleSkill(activeStage, s.code)}>
                    <span className="cd">{s.code}</span>
                    <span className="tx">
                      <span className="ti">{s.title}</span>
                      <span className="su">{s.summary}</span>
                    </span>
                  </button>
                );
              })}
              {!skills.length ? <div className="tiny dim">本阶段无专属技能，可使用 00 镜头语言工具箱。</div> : null}
            </div>

            <div style={{ height: 16 }} />
            <SectionTitle right={<span className="tiny dim">{ctx.length} 段</span>}>已锁定上游（只喂定稿）</SectionTitle>
            <div className="col" style={{ gap: 6 }}>
              {upstream.length ? (
                upstream.map((id) => (
                  <div key={id} className="row card" style={{ padding: '7px 9px' }}>
                    <Icon name="lock" style={{ width: 12, height: 12, color: 'var(--green)' }} />
                    <span className="sm">{stageById(id).name}</span>
                    <span className="grow" />
                    <span className="tiny dim">{project.stages[id].content.length} 字</span>
                  </div>
                ))
              ) : (
                <div className="tiny dim">尚无锁定稿：本步即为基础，不会被上游污染。</div>
              )}
            </div>

            <div style={{ height: 16 }} />
            <div className="card pad" style={{ background: 'rgba(0,0,0,0.25)' }}>
              <div className="kv"><span className="k">本步估算</span><span className="v">{formatCNY(est)}</span></div>
              <div className="kv"><span className="k">计量口径</span><span className="v">{def.unit === 'text' ? '文本' : def.unit === 'image' ? '图像' : '视频'}</span></div>
              <div className="kv"><span className="k">已解锁上游</span><span className="v">{ctx.length}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
