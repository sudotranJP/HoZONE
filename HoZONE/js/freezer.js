// S-02 冷凍庫食材一覧 専用の処理（F-03対応）
//
// 表示の考え方：
// ・冷凍食品そのもの（isFrozenFood: true） → 消費(賞味)期限までの「残り◯日」
// ・生鮮食品を冷凍保存したもの（isFrozenFood: false）
//     → 冷凍開始日からの経過日数「冷凍庫移動◯日」（冷凍焼け・入れっぱなし防止のため）
//     ※冷凍開始日が未入力の古いデータは、購入日を代わりに使用します

function getFreezerStatus(food, today) {
  if (food.isFrozenFood) {
    const daysLeft = daysBetween(today, food.expiryDate);
    return {
      label: daysLeft < 0 ? "期限切れ" : "残り",
      value: Math.abs(daysLeft),
      isAlert: daysLeft < 0,
    };
  }
  // 冷凍庫に入れてからの経過日数（冷凍開始日を基準日、未入力なら購入日で代用）
  const baseDateStr = food.frozenDate || food.purchaseDate;
  const elapsed = daysBetween(new Date(baseDateStr), toISODate(today));
  return {
    label: "冷凍庫移動",
    value: elapsed,
    isAlert: elapsed >= 30, // 冷凍焼けの目安として30日以上は強調表示
  };
}

function renderTodayDate(today) {
  const dateEl = document.getElementById("today-date");
  if (dateEl) {
    dateEl.textContent = `今日：${formatDateJP(today)}`;
  }
}

function renderFreezerList() {
  const today = getToday();
  renderTodayDate(today);

  const foods = loadFoods();
  const listEl = document.getElementById("freezer-list");
  listEl.innerHTML = "";

  // S-02は「冷凍」のみ対象
  const targetFoods = foods.filter(food => food.location === "冷凍");

  // 消費(賞味)期限が近い順にソート
  targetFoods.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));

  targetFoods.forEach(food => {
    const status = getFreezerStatus(food, today);

    const li = document.createElement("li");

    const card = document.createElement("a");
    card.href = `register.html?id=${encodeURIComponent(food.id)}`;
    card.className = "food-card" + (status.isAlert ? " expired" : "");

    const info = document.createElement("div");
    info.className = "food-info";
    info.innerHTML = `
      <div class="food-name">${food.name}</div>
      <div class="food-meta">期限：${food.expiryDate}</div>
    `;

    const countdown = document.createElement("div");
    countdown.className = "food-countdown" + (status.isAlert ? "" : " ok");
    countdown.innerHTML = `<div class="label">${status.label}</div><div class="days">${status.value}</div><div class="unit">日</div>`;

    card.appendChild(info);
    card.appendChild(countdown);
    li.appendChild(card);
    listEl.appendChild(li);
  });
}

renderFreezerList();
console.log("HoZONE: S-02 冷凍庫一覧（カード表示・タップ編集）動作確認OK");
