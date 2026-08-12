#!/usr/bin/env node

import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
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
  credgauge -v, --version      显示版本
  credgauge -h, --help         显示帮助

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
} else {
  console.error(`未知命令: ${cmd}`);
  help();
  process.exit(1);
}
