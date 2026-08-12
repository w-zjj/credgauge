// 终端交互式配置：引导用户输入凭证并写入 .env
import readline from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ENV_PATH = join(__dirname, "..", ".env");

async function ask(rl, prompt, opts = {}) {
  const answer = (await rl.question(prompt)).trim();
  if (!answer && opts.default) return opts.default;
  return answer;
}

// 读取现有 .env 为键值对象，保留注释行
function parseEnv(content) {
  const lines = content.split(/\r?\n/);
  const kv = {};
  for (const line of lines) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    kv[t.slice(0, eq).trim()] = t.slice(eq + 1).trim();
  }
  return kv;
}

function buildEnv(existing, updates) {
  const keys = [
    "DEEPSEEK_API_KEY",
    "APINEBULA_BASE_URL",
    "APINEBULA_TOKEN",
    "APINEBULA_USER_ID",
  ];
  const merged = { ...existing, ...updates };
  const out = [];
  out.push("# DeepSeek API Key (从 https://platform.deepseek.com 获取)");
  out.push(`DEEPSEEK_API_KEY=${merged.DEEPSEEK_API_KEY || ""}`);
  out.push("");
  out.push("# ApiNebula 中转站配置");
  out.push(`APINEBULA_BASE_URL=${merged.APINEBULA_BASE_URL || "https://apinebula.ai"}`);
  out.push(`APINEBULA_TOKEN=${merged.APINEBULA_TOKEN || ""}`);
  out.push(`APINEBULA_USER_ID=${merged.APINEBULA_USER_ID || ""}`);
  return out.join("\n") + "\n";
}

// 检查是否已配置至少一个 provider
export function isConfigured() {
  const existing = existsSync(ENV_PATH) ? parseEnv(readFileSync(ENV_PATH, "utf-8")) : {};
  const hasDeepSeek = !!existing.DEEPSEEK_API_KEY;
  const hasApiNebula = !!(existing.APINEBULA_TOKEN && existing.APINEBULA_USER_ID);
  return { hasDeepSeek, hasApiNebula, any: hasDeepSeek || hasApiNebula, existing };
}

// 交互式引导配置，返回是否完成配置
export async function runSetup() {
  const { existing, hasDeepSeek, hasApiNebula } = isConfigured();

  console.log("\n=== credgauge 配置 ===\n");

  if (hasDeepSeek && hasApiNebula) {
    console.log("已配置 DeepSeek 和 ApiNebula。\n");
    return true;
  }

  const rl = readline.createInterface({ input: stdin, output: stdout });
  const updates = {};

  try {
    if (!hasDeepSeek) {
      console.log("— DeepSeek —");
      console.log("获取 API Key: https://platform.deepseek.com");
      const key = await ask(rl, "输入 DeepSeek API Key (留空跳过): ");
      if (key) {
        updates.DEEPSEEK_API_KEY = key;
        console.log("✓ DeepSeek 已记录\n");
      } else {
        console.log("→ 跳过 DeepSeek\n");
      }
    }

    if (!hasApiNebula) {
      console.log("— ApiNebula —");
      console.log("控制台: https://apinebula.ai/zh/console");
      console.log("  系统令牌: 个人中心生成（非 API Key）");
      console.log("  用户 ID: F12 控制台执行 JSON.parse(localStorage.getItem('user')).id");
      const token = await ask(rl, "输入 ApiNebula 系统令牌 (留空跳过): ");
      if (token) {
        const userId = await ask(rl, "输入 ApiNebula 用户 ID: ");
        const baseUrl = await ask(rl, "站点地址 [https://apinebula.ai]: ", {
          default: "https://apinebula.ai",
        });
        updates.APINEBULA_TOKEN = token;
        updates.APINEBULA_USER_ID = userId;
        updates.APINEBULA_BASE_URL = baseUrl || "https://apinebula.ai";
        console.log("✓ ApiNebula 已记录\n");
      } else {
        console.log("→ 跳过 ApiNebula\n");
      }
    }

    // 有新输入则写入
    if (Object.keys(updates).length > 0) {
      const newContent = buildEnv(existing, updates);
      writeFileSync(ENV_PATH, newContent, "utf-8");
      console.log("✓ 配置已写入 .env\n");
    }

    // 只要至少有一个服务已配置（原有或新输入），就允许启动
    const hasAny =
      hasDeepSeek ||
      hasApiNebula ||
      updates.DEEPSEEK_API_KEY ||
      updates.APINEBULA_TOKEN;
    if (!hasAny) {
      console.log("未配置任何服务，请稍后重新运行 cre 或手动编辑 .env\n");
      return false;
    }
    return true;
  } finally {
    rl.close();
  }
}
