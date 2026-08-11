// preload: 暴露安全的 IPC 桥给渲染进程
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("credgauge", {
  onUpdate: (cb) => {
    const listener = (_e, payload) => cb(payload);
    ipcRenderer.on("balance:update", listener);
    return () => ipcRenderer.removeListener("balance:update", listener);
  },
  refresh: () => ipcRenderer.send("widget:refresh"),
  close: () => ipcRenderer.send("widget:close"),
});
