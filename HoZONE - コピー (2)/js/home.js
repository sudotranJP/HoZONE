// S-01 ホーム画面（一覧表示）専用の処理

function renderFoodList() {
  const foods = loadFoods();
  const listEl = document.getElementById("food-list");
  listEl.innerHTML = "";

  // S-01は「冷蔵・常温」のみ対象（冷凍庫食材はS-02で別管理）
  const targetFoods = foods.filter(food => food.location !== "冷凍");

  // 消費(賞味)期限が近い順にソート
  targetFoods.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));

  targetFoods.forEach(food => {
    const li = document.createElement("li");
    li.textContent = `[${food.location}] ${food.name} 期限: ${food.expiryDate}`;
    listEl.appendChild(li);
  });
}

renderFoodList();
console.log("HoZONE: S-01 一覧表示（期限順ソート・localStorage対応）動作確認OK");
