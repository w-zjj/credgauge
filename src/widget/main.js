// Electron 主进程：创建挂件窗口 + 定时轮询 DeepSeek API
import { app, BrowserWindow, ipcMain } from "electron";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { getBalance } from "../client.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const REFRESH_INTERVAL = 60_000; // 60 秒

let win = null;
let timer = null;

// 从环境变量或持久化存储读取 API Key
function getApiKey() {
  return process.env.DEEPSEEK_API_KEY || "";
}

async function refresh() {
  const apiKey = getApiKey();
  if (!apiKey) {
    win?.webContents.send("balance:update", {
      ok: false,
      error: "未配置 API Key",
      ts: Date.now(),
    });
    return;
  }
  try {
    const data = await getBalance(apiKey);
    win?.webContents.send("balance:update", { ok: true, data, ts: Date.now() });
  } catch (e) {
    win?.webContents.send("balance:update", {
      ok: false,
      error: e.message,
      ts: Date.now(),
    });
  }
}

function createWindow() {
  win = new BrowserWindow({
    width: 320,
    height: 200,
    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    show: false,
    webPreferences: {
      preload: join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadFile(join(__dirname, "renderer", "index.html"));
  win.once("ready-to-show", () => {
    win.show();
    refresh();
  });

  // 点击 ⚙ 关闭挂件（简易退出，后续可扩展设置面板）
  ipcMain.on("widget:close", () => {
    app.quit();
  });

  ipcMain.on("widget:refresh", () => refresh());
}

app.whenReady().then(() => {
  createWindow();
  timer = setInterval(refresh, REFRESH_INTERVAL);
});

app.on("window-all-closed", () => {
  if (timer) clearInterval(timer);
  app.quit();
});
