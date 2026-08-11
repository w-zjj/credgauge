// DeepSeek API 客户端封装

const BALANCE_URL = "https://api.deepseek.com/user/balance";

/**
 * 查询 DeepSeek 账户余额
 * @param {string} apiKey - DeepSeek API Key (sk-xxx)
 * @returns {Promise<{isAvailable: boolean, balances: Array<{currency: string, total: number, granted: number, toppedUp: number}>}>}
 */
export async function getBalance(apiKey) {
  if (!apiKey) {
    throw new Error("Missing DEEPSEEK_API_KEY");
  }

  const res = await fetch(BALANCE_URL, {
    method: "GET",
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

  return {
    isAvailable: data.is_available,
    balances: (data.balance_infos || []).map((b) => ({
      currency: b.currency,
      total: Number(b.total_balance),
      granted: Number(b.granted_balance),
      toppedUp: Number(b.topped_up_balance),
    })),
  };
}
