#!/usr/bin/env node
// `cre` 简写命令：启动桌面挂件，未配置时引导交互式配置
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { loadEnv } from "./env.js";
import { runSetup } from "./setup.js";

loadEnv();

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  // 启动前检查配置，未配置则交互式引导
  const configured = await runSetup();
  if (!configured) {
    console.log("未完成配置，请稍后重新运行 cre 或手动编辑 .env");
    return;
  }

  // 重新加载 env（setup 可能写入了新值）
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

main();
