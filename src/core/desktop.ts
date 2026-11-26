/**
 * 桌面能力桥接
 * 浏览器里 window.workstream 不存在，所有方法自动降级，不报错。
 */

interface DesktopBridge {
  isDesktop: true;
  platform: string;
  pickFolder: () => Promise<string | null>;
  readMarkdown: (folder: string) => Promise<{ name: string; content: string }[]>;
  saveFile: (p: { defaultName: string; content: string; encoding?: string }) => Promise<string | null>;
  openFile: () => Promise<string | null>;
  appInfo: () => Promise<{ version: string; platform: string; electron: string }>;
}

declare global {
  interface Window {
    workstream?: DesktopBridge;
    showDirectoryPicker?: (opts?: { mode?: 'read' | 'readwrite' }) => Promise<FileSystemDirectoryHandle>;
  }
}

export const isDesktop = (): boolean => Boolean(window.workstream?.isDesktop);

export async function pickFolder(): Promise<string | null> {
  if (!window.workstream) return null;
  return window.workstream.pickFolder();
}

export async function saveFile(defaultName: string, content: string): Promise<string | null> {
  if (window.workstream) return window.workstream.saveFile({ defaultName, content });
  // 浏览器降级
  const blob = new Blob([content], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = defaultName;
  a.click();
  return defaultName;
}

export async function openProjectFile(): Promise<string | null> {
  if (!window.workstream) return null;
  return window.workstream.openFile();
}

/**
 * 挂载知识库：桌面端走主进程读目录；浏览器端走 File System Access API。
 * 返回文件名 + 正文（已按大小与数量截断）。
 */
export async function mountKnowledgeFolder(): Promise<{
  folder: string;
  docs: { name: string; content: string }[];
} | null> {
  if (window.workstream) {
    const folder = await window.workstream.pickFolder();
    if (!folder) return null;
    const docs = await window.workstream.readMarkdown(folder);
    return { folder, docs };
  }

  if (!window.showDirectoryPicker) return null;
  try {
    const dir = await window.showDirectoryPicker({ mode: 'read' });
    const docs: { name: string; content: string }[] = [];
    const walk = async (handle: FileSystemDirectoryHandle, depth: number) => {
      if (depth > 2 || docs.length >= 200) return;
      const iterable = handle as unknown as { values(): AsyncIterableIterator<FileSystemHandle> };
      for await (const entry of iterable.values()) {
        if (entry.kind === 'directory') {
          await walk(entry as FileSystemDirectoryHandle, depth + 1);
          continue;
        }
        const file = await (entry as FileSystemFileHandle).getFile();
        if (!/\.(md|markdown|txt)$/i.test(file.name) || file.size > 2_000_000) continue;
        docs.push({ name: file.name, content: await file.text() });
      }
    };
    await walk(dir, 0);
    return { folder: dir.name, docs };
  } catch {
    return null;
  }
}

export async function appInfo() {
  if (window.workstream) return window.workstream.appInfo();
  return { version: '0.1.0', platform: 'web', electron: '-' };
}
