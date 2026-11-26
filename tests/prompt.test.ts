import { describe, it, expect } from 'vitest';
import { compileShotPrompt, compileStagePrompt, lockedContext, mockGenerate } from '../src/core/prompt';
import { createDemoProject } from '../src/core/seed';
import { STAGES } from '../src/core/stages';

describe('上下文隔离', () => {
  it('只把已锁定的上游阶段带进上下文', () => {
    const p = createDemoProject();
    const ctx = lockedContext(p, 'lira');
    const ids = ctx.map((c) => c.stage);
    expect(ids).toContain('concept');
    expect(ids).toContain('script'.replace('script', 'outline'));
    // 未锁定的阶段不能出现
    for (const id of ids) {
      expect(['locked']).toContain(p.stages[id].status);
    }
  });

  it('第一阶段没有上游上下文', () => {
    const p = createDemoProject();
    expect(lockedContext(p, 'concept')).toHaveLength(0);
  });
});

describe('阶段提示词编译', () => {
  it('包含阶段编号、画幅与交付标准', () => {
    const p = createDemoProject();
    const text = compileStagePrompt(p, 'script');
    expect(text).toContain('05');
    expect(text).toContain('正式剧本'.slice(0, 2));
    expect(text).toContain(p.ratio);
    const def = STAGES.find((s) => s.id === 'script')!;
    expect(text).toContain(def.checks[0]);
  });

  it('勾选的专业技能会写入约束区', () => {
    const p = createDemoProject();
    p.stages.script.selectedSkills = ['05-A', '05-C'];
    const text = compileStagePrompt(p, 'script');
    expect(text).toContain('05-A');
    expect(text).toContain('台词像人说话');
  });

  it('本步需求作为硬规则出现', () => {
    const p = createDemoProject();
    p.stages.script.notes = '必须是 3 分钟竖屏';
    expect(compileStagePrompt(p, 'script')).toContain('必须是 3 分钟竖屏');
  });

  it('已锁定上游的正文被完整注入', () => {
    const p = createDemoProject();
    const outline = p.stages.outline.content.slice(0, 40);
    expect(compileStagePrompt(p, 'script')).toContain(outline);
  });

  it('挂载的知识库会注入检索节选', () => {
    const p = createDemoProject();
    const text = compileStagePrompt(p, 'script');
    expect(text).toContain('参考资料节选');
    expect(text).toContain('本地知识库');
  });

  it('知识库关闭时不再注入节选', () => {
    const p = createDemoProject();
    p.knowledge.mode = 'off';
    expect(compileStagePrompt(p, 'script')).not.toContain('参考资料节选');
  });

  it('启用的文档被全部停用时也不注入', () => {
    const p = createDemoProject();
    p.knowledge.docs = p.knowledge.docs.map((d) => ({ ...d, enabled: false }));
    expect(compileStagePrompt(p, 'script')).not.toContain('参考资料节选');
  });
});

describe('镜头提示词编译', () => {
  it('包含景别、运镜、秒数与参考图', () => {
    const p = createDemoProject();
    const shot = p.shots[0];
    shot.refs = [p.assets[0].id];
    const text = compileShotPrompt(p, shot);
    expect(text).toContain(shot.size);
    expect(text).toContain(shot.move);
    expect(text).toContain(`${shot.seconds}s`);
    expect(text).toContain(p.assets[0].name);
  });

  it('带台词的镜头会标注时长校准', () => {
    const p = createDemoProject();
    const shot = p.shots.find((s) => s.line) ?? p.shots[0];
    shot.line = '我知道。';
    expect(compileShotPrompt(p, shot)).toContain('台词');
  });
});

describe('本地推演引擎', () => {
  it('九个阶段都能产出非空结构化初稿', () => {
    const p = createDemoProject();
    for (const s of STAGES) {
      const text = mockGenerate(p, s.id);
      expect(text.length).toBeGreaterThan(50);
      // 勾选技能时会在开头插入一行引用，其余情况直接以标题开头
      expect(text).toMatch(/^(#|>)/);
      expect(text).toContain('##');
    }
  });

  it('勾选技能会出现在产出开头', () => {
    const p = createDemoProject();
    p.stages.concept.selectedSkills = ['01-A'];
    expect(mockGenerate(p, 'concept')).toContain('保住作者自己的味道');
  });
});
