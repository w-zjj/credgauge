// 渲染进程：接收余额更新并渲染 UI
const el = {
  status: document.getElementById("status"),
  total: document.getElementById("total"),
};

function render(payload) {
  if (!payload) return;

  if (!payload.ok) {
    el.status.classList.add("err");
    el.total.textContent = "--";
    return;
  }

  const { isAvailable, balances } = payload.data;
  el.status.classList.toggle("err", !isAvailable);

  if (balances.length === 0) {
    el.total.textContent = "0";
    return;
  }

  const b = balances[0];
  const symbol = b.currency === "CNY" ? "¥" : b.currency === "USD" ? "$" : "";
  el.total.textContent = `${symbol}${b.total.toFixed(2)}`;
}

window.credgauge.onUpdate(render);

document.getElementById("close-btn").addEventListener("click", () => {
  window.credgauge.close();
});
