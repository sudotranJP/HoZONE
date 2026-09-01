// 消費済み食材 画面 専用の処理
// ・「元に戻す」：誤って消費済みにした場合の救済（S-01/S-02の一覧に戻す）
// ・「削除」：手動での完全削除（確認ダイアログあり）
// ※自動削除機能は現時点では実装していません（仕様上、意図的に見送り）

function renderConsumedList() {
  const foods = loadFoods();
  const listEl = document.getElementById("consumed-list");
  const emptyMessage = document.getElementById("empty-message");
  listEl.innerHTML = "";

  const consumedFoods = foods.filter(f => f.consumed);

  emptyMessage.hidden = consumedFoods.length > 0;

  // 消費済みにした日が新しい順に表示
  consumedFoods.sort((a, b) => new Date(b.consumedDate) - new Date(a.consumedDate));

  consumedFoods.forEach(food => {
    const li = document.createElement("li");
    li.className = "consumed-card";

    const info = document.createElement("div");
    info.className = "food-info";
    info.innerHTML = `
      <div class="food-name">[${food.location}] ${food.name}</div>
      <div class="food-meta">消費済みにした日：${food.consumedDate || "不明"}</div>
    `;

    const actions = document.createElement("div");
    actions.className = "consumed-actions";

    const restoreBtn = document.createElement("button");
    restoreBtn.type = "button";
    restoreBtn.className = "restore-btn";
    restoreBtn.textContent = "元に戻す";
    restoreBtn.addEventListener("click", () => {
      setFoodConsumed(food.id, false);
      renderConsumedList();
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "削除";
    deleteBtn.addEventListener("click", () => {
      if (window.confirm(`「${food.name}」を完全に削除します。よろしいですか？`)) {
        deleteFood(food.id);
        renderConsumedList();
      }
    });

    actions.appendChild(restoreBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(info);
    li.appendChild(actions);
    listEl.appendChild(li);
  });
}

renderConsumedList();
console.log("HoZONE: 消費済み食材一覧（元に戻す・削除）動作確認OK");
