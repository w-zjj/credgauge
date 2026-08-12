// DeepSeek API 客户端
const BALANCE_URL = "https://api.deepseek.com/user/balance";

/**
 * 查询 DeepSeek 账户余额
 * @param {string} apiKey - DeepSeek API Key (sk-xxx)
 * @returns {Promise<{name: string, balance: number, currency: string, available: boolean}>}
 */
export async function getBalance(apiKey) {
  if (!apiKey) throw new Error("Missing DEEPSEEK_API_KEY");

  const res = await fetch(BALANCE_URL, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`DeepSeek API ${res.status}: ${text || res.statusText}`);
  }

  const data = await res.json();
  const b = (data.balance_infos || [])[0] || {};

  return {
    name: "DeepSeek",
    balance: Number(b.total_balance || 0),
    currency: b.currency || "CNY",
    available: data.is_available ?? true,
  };
}
