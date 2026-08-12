// 渲染进程：接收多 provider 余额更新并渲染
const rowsEl = document.getElementById("rows");

function symbol(currency) {
  return currency === "CNY" ? "¥" : currency === "USD" ? "$" : "";
}

function render(payload) {
  if (!payload) return;
  const results = payload.results || [];
  rowsEl.innerHTML = "";

  // 未配置任何 provider
  if (results.length === 0) {
    const hint = document.createElement("div");
    hint.className = "hint";
    hint.textContent = "未配置，请运行 cre";
    rowsEl.appendChild(hint);
    return;
  }

  for (const r of results) {
    const row = document.createElement("div");
    row.className = "row";

    const dot = document.createElement("span");
    dot.className = "dot" + (r.ok && r.available ? "" : " err");

    const name = document.createElement("span");
    name.className = "name";
    name.textContent = r.name;

    const val = document.createElement("span");
    val.className = "val";
    val.textContent = r.ok ? `${symbol(r.currency)}${r.balance.toFixed(2)}` : "--";

    row.append(dot, name, val);
    rowsEl.appendChild(row);
  }
}

window.credgauge.onUpdate(render);

document.getElementById("close-btn").addEventListener("click", () => {
  window.credgauge.close();
});
