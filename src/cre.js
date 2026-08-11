#!/usr/bin/env node
// `cre` 简写命令：直接启动桌面挂件
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { loadEnv } from "./env.js";

loadEnv();

const __dirname = dirname(fileURLToPath(import.meta.url));
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
