#!/usr/bin/env node

import { spawn, execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { existsSync, mkdirSync } from "node:fs";
import { loadEnv } from "./env.js";
import { runSetup } from "./setup.js";
import { getDeepSeekBalance, getApiNebulaBalance, version } from "./index.js";

loadEnv();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const args = process.argv.slice(2);
const cmd = args[0];

function help() {
  console.log(`credgauge v${version} - AI 服务余额监控

Usage:
  credgauge deepseek            查询 DeepSeek 余额
  credgauge apinebula           查询 ApiNebula 余额
  credgauge all                 查询所有已配置的服务
  credgauge widget              启动桌面挂件（需 Electron）
  cre                           启动桌面挂件（简写）
  credgauge autostart on        开启开机自启
  credgauge autostart off       关闭开机自启
  credgauge autostart status    查看开机自启状态
  credgauge -v, --version      显示版本
  credgauge -h, --help         显示帮助

启动方式:
  双击 start.vbs                静默启动挂件（无终端窗口）
  cre / credgauge widget        终端启动挂件（首次可交互配置）

环境变量 (.env):
  DEEPSEEK_API_KEY             DeepSeek API Key
  APINEBULA_BASE_URL           ApiNebula 站点地址
  APINEBULA_TOKEN              ApiNebula 系统令牌
  APINEBULA_USER_ID            ApiNebula 用户 ID
`);
}

function printResult(r) {
  const sym = r.currency === "CNY" ? "¥" : r.currency === "USD" ? "$" : "";
  const status = r.available ? "可用" : "不可用";
  console.log(`${r.name}  ${status}  ${sym}${r.balance.toFixed(2)}`);
}

async function cmdDeepSeek() {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    console.error("错误: 未设置 DEEPSEEK_API_KEY");
    process.exit(1);
  }
  try {
    printResult(await getDeepSeekBalance(apiKey));
  } catch (e) {
    console.error("查询失败:", e.message);
    process.exit(1);
  }
}

async function cmdApiNebula() {
  const token = process.env.APINEBULA_TOKEN;
  const userId = process.env.APINEBULA_USER_ID;
  if (!token || !userId) {
    console.error("错误: 未设置 APINEBULA_TOKEN 或 APINEBULA_USER_ID");
    process.exit(1);
  }
  try {
    printResult(
      await getApiNebulaBalance({
        baseUrl: process.env.APINEBULA_BASE_URL || "https://apinebula.ai",
        token,
        userId,
      })
    );
  } catch (e) {
    console.error("查询失败:", e.message);
    process.exit(1);
  }
}

async function cmdAll() {
  const tasks = [];
  if (process.env.DEEPSEEK_API_KEY) tasks.push(cmdDeepSeek().catch((e) => console.error("DeepSeek:", e.message)));
  if (process.env.APINEBULA_TOKEN) tasks.push(cmdApiNebula().catch((e) => console.error("ApiNebula:", e.message)));
  if (tasks.length === 0) {
    console.error("未配置任何服务，请编辑 .env");
    process.exit(1);
  }
  await Promise.all(tasks);
}

async function cmdWidget() {
  // 启动前检查配置，未配置则交互式引导
  const configured = await runSetup();
  if (!configured) {
    console.log("未完成配置，请稍后重新运行或手动编辑 .env");
    return;
  }
  loadEnv();
  const electronPath = join(__dirname, "..", "node_modules", ".bin", "electron");
  const mainFile = join(__dirname, "widget", "main.js");
  const child = spawn(electronPath, [mainFile], {
    stdio: "inherit",
    shell: true,
    env: { ...process.env },
  });
  child.on("error", (e) => {
    console.error("启动挂件失败:", e.message);
    console.error("请先运行: npm install");
    process.exit(1);
  });
  child.on("exit", (code) => process.exit(code ?? 0));
}

// 开机自启：在 Windows 启动文件夹创建/删除 start.vbs 的快捷方式
function getStartupDir() {
  const appData = process.env.APPDATA;
  return join(appData, "Microsoft", "Windows", "Start Menu", "Programs", "Startup");
}
function getShortcutPath() {
  return join(getStartupDir(), "credgauge.lnk");
}
function getVbsPath() {
  return join(__dirname, "..", "start.vbs");
}

function cmdAutostart(sub) {
  const startupDir = getStartupDir();
  const lnkPath = getShortcutPath();
  const vbsPath = getVbsPath();

  if (!existsSync(vbsPath)) {
    console.error("错误: 未找到 start.vbs，请在项目根目录确认文件存在");
    process.exit(1);
  }

  if (sub === "on") {
    if (!existsSync(startupDir)) mkdirSync(startupDir, { recursive: true });
    const ps = `$ws=New-Object -ComObject WScript.Shell; $s=$ws.CreateShortcut('${lnkPath}'); $s.TargetPath='wscript.exe'; $s.Arguments='"${vbsPath}"'; $s.WorkingDirectory='${dirname(vbsPath)}'; $s.WindowStyle=7; $s.Description='credgauge autostart'; $s.Save()`;
    try {
      execSync(`powershell -NoProfile -Command "${ps.replace(/"/g, '\\"')}"`, { stdio: "ignore" });
      console.log("✓ 已开启开机自启");
      console.log("  快捷方式:", lnkPath);
    } catch (e) {
      console.error("开启失败:", e.message);
      process.exit(1);
    }
  } else if (sub === "off") {
    if (existsSync(lnkPath)) {
      try {
        execSync(`powershell -NoProfile -Command "Remove-Item '${lnkPath}' -Force"`, { stdio: "ignore" });
        console.log("✓ 已关闭开机自启");
      } catch (e) {
        console.error("关闭失败:", e.message);
        process.exit(1);
      }
    } else {
      console.log("开机自启未开启，无需关闭");
    }
  } else if (sub === "status") {
    if (existsSync(lnkPath)) {
      console.log("开机自启: 已开启");
      console.log("  快捷方式:", lnkPath);
    } else {
      console.log("开机自启: 未开启");
    }
  } else {
    console.error("用法: credgauge autostart on|off|status");
    process.exit(1);
  }
}

if (cmd === "-v" || cmd === "--version") {
  console.log(`credgauge v${version}`);
  process.exit(0);
}

if (cmd === "-h" || cmd === "--help" || !cmd) {
  help();
  process.exit(0);
}

if (cmd === "deepseek" || cmd === "balance") {
  cmdDeepSeek();
} else if (cmd === "apinebula") {
  cmdApiNebula();
} else if (cmd === "all") {
  cmdAll();
} else if (cmd === "widget") {
  cmdWidget();
} else if (cmd === "autostart") {
  cmdAutostart(args[1]);
} else {
  console.error(`未知命令: ${cmd}`);
  help();
  process.exit(1);
}
