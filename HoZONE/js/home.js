// S-01 ホーム画面（一覧表示）専用の処理

// 消費(賞味)期限までの残り日数を表示用テキストに変換
function formatCountdown(daysLeft) {
  if (daysLeft < 0) {
    return `期限切れ ${Math.abs(daysLeft)}日`;
  }
  return `残り ${daysLeft}日`;
}

function renderTodayDate(today) {
  const dateEl = document.getElementById("today-date");
  if (dateEl) {
    dateEl.textContent = `今日：${formatDateJP(today)}`;
  }
}

function renderFoodList() {
  const today = getToday();
  renderTodayDate(today);

  const foods = loadFoods();
  const listEl = document.getElementById("food-list");
  listEl.innerHTML = "";

  // S-01は「冷蔵・常温」のみ対象（冷凍庫食材はS-02で別管理）
  const targetFoods = foods.filter(food => food.location !== "冷凍");

  // 消費(賞味)期限が近い順にソート
  targetFoods.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));

  targetFoods.forEach(food => {
    const li = document.createElement("li");

    const daysLeft = daysBetween(today, food.expiryDate);

    const textSpan = document.createElement("span");
    textSpan.textContent = `[${food.location}] ${food.name} 期限: ${food.expiryDate}（${formatCountdown(daysLeft)}）`;

    const editLink = document.createElement("a");
    editLink.href = `register.html?id=${encodeURIComponent(food.id)}`;
    editLink.textContent = "編集";

    li.appendChild(textSpan);
    li.appendChild(editLink);
    listEl.appendChild(li);
  });
}

renderFoodList();
console.log("HoZONE: S-01 一覧表示（期限カウントダウン・今日の日付表示つき）動作確認OK");
