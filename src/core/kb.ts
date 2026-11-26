/**
 * 本地知识库检索
 * 纯前端实现：中文双字切分 + 英文/数字按词，TF-IDF 打分。
 * 不依赖任何服务端或模型，几万字规模足够快。
 */

export interface KbDoc {
  id: string;
  name: string;
  content: string;
}

interface Posting {
  tf: number;
}

export interface KbIndex {
  docs: { id: string; name: string; length: number }[];
  /** token -> docId -> 词频 */
  postings: Map<string, Map<string, Posting>>;
  df: Map<string, number>;
  total: number;
}

const CJK = /[\u4e00-\u9fff]/;

/** 中文按双字切分，英文数字按词；过滤标点与停用字符 */
export function tokenize(text: string): string[] {
  const tokens: string[] = [];
  const normalized = text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#>*_`~\-|]/g, ' ')
    .toLowerCase();

  const chunks = normalized.split(/[^0-9a-z\u4e00-\u9fff]+/i).filter(Boolean);
  for (const chunk of chunks) {
    if (!CJK.test(chunk)) {
      if (chunk.length >= 2) tokens.push(chunk);
      continue;
    }
    // 中文段落：连续汉字 → 双字
    const chars = Array.from(chunk);
    if (chars.length === 1) {
      tokens.push(chunk);
      continue;
    }
    for (let i = 0; i < chars.length - 1; i++) tokens.push(chars[i] + chars[i + 1]);
  }
  return tokens;
}

export function buildIndex(docs: KbDoc[]): KbIndex {
  const postings = new Map<string, Map<string, Posting>>();
  const df = new Map<string, number>();
  const meta: KbIndex['docs'] = [];

  for (const doc of docs) {
    const tokens = tokenize(doc.content || '');
    meta.push({ id: doc.id, name: doc.name, length: tokens.length });
    const local = new Map<string, number>();
    for (const t of tokens) local.set(t, (local.get(t) ?? 0) + 1);
    for (const [t, tf] of local) {
      if (!postings.has(t)) postings.set(t, new Map());
      postings.get(t)!.set(doc.id, { tf });
      df.set(t, (df.get(t) ?? 0) + 1);
    }
  }
  return { docs: meta, postings, df, total: docs.length };
}

export interface KbHit {
  id: string;
  name: string;
  score: number;
  snippet: string;
}

const WINDOW = 160;

function makeSnippet(content: string, tokens: string[]): string {
  const flat = content.replace(/\s+/g, ' ').trim();
  if (!flat) return '';
  let at = -1;
  for (const t of tokens) {
    const idx = flat.indexOf(t);
    if (idx >= 0 && (at < 0 || idx < at)) at = idx;
  }
  if (at < 0) return flat.slice(0, WINDOW);
  const start = Math.max(0, at - Math.floor(WINDOW / 3));
  const end = Math.min(flat.length, start + WINDOW);
  return `${start > 0 ? '…' : ''}${flat.slice(start, end)}${end < flat.length ? '…' : ''}`;
}

export function search(index: KbIndex, docs: KbDoc[], query: string, k = 3): KbHit[] {
  const qTokens = Array.from(new Set(tokenize(query)));
  if (!qTokens.length || !index.total) return [];

  const scores = new Map<string, number>();
  for (const t of qTokens) {
    const posting = index.postings.get(t);
    if (!posting) continue;
    const df = index.df.get(t) ?? 1;
    const idf = Math.log(1 + index.total / df);
    for (const [docId, { tf }] of posting) {
      const len = index.docs.find((d) => d.id === docId)?.length ?? 1;
      const norm = tf / (tf + 1.2 * (0.25 + 0.75 * (len / Math.max(1, len))));
      scores.set(docId, (scores.get(docId) ?? 0) + idf * norm);
    }
  }

  return Array.from(scores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, k)
    .map(([id, score]) => {
      const doc = docs.find((d) => d.id === id);
      return {
        id,
        name: doc?.name ?? id,
        score: Math.round(score * 1000) / 1000,
        snippet: makeSnippet(doc?.content ?? '', qTokens),
      };
    });
}

/** 供提示词编译使用：取最相关的若干段节选 */
export function retrieveContext(
  docs: KbDoc[],
  query: string,
  options: { k?: number; maxChars?: number } = {}
): { name: string; snippet: string }[] {
  const { k = 2, maxChars = 600 } = options;
  const usable = docs.filter((d) => d.content && d.content.trim());
  if (!usable.length) return [];
  const index = buildIndex(usable);
  return search(index, usable, query, k).map((h) => ({
    name: h.name,
    snippet: h.snippet.slice(0, maxChars),
  }));
}
