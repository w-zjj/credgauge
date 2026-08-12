#!/usr/bin/env node
// Silent launcher entry: skip interactive setup, launch widget directly.
// Used by start.vbs / autostart. No console window should appear.
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { loadEnv } from "./env.js";
// electron package's main export is the absolute path to electron.exe
import electronPath from "electron";

loadEnv();

const __dirname = dirname(fileURLToPath(import.meta.url));
const mainFile = join(__dirname, "widget", "main.js");

// Spawn electron.exe directly (shell:false avoids a cmd window;
// windowsHide + stdio:ignore keep it fully backgrounded).
const child = spawn(electronPath, [mainFile], {
  stdio: "ignore",
  shell: false,
  windowsHide: true,
  detached: true,
});

child.on("error", () => process.exit(1));
child.unref();
