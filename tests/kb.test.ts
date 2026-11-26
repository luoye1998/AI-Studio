import { describe, expect, it } from 'vitest';
import { buildIndex, retrieveContext, search, tokenize } from '../src/core/kb';

const DOCS = [
  {
    id: 'a',
    name: '结构方法书',
    content:
      '故事的事件必须由人物的选择推动。冲突分为内在、个人与超个人三个层级。开场十分钟决定观众是否相信这个故事。',
  },
  {
    id: 'b',
    name: '对白方法书',
    content:
      '对白的功能不是传递信息，而是角色在试图改变对方。如果一个场景里没有人试图改变另一个人，这场戏就可以删掉。',
  },
  {
    id: 'c',
    name: '参考剧本',
    content:
      '雨夜，他蹲在积水里，用镊子夹起一枚变形的黄铜弹壳。她站在他身后，说了一句他等了十年的话。',
  },
];

describe('分词', () => {
  it('中文按双字切分', () => {
    expect(tokenize('剧本知识库')).toEqual(['剧本', '本知', '知识', '识库']);
  });

  it('英文与数字按词，短碎片丢弃', () => {
    expect(tokenize('H3 prompt v2 ok')).toContain('prompt');
    expect(tokenize('a b c')).toHaveLength(0);
  });

  it('剔除 Markdown 标记与代码块', () => {
    const tokens = tokenize('# 标题\n```js\nconst a = 1\n```\n正文内容');
    expect(tokens.join('')).not.toContain('const');
    expect(tokens).toContain('标题');
  });
});

describe('索引与检索', () => {
  const index = buildIndex(DOCS);

  it('索引记录了文档数与词项', () => {
    expect(index.total).toBe(3);
    expect(index.docs).toHaveLength(3);
    expect(index.postings.size).toBeGreaterThan(10);
  });

  it('按语义关键词命中正确文档', () => {
    const hits = search(index, DOCS, '对白 角色 改变对方');
    expect(hits[0].id).toBe('b');
  });

  it('雨夜类关键词命中参考剧本', () => {
    const hits = search(index, DOCS, '雨夜 弹壳 积水');
    expect(hits[0].id).toBe('c');
  });

  it('空查询返回空结果', () => {
    expect(search(index, DOCS, '')).toEqual([]);
    expect(search(index, DOCS, '   ')).toEqual([]);
  });

  it('结果带命中片段与分数，并限制条数', () => {
    const hits = search(index, DOCS, '结构 冲突', 2);
    expect(hits.length).toBeLessThanOrEqual(2);
    expect(hits[0].score).toBeGreaterThan(0);
    expect(hits[0].snippet.length).toBeGreaterThan(0);
  });
});

describe('提示词上下文检索', () => {
  it('返回最多 2 段节选并截断长度', () => {
    const ctx = retrieveContext(DOCS, '对白 角色', { k: 2, maxChars: 20 });
    expect(ctx.length).toBeLessThanOrEqual(2);
    expect(ctx[0].snippet.length).toBeLessThanOrEqual(20);
    expect(ctx[0].name).toBeTruthy();
  });

  it('无正文文档不参与检索', () => {
    const withEmpty = [...DOCS, { id: 'd', name: '空文档', content: '   ' }];
    const ctx = retrieveContext(withEmpty, '对白', { k: 5 });
    expect(ctx.some((c) => c.name === '空文档')).toBe(false);
  });
});
