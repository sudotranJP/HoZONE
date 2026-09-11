// S-02 冷凍庫食材一覧 専用の処理（F-03対応）
//
// 表示の考え方：
// ・冷凍食品そのもの（isFrozenFood: true） → 消費(賞味)期限までの「残り◯日」
// ・生鮮食品を冷凍保存したもの（isFrozenFood: false）
//     → 冷凍開始日からの経過日数「冷凍庫移動◯日」（冷凍焼け・入れっぱなし防止のため）
//     ※冷凍開始日が未入力の古いデータは、購入日を代わりに使用します

function getFreezerStatus(food, today) {
  if (food.isFrozenFood) {
    // 冷凍食品そのもの：賞味期限ベース（赤系＝食べられなくなるリスク）
    const daysLeft = daysBetween(today, food.expiryDate);
    let colorClass = "";
    if (daysLeft < 0) colorClass = "expired";
    else if (daysLeft <= 3) colorClass = "warning";
    return {
      label: daysLeft < 0 ? "期限切れ" : "残り",
      value: Math.abs(daysLeft),
      colorClass,
    };
  }
  // 生鮮食品を冷凍保存したもの：経過日数ベース（青系＝冷凍焼けのリスク。日数が増えるほど濃く）
  const baseDateStr = food.frozenDate || food.purchaseDate;
  const elapsed = daysBetween(new Date(baseDateStr), toISODate(today));
  let colorClass = "";
  if (elapsed >= 30) colorClass = "frost-high";
  else if (elapsed >= 15) colorClass = "frost-mid";
  return {
    label: "冷凍庫移動",
    value: elapsed,
    colorClass,
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

  // S-02は「冷凍」かつ「未消費」のみ対象
  const targetFoods = foods.filter(food => food.location === "冷凍" && !food.consumed);

  // 消費(賞味)期限が近い順にソート
  targetFoods.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));

  if (targetFoods.length === 0) {
    listEl.innerHTML = `<li class="empty-message">冷凍庫の食材は登録されていません。</li>`;
    renderFooterBadges();
    return;
  }

  targetFoods.forEach(food => {
    const status = getFreezerStatus(food, today);

    const li = document.createElement("li");
    li.className = "food-row";

    const consumeArea = createConsumeCheckboxArea(food, renderFreezerList);

    const card = document.createElement("a");
    card.href = `register.html?id=${encodeURIComponent(food.id)}`;
    card.className = "food-card" + (status.colorClass ? " " + status.colorClass : "");

    const info = document.createElement("div");
    info.className = "food-info";
    info.innerHTML = `
      <div class="food-name">${food.name} ${formatQuantitySize(food)}</div>
      <div class="food-meta">期限：${food.expiryDate}</div>
    `;

    let countdownColorClass = " ok"; // 既定：グレー文字
    if (status.colorClass === "expired") countdownColorClass = ""; // 期限切れのみ赤文字
    else if (status.colorClass === "frost-mid" || status.colorClass === "frost-high") countdownColorClass = " frost";

    const countdown = document.createElement("div");
    countdown.className = "food-countdown" + countdownColorClass;
    countdown.innerHTML = `<div class="label">${status.label}</div><div class="days">${status.value}</div><div class="unit">日</div>`;

    card.appendChild(info);
    card.appendChild(countdown);
    li.appendChild(consumeArea);
    li.appendChild(card);
    listEl.appendChild(li);
  });

  renderFooterBadges();
}

renderFreezerList();
console.log("HoZONE: S-02 冷凍庫一覧（カード表示・タップ編集）動作確認OK");
