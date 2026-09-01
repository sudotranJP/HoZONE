// S-01 ホーム画面（一覧表示）専用の処理

// 日付を「年/月/日」の表示用に整形
function formatDateJP(date) {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return `${y}/${m}/${d}`;
}

// 今日の日付（時刻は0時に揃える。日数計算のズレを防ぐため）
function getToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

// 消費(賞味)期限までの残り日数を計算（マイナスなら期限切れ）
function daysUntilExpiry(expiryDateStr, today) {
  const expiry = new Date(expiryDateStr);
  const expiryOnly = new Date(expiry.getFullYear(), expiry.getMonth(), expiry.getDate());
  const diffMs = expiryOnly - today;
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

// 残り日数を表示用テキストに変換
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

    const daysLeft = daysUntilExpiry(food.expiryDate, today);

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
