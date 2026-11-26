'use strict';

const { contextBridge, ipcRenderer } = require('electron');

// 只暴露必要能力；网页版没有 window.workstream 时自动走浏览器降级路径
contextBridge.exposeInMainWorld('workstream', {
  isDesktop: true,
  platform: process.platform,
  pickFolder: () => ipcRenderer.invoke('ws:pickFolder'),
  saveFile: (payload) => ipcRenderer.invoke('ws:saveFile', payload),
  openFile: () => ipcRenderer.invoke('ws:openFile'),
  appInfo: () => ipcRenderer.invoke('ws:appInfo'),
});
