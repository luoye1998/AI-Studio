import { useRef } from 'react';
import { Icon } from '../ui/Icons';
import { SectionTitle } from '../ui/kit';
import { isDesktop, openProjectFile, saveFile } from '../core/desktop';
import { useApp } from '../store/store';
import type { Project } from '../core/types';

export default function SettingsView() {
  const settings = useApp((s) => s.settings);
  const updateProvider = useApp((s) => s.updateProvider);
  const projects = useApp((s) => s.projects);
  const activeId = useApp((s) => s.activeId);
  const importProjects = useApp((s) => s.importProjects);
  const pushToast = useApp((s) => s.pushToast);
  const fileRef = useRef<HTMLInputElement>(null);

  const applyImport = (raw: string) => {
    try {
      const data = JSON.parse(raw) as { projects?: Project[] } | Project;
      const list = Array.isArray((data as { projects?: Project[] }).projects)
        ? (data as { projects: Project[] }).projects
        : [data as Project];
      const n = importProjects(list);
      pushToast(
        n
          ? { kind: 'success', title: `已导入 ${n} 个工程`, detail: '同名工程会被覆盖' }
          : { kind: 'error', title: '导入失败', detail: '文件里没有可识别的工程' }
      );
    } catch (e) {
      pushToast({ kind: 'error', title: '解析失败', detail: String(e) });
    }
  };

  const doImport = async () => {
    if (isDesktop()) {
      const raw = await openProjectFile();
      if (raw) applyImport(raw);
      return;
    }
    fileRef.current?.click();
  };

  const exportAll = async () => {
    const data = JSON.stringify({ version: 1, exportedAt: Date.now(), settings, projects }, null, 2);
    const name = `workstream-backup-${new Date().toISOString().slice(0, 10)}.json`;
    const saved = await saveFile(name, data);
    if (saved) pushToast({ kind: 'success', title: isDesktop() ? '已保存到本地' : '已导出全部工程', detail: saved });
  };

  return (
    <div className="scroll" style={{ flex: 1 }}>
      <div className="page-head">
        <div>
          <h1>设置</h1>
          <div className="lede">模型通道、数据与外观</div>
        </div>
      </div>

      <div style={{ padding: '18px 22px 40px', display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 900 }}>
        <div className="card pad">
          <SectionTitle right={<span className="tiny dim">密钥只存本机，不上传</span>}>模型通道</SectionTitle>
          <div className="col" style={{ gap: 10 }}>
            {settings.providers.map((p) => (
              <div key={p.kind} className="card pad" style={{ background: 'rgba(0,0,0,0.2)' }}>
                <div className="row" style={{ marginBottom: 8 }}>
                  <span className={`tag ${p.enabled ? 'green' : ''}`}>
                    <span className="dot" />
                    {p.kind === 'text' ? '语言模型' : p.kind === 'image' ? '图像模型' : '视频模型'}
                  </span>
                  <span className="grow" />
                  <button className="btn ghost sm" onClick={() => updateProvider(p.kind, { enabled: !p.enabled })}>
                    {p.enabled ? '停用' : '启用'}
                  </button>
                </div>
                <div className="grid-3">
                  <div>
                    <div className="label" style={{ marginBottom: 4 }}>服务商</div>
                    <input type="text" value={p.provider} onChange={(e) => updateProvider(p.kind, { provider: e.target.value })} />
                  </div>
                  <div>
                    <div className="label" style={{ marginBottom: 4 }}>Base URL</div>
                    <input type="text" value={p.baseUrl} onChange={(e) => updateProvider(p.kind, { baseUrl: e.target.value })} placeholder="https://api.example.com/v1" />
                  </div>
                  <div>
                    <div className="label" style={{ marginBottom: 4 }}>模型</div>
                    <input type="text" value={p.model} onChange={(e) => updateProvider(p.kind, { model: e.target.value })} placeholder="deepseek-chat" />
                  </div>
                </div>
                {p.kind === 'text' ? (
                  <div style={{ marginTop: 8 }}>
                    <div className="label" style={{ marginBottom: 4 }}>API Key（留空则走本地推演）</div>
                    <input
                      type="password"
                      value={p.apiKey ?? ''}
                      onChange={(e) => updateProvider(p.kind, { apiKey: e.target.value })}
                      placeholder="sk-..."
                      autoComplete="off"
                    />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
          <div className="sm dim" style={{ marginTop: 10 }}>
            未配置时使用本地推演引擎产出可编辑的结构化初稿 —— 流程完全可用，接上 Key 即走真实模型。
          </div>
        </div>

        <div className="card pad">
          <SectionTitle>数据</SectionTitle>
          <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
            <button className="btn" onClick={exportAll}><Icon name="download" />导出全部工程（JSON）</button>
            <button className="btn" onClick={doImport}><Icon name="layers" />导入工程（JSON）</button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              style={{ display: 'none' }}
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (f) applyImport(await f.text());
                e.target.value = '';
              }}
            />
            <button className="btn" onClick={() => window.print()}><Icon name="film" />打印 / 导出 PDF</button>
            <button
              className="btn danger"
              onClick={() => {
                if (confirm('确定清空本地数据并恢复演示项目？此操作不可撤销。')) {
                  localStorage.removeItem('workstream-studio-v1');
                  location.reload();
                }
              }}
            >
              <Icon name="trash" />重置为演示数据
            </button>
          </div>
          <div className="kv" style={{ marginTop: 12 }}><span className="k">当前项目</span><span className="v">{projects.find((p) => p.id === activeId)?.name ?? '—'}</span></div>
          <div className="kv"><span className="k">项目总数</span><span className="v">{projects.length}</span></div>
          <div className="kv"><span className="k">存储位置</span><span className="v">浏览器本地 · localStorage</span></div>
        </div>

        <div className="card pad">
          <SectionTitle right={<span className="tiny dim">PWA · 可安装</span>}>安装为客户端</SectionTitle>
          <div className="col" style={{ gap: 8 }}>
            <div className="sm muted">
              网页版已支持安装为独立应用（离线可打开），三条路径任选：
            </div>
            <div className="kv"><span className="k">Windows</span><span className="v" style={{ fontFamily: 'var(--sans)', fontSize: 12 }}>用安装包，或 Edge 地址栏「安装应用」</span></div>
            <div className="kv"><span className="k">macOS</span><span className="v" style={{ fontFamily: 'var(--sans)', fontSize: 12 }}>Safari「文件 → 添加到程序坞」/ Chrome「安装 WorkStream」</span></div>
            <div className="kv"><span className="k">macOS 原生 dmg</span><span className="v" style={{ fontFamily: 'var(--sans)', fontSize: 12 }}>GitHub Actions 打 tag 后自动产出</span></div>
            <div className="row" style={{ marginTop: 6 }}>
              <button
                className="btn sm"
                onClick={() => pushToast({ kind: 'info', title: '安装提示', detail: '浏览器地址栏右侧「安装」图标，或菜单里「安装 WorkStream」' })}
              >
                <Icon name="download" />如何安装
              </button>
              <span className="tiny dim">离线可打开 · 数据仍存在本机</span>
            </div>
          </div>
        </div>

        <div className="card pad">
          <SectionTitle>关于</SectionTitle>
          <div className="sm muted" style={{ lineHeight: 1.8 }}>
            <b>WorkStream Studio 0.1.0</b> —— AI 影视生产流水线。九阶段上下文隔离、三级锁定、
            人工闸口、预算门禁、资产一致性锚点。
            <br />
            设计融合：Higgsfield skill 架构 / 洋子工作台九阶段方法论 / AIGC Agent Orchestration Platform
            的薄状态机与多租户经验。
          </div>
        </div>
      </div>
    </div>
  );
}
