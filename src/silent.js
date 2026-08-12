#!/usr/bin/env node
// 静默启动入口：跳过交互式配置，直接启动挂件（供 start.vbs / 开机自启使用）
// 未配置的服务会在挂件中显示提示，不会阻塞
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { loadEnv } from "./env.js";

loadEnv();

const __dirname = dirname(fileURLToPath(import.meta.url));
const electronPath = join(__dirname, "..", "node_modules", ".bin", "electron");
const mainFile = join(__dirname, "widget", "main.js");

const child = spawn(electronPath, [mainFile], {
  stdio: "ignore",
  shell: true,
  env: { ...process.env },
  detached: true,
});

child.on("error", () => process.exit(1));
child.unref();
