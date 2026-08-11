#!/usr/bin/env node

import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { getBalance, version } from "./index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const args = process.argv.slice(2);
const cmd = args[0];

function help() {
  console.log(`credgauge v${version} - DeepSeek 余额监控

Usage:
  credgauge balance          查询一次余额并打印
  credgauge widget           启动桌面挂件（需 Electron）
  credgauge -v, --version    显示版本
  credgauge -h, --help       显示帮助

环境变量:
  DEEPSEEK_API_KEY          DeepSeek API Key (sk-xxx)

示例:
  $env:DEEPSEEK_API_KEY="sk-xxx"; credgauge balance
`);
}

async function cmdBalance() {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    console.error("错误: 未设置 DEEPSEEK_API_KEY 环境变量");
    console.error("获取 Key: https://platform.deepseek.com");
    process.exit(1);
  }
  try {
    const data = await getBalance(apiKey);
    console.log(`可用: ${data.isAvailable ? "是" : "否"}`);
    for (const b of data.balances) {
      const sym = b.currency === "CNY" ? "¥" : b.currency === "USD" ? "$" : "";
      console.log(
        `${b.currency}  总额 ${sym}${b.total.toFixed(2)}  赠金 ${sym}${b.granted.toFixed(2)}  充值 ${sym}${b.toppedUp.toFixed(2)}`
      );
    }
  } catch (e) {
    console.error("查询失败:", e.message);
    process.exit(1);
  }
}

function cmdWidget() {
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

if (cmd === "balance") {
  cmdBalance();
} else if (cmd === "widget") {
  cmdWidget();
} else {
  console.error(`未知命令: ${cmd}`);
  help();
  process.exit(1);
}
