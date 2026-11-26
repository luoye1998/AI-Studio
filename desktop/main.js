'use strict';

const { app, BrowserWindow, dialog, ipcMain, shell, Menu } = require('electron');
const path = require('node:path');
const fs = require('node:fs');

const isMac = process.platform === 'darwin';
const devUrl = process.env.WORKSTREAM_DEV_URL;

let win = null;

function createWindow() {
  win = new BrowserWindow({
    width: 1440,
    height: 940,
    minWidth: 1080,
    minHeight: 720,
    backgroundColor: '#07080b',
    show: false,
    title: 'WorkStream Studio',
    titleBarStyle: isMac ? 'hiddenInset' : 'default',
    trafficLightPosition: isMac ? { x: 14, y: 16 } : undefined,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  win.once('ready-to-show', () => win.show());

  if (devUrl) {
    win.loadURL(devUrl);
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    const packaged = path.join(process.resourcesPath || '', 'app', 'index.html');
    const local = path.join(__dirname, '..', 'dist', 'index.html');
    const target = fs.existsSync(packaged) ? packaged : local;
    win.loadFile(target);
  }

  // 外链一律走系统浏览器，不在应用内打开
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
}

const menu = () => {
  const template = [
    ...(isMac
      ? [{
          label: app.name,
          submenu: [
            { role: 'about' },
            { type: 'separator' },
            { role: 'hide' },
            { role: 'hideOthers' },
            { type: 'separator' },
            { role: 'quit' },
          ],
        }]
      : []),
    {
      label: '文件',
      submenu: [
        {
          label: '导出工程（JSON）',
          accelerator: 'CmdOrCtrl+E',
          click: () => win && win.webContents.executeJavaScript('window.__workstream_export && window.__workstream_export()'),
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' },
      ],
    },
    { label: '视图', submenu: [{ role: 'reload' }, { role: 'toggleDevTools' }, { type: 'separator' }, { role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' }, { type: 'separator' }, { role: 'togglefullscreen' }] },
    { label: '窗口', submenu: [{ role: 'minimize' }, { role: 'zoom' }] },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
};

app.whenReady().then(() => {
  createWindow();
  menu();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (!isMac) app.quit();
});

// ---- IPC：让网页版调用系统能力（浏览器版会自动降级） ----

ipcMain.handle('ws:pickFolder', async () => {
  const r = await dialog.showOpenDialog(win, { properties: ['openDirectory'] });
  return r.canceled ? null : r.filePaths[0];
});

ipcMain.handle('ws:saveFile', async (_e, { defaultName, content, encoding = 'utf8' }) => {
  const r = await dialog.showSaveDialog(win, { defaultPath: defaultName });
  if (r.canceled || !r.filePath) return null;
  fs.writeFileSync(r.filePath, content, encoding);
  return r.filePath;
});

ipcMain.handle('ws:openFile', async () => {
  const r = await dialog.showOpenDialog(win, {
    properties: ['openFile'],
    filters: [{ name: 'WorkStream 工程', extensions: ['json'] }],
  });
  if (r.canceled || !r.filePaths[0]) return null;
  return fs.readFileSync(r.filePaths[0], 'utf8');
});

ipcMain.handle('ws:appInfo', () => ({
  version: app.getVersion(),
  platform: process.platform,
  electron: process.versions.electron,
}));
