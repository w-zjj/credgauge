// ApiNebula 中转站余额查询（基于 New API 系统）
// 接口: GET {baseUrl}/api/user/self
// 需要系统令牌（非 API Key）+ 用户 ID
// quota 字段除以 500000 = ¥ 余额

/**
 * 查询 ApiNebula 账户余额
 * @param {object} opts
 * @param {string} opts.baseUrl - 站点地址，如 https://apinebula.ai
 * @param {string} opts.token - 系统令牌（个人中心生成）
 * @param {string} opts.userId - 用户 ID（个人中心查看）
 * @returns {Promise<{name: string, balance: number, currency: string, available: boolean}>}
 */
export async function getBalance({ baseUrl, token, userId }) {
  if (!token || !userId) {
    throw new Error("Missing APINEBULA_TOKEN 或 APINEBULA_USER_ID");
  }
  const url = `${baseUrl.replace(/\/$/, "")}/api/user/self`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "New-API-User": userId,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`ApiNebula API ${res.status}: ${text || res.statusText}`);
  }

  const data = await res.json();
  if (!data.success) {
    throw new Error(`ApiNebula: ${data.message || "查询失败"}`);
  }

  const quota = Number(data.data?.quota || 0);
  // New API 系统标准：quota / 500000 = 网站额度（¥）
  return {
    name: "ApiNebula",
    balance: quota / 500000,
    currency: "CNY",
    available: quota > 0,
  };
}
