import { describe, expect, it } from 'vitest';
import { buildCsv, buildEdl, buildManifest, deliveryChecks, timeline, timecode, totalSeconds } from '../src/core/delivery';
import { createDemoProject } from '../src/core/seed';

describe('时间码', () => {
  it('按 24fps 取整', () => {
    expect(timecode(0)).toBe('00:00:00:00');
    expect(timecode(1)).toBe('00:00:01:00');
    expect(timecode(1.5)).toBe('00:00:01:12');
    expect(timecode(61)).toBe('00:01:01:00');
  });

  it('不足一帧按 0 处理，负值归零', () => {
    expect(timecode(0.02)).toBe('00:00:00:00');
    expect(timecode(-3)).toBe('00:00:00:00');
  });
});

describe('时间线排布', () => {
  it('按序号首尾相接，累计起点正确', () => {
    const p = createDemoProject();
    const blocks = timeline(p);
    expect(blocks).toHaveLength(p.shots.length);
    expect(blocks[0].startSec).toBe(0);
    for (let i = 1; i < blocks.length; i++) {
      expect(blocks[i].startSec).toBeCloseTo(blocks[i - 1].endSec, 5);
    }
    expect(blocks[blocks.length - 1].endSec).toBeCloseTo(totalSeconds(p), 5);
  });

  it('乱序输入的镜头也会被重新排序', () => {
    const p = createDemoProject();
    p.shots = [...p.shots].reverse();
    const blocks = timeline(p);
    const indices = blocks.map((b) => b.shot.index);
    expect(indices).toEqual([...indices].sort((a, b) => a - b));
  });
});

describe('交付自检', () => {
  it('演示工程尚未通过审片', () => {
    const checks = deliveryChecks(createDemoProject());
    const approved = checks.find((c) => c.key === 'approved')!;
    expect(approved.ok).toBe(false);
  });

  it('全部镜头通过且阶段完成时判定可交付', () => {
    const p = createDemoProject();
    p.shots = p.shots.map((s) => ({ ...s, status: 'approved' as const }));
    (Object.keys(p.stages) as (keyof typeof p.stages)[]).forEach((k) => {
      p.stages[k].status = 'locked';
    });
    p.budget = 9999;
    const checks = deliveryChecks(p);
    const failed = checks.filter((c) => !c.ok).map((c) => c.key);
    // 仅剩「角色资产定稿」可能未满足
    expect(failed.every((k) => k === 'assets')).toBe(true);
  });

  it('台词超时会被标记', () => {
    const p = createDemoProject();
    p.shots[0].line = '这是一句特别特别长的台词用来测试时长检查是否能把超时镜头标出来';
    p.shots[0].seconds = 2;
    const timing = deliveryChecks(p).find((c) => c.key === 'timing')!;
    expect(timing.ok).toBe(false);
  });
});

describe('导出', () => {
  const p = createDemoProject();

  it('EDL 含标题、帧率与每个镜头的时间码', () => {
    const edl = buildEdl(p);
    expect(edl).toContain(`TITLE: ${p.name}`);
    expect(edl).toContain('FCM: NON-DROP FRAME');
    const cuts = edl.split('\n').filter((l) => /^\d{3}\s+AX/.test(l));
    expect(cuts).toHaveLength(p.shots.length);
    expect(edl).toContain('* FROM CLIP NAME: SHOT_01');
  });

  it('交付清单包含镜头表与提示词小节', () => {
    const md = buildManifest(p);
    expect(md).toContain('# 雨夜第七秒 · 交付清单');
    expect(md).toContain('## 镜头表');
    expect(md).toContain('## 每镜提示词');
    expect(md).toContain(`总时长：${totalSeconds(p)}s`);
  });

  it('CSV 带 BOM 且行数正确', () => {
    const csv = buildCsv(p);
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    expect(csv.split('\n')).toHaveLength(p.shots.length + 1);
  });
});
