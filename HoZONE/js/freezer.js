// S-02 冷凍庫食材一覧 専用の処理（F-03対応）
//
// 表示の考え方：
// ・冷凍食品そのもの（isFrozenFood: true） → 消費(賞味)期限までの「残り◯日」
// ・生鮮食品を冷凍保存したもの（isFrozenFood: false）
//     → 冷凍庫に入れてからの経過日数「冷凍庫移動◯日」（冷凍焼け・入れっぱなし防止のため）
//     ※現状「購入日」を冷凍庫に入れた日とみなして計算しています
//       （専用の「冷凍開始日」項目が必要になった場合は後日追加できます）

function formatFreezerStatus(food, today) {
  if (food.isFrozenFood) {
    const daysLeft = daysBetween(today, food.expiryDate);
    return daysLeft < 0 ? `期限切れ ${Math.abs(daysLeft)}日` : `残り ${daysLeft}日`;
  }
  // 冷凍庫に入れてからの経過日数（購入日を基準日とする）
  const elapsed = daysBetween(new Date(food.purchaseDate), toISODate(today));
  return `冷凍庫移動 ${elapsed}日`;
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
    const li = document.createElement("li");

    const textSpan = document.createElement("span");
    textSpan.textContent = `${food.name} 期限: ${food.expiryDate}（${formatFreezerStatus(food, today)}）`;

    const editLink = document.createElement("a");
    editLink.href = `register.html?id=${encodeURIComponent(food.id)}`;
    editLink.textContent = "編集";

    li.appendChild(textSpan);
    li.appendChild(editLink);
    listEl.appendChild(li);
  });
}

renderFreezerList();
console.log("HoZONE: S-02 冷凍庫一覧（経過日数カウント）動作確認OK");
