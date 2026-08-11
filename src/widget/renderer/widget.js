// 渲染进程：接收余额更新并渲染 UI
const el = {
  status: document.getElementById("status"),
  total: document.getElementById("total"),
  sub: document.getElementById("sub"),
  time: document.getElementById("time"),
};

function fmtTime(ts) {
  const d = new Date(ts);
  const p = (n) => String(n).padStart(2, "0");
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

function render(payload) {
  if (!payload) return;
  el.time.textContent = fmtTime(payload.ts);

  if (!payload.ok) {
    el.status.classList.add("err");
    el.status.textContent = "●";
    el.total.textContent = "--";
    el.sub.textContent = payload.error || "查询失败";
    return;
  }

  const { isAvailable, balances } = payload.data;
  el.status.classList.toggle("err", !isAvailable);
  el.status.title = isAvailable ? "可用" : "不可用";

  if (balances.length === 0) {
    el.total.textContent = "0";
    el.sub.textContent = "无余额信息";
    return;
  }

  const b = balances[0];
  const symbol = b.currency === "CNY" ? "¥" : b.currency === "USD" ? "$" : "";
  el.total.textContent = `${symbol}${b.total.toFixed(2)}`;
  el.sub.textContent = `赠金 ${symbol}${b.granted.toFixed(2)} · 充值 ${symbol}${b.toppedUp.toFixed(2)}`;
}

window.credgauge.onUpdate(render);

document.getElementById("refresh-btn").addEventListener("click", () => {
  window.credgauge.refresh();
});
document.getElementById("close-btn").addEventListener("click", () => {
  window.credgauge.close();
});
