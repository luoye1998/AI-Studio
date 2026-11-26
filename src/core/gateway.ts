import type { Project, ProviderConfig, StageId } from './types';
import { compileStagePrompt, mockGenerate } from './prompt';
import { stageById } from './stages';

export interface GenerationResult {
  content: string;
  source: 'model' | 'mock';
  model?: string;
  latencyMs: number;
  note?: string;
}

/** 取当前可用于文本生成的通道：启用 + 有 baseUrl + 有 key */
export function resolveTextProvider(providers: ProviderConfig[]): ProviderConfig | null {
  return (
    providers.find(
      (p) => p.kind === 'text' && p.enabled && p.baseUrl.trim().length > 0 && (p.apiKey ?? '').trim().length > 0
    ) ?? null
  );
}

const joinUrl = (base: string, path: string) => `${base.replace(/\/+$/, '')}${path}`;

/**
 * 生成一阶段内容。
 * 有可用 OpenAI 兼容通道 → 真实调用；否则 / 失败时 → 本地推演引擎兜底。
 * 这条「双通道」保证没 Key 也能把流程走通，配了 Key 立刻变真。
 */
export async function generateStageContent(
  project: Project,
  stageId: StageId,
  providers: ProviderConfig[],
  opts: { signal?: AbortSignal; timeoutMs?: number } = {}
): Promise<GenerationResult> {
  const started = performance.now();
  const provider = resolveTextProvider(providers);
  const prompt = compileStagePrompt(project, stageId);

  if (!provider) {
    return { content: mockGenerate(project, stageId), source: 'mock', latencyMs: performance.now() - started };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), opts.timeoutMs ?? 90_000);
  const onAbort = () => controller.abort();
  opts.signal?.addEventListener('abort', onAbort);

  try {
    const res = await fetch(joinUrl(provider.baseUrl, '/chat/completions'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${provider.apiKey}`,
      },
      body: JSON.stringify({
        model: provider.model || 'gpt-4o-mini',
        temperature: 0.7,
        messages: [
          {
            role: 'system',
            content:
              '你是资深影视编剧兼导演。严格按用户给定的阶段任务与交付标准输出 Markdown，只输出成稿本身，不解释过程。',
          },
          { role: 'user', content: prompt },
        ],
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status} ${detail.slice(0, 160)}`);
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) throw new Error('返回内容为空');

    return {
      content: `${content}`,
      source: 'model',
      model: provider.model,
      latencyMs: performance.now() - started,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const fallback = mockGenerate(project, stageId);
    return {
      content: fallback,
      source: 'mock',
      latencyMs: performance.now() - started,
      note: `${stageById(stageId).name} 模型调用失败（${message}），已用本地推演兜底`,
    };
  } finally {
    clearTimeout(timeout);
    opts.signal?.removeEventListener('abort', onAbort);
  }
}
