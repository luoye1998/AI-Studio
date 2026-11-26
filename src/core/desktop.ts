/**
 * 桌面能力桥接
 * 浏览器里 window.workstream 不存在，所有方法自动降级，不报错。
 */

interface DesktopBridge {
  isDesktop: true;
  platform: string;
  pickFolder: () => Promise<string | null>;
  saveFile: (p: { defaultName: string; content: string; encoding?: string }) => Promise<string | null>;
  openFile: () => Promise<string | null>;
  appInfo: () => Promise<{ version: string; platform: string; electron: string }>;
}

declare global {
  interface Window {
    workstream?: DesktopBridge;
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

export async function appInfo() {
  if (window.workstream) return window.workstream.appInfo();
  return { version: '0.1.0', platform: 'web', electron: '-' };
}
