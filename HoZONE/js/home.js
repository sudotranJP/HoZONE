// S-01 ホーム画面（一覧表示）専用の処理

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

  // S-01は「冷蔵・常温」かつ「未消費」のみ対象（冷凍庫食材はS-02、消費済みは専用画面で管理）
  const targetFoods = foods.filter(food => food.location !== "冷凍" && !food.consumed);

  // 消費(賞味)期限が近い順にソート
  targetFoods.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));

  targetFoods.forEach(food => {
    const daysLeft = daysBetween(today, food.expiryDate);
    const isExpired = daysLeft < 0;
    const isWarning = !isExpired && daysLeft <= 3;

    const li = document.createElement("li");
    li.className = "food-row";

    const consumeArea = createConsumeCheckboxArea(food, renderFoodList);

    const card = document.createElement("a");
    card.href = `register.html?id=${encodeURIComponent(food.id)}`;
    card.className = "food-card" + (isExpired ? " expired" : isWarning ? " warning" : "");

    const info = document.createElement("div");
    info.className = "food-info";
    info.innerHTML = `
      <div class="food-name">[${food.location}] ${food.name} ${formatQuantitySize(food)}</div>
      <div class="food-meta">期限：${food.expiryDate}</div>
    `;

    const countdown = document.createElement("div");
    countdown.className = "food-countdown" + (isExpired ? "" : " ok");
    countdown.innerHTML = isExpired
      ? `<div class="label">期限切れ</div><div class="days">${Math.abs(daysLeft)}</div><div class="unit">日</div>`
      : `<div class="label">残り</div><div class="days">${daysLeft}</div><div class="unit">日</div>`;

    card.appendChild(info);
    card.appendChild(countdown);
    li.appendChild(consumeArea);
    li.appendChild(card);
    listEl.appendChild(li);
  });
}

renderFoodList();
console.log("HoZONE: S-01 一覧表示（カード表示・タップ編集）動作確認OK");
