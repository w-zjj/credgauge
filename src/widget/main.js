// Electron 主进程：创建挂件窗口 + 定时轮询多个 AI 服务余额
import { app, BrowserWindow, ipcMain } from "electron";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { loadEnv } from "../env.js";
import { getBalance as getDeepSeekBalance } from "../providers/deepseek.js";
import { getBalance as getApiNebulaBalance } from "../providers/apinebula.js";

loadEnv();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const REFRESH_INTERVAL = 60_000;

let win = null;
let timer = null;

// 并发查询所有已配置的 provider，返回统一格式数组
async function fetchAll() {
  const tasks = [];

  if (process.env.DEEPSEEK_API_KEY) {
    tasks.push(
      getDeepSeekBalance(process.env.DEEPSEEK_API_KEY)
        .then((r) => ({ ...r, ok: true }))
        .catch((e) => ({ name: "DeepSeek", ok: false, error: e.message, balance: 0, currency: "CNY", available: false }))
    );
  }

  if (process.env.APINEBULA_TOKEN && process.env.APINEBULA_USER_ID) {
    tasks.push(
      getApiNebulaBalance({
        baseUrl: process.env.APINEBULA_BASE_URL || "https://apinebula.ai",
        token: process.env.APINEBULA_TOKEN,
        userId: process.env.APINEBULA_USER_ID,
      })
        .then((r) => ({ ...r, ok: true }))
        .catch((e) => ({ name: "ApiNebula", ok: false, error: e.message, balance: 0, currency: "CNY", available: false }))
    );
  }

  return Promise.all(tasks);
}

async function refresh() {
  try {
    const results = await fetchAll();
    win?.webContents.send("balance:update", { results, ts: Date.now() });
  } catch (e) {
    win?.webContents.send("balance:update", {
      results: [],
      error: e.message,
      ts: Date.now(),
    });
  }
}

function createWindow() {
  win = new BrowserWindow({
    width: 170,
    height: 80,
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

  ipcMain.on("widget:close", () => app.quit());
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
