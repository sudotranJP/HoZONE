// 全画面共通：データの読み書き（localStorage）
const STORAGE_KEY = "hozone_foods";

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

// Dateオブジェクトを "YYYY-MM-DD" 形式の文字列に変換（daysBetweenの引数用）
function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// 2つの日付文字列の間の経過日数（target - base）
function daysBetween(baseDate, targetDateStr) {
  const target = new Date(targetDateStr);
  const targetOnly = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const diffMs = targetOnly - baseDate;
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

// 初回アクセス時の仮データ（保存データが無い場合のみ使用）
// id は編集機能のために各食材を一意に識別するためのもの
const seedFoods = [
  { id: "1", name: "牛乳",     location: "冷蔵", purchaseDate: "2026-07-10", expiryDate: "2026-07-17" },
  { id: "2", name: "食パン",   location: "常温", purchaseDate: "2026-07-12", expiryDate: "2026-07-16" },
  { id: "3", name: "卵",       location: "冷蔵", purchaseDate: "2026-07-05", expiryDate: "2026-07-25" },
  { id: "4", name: "冷凍餃子", location: "冷凍", purchaseDate: "2026-07-01", expiryDate: "2026-12-01" },
  { id: "5", name: "バナナ",   location: "常温", purchaseDate: "2026-07-13", expiryDate: "2026-07-15" },
];

// 保存されている食材データを取得する
function loadFoods() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === null) {
    saveFoods(seedFoods);
    return seedFoods;
  }
  try {
    const foods = JSON.parse(raw);

    // マイグレーション：id導入前に保存された古いデータにidを補完する
    let needsResave = false;
    let nextId = foods.reduce((max, f) => Math.max(max, parseInt(f.id, 10) || 0), 0) + 1;
    foods.forEach(food => {
      if (!food.id) {
        food.id = String(nextId);
        nextId++;
        needsResave = true;
      }
    });
    if (needsResave) {
      saveFoods(foods);
      console.log("HoZONE: 古いデータにidを補完しました");
    }

    return foods;
  } catch (e) {
    console.error("HoZONE: 保存データの読み込みに失敗", e);
    return [];
  }
}

// 食材データを保存する
function saveFoods(foods) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(foods));
}

// 新規登録用のID発行（既存の最大id+1）
function generateFoodId(foods) {
  const maxId = foods.reduce((max, f) => Math.max(max, parseInt(f.id, 10) || 0), 0);
  return String(maxId + 1);
}

// 食材を消費済み／未消費に切り替える（元に戻すボタン用にconsumed:falseも受け付ける）
function setFoodConsumed(id, consumed) {
  const foods = loadFoods();
  const index = foods.findIndex(f => f.id === id);
  if (index === -1) return;
  foods[index].consumed = consumed;
  foods[index].consumedDate = consumed ? toISODate(getToday()) : "";
  saveFoods(foods);
}

// チェックのタップから実際に反映するまでの猶予時間（誤操作の取り消しを可能にするため）
const CONSUME_UNDO_DELAY_MS = 3000;

// 食材を完全に削除する（消費済み画面からの手動削除用）
function deleteFood(id) {
  const foods = loadFoods();
  saveFoods(foods.filter(f => f.id !== id));
}

// 「（数量：4、大きさ：中）」のような表示テキストを組み立てる
// サイズ未設定の場合は数量のみ表示する
function formatQuantitySize(food) {
  const quantity = food.quantity || 1;
  return food.size
    ? `（数量：${quantity}　大きさ：${food.size}）`
    : `（数量：${quantity}）`;
}

// ===== 並べ替え設定（S-01・S-02共通） =====
const SORT_ORDER_KEY = "hozone_sort_order";

// 選択中の並べ替え順を取得する（未設定時は消費(賞味)期限順）
function getSortOrder() {
  return localStorage.getItem(SORT_ORDER_KEY) || "expiry";
}

function setSortOrder(value) {
  localStorage.setItem(SORT_ORDER_KEY, value);
}

// 並べ替え順に応じて食材配列をソートする（元の配列は変更しない）
function sortFoodsByOrder(foods, sortOrder) {
  const sorted = [...foods];
  if (sortOrder === "purchase") {
    // 購入日が古い順（見落とし・放置防止のため、古いものから気づけるように）
    sorted.sort((a, b) => new Date(a.purchaseDate) - new Date(b.purchaseDate));
  } else {
    // 既定：消費(賞味)期限が近い順
    sorted.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
  }
  return sorted;
}

// 並べ替えのselect要素に、保存済みの選択状態を反映し、変更時の処理を登録する
function setupSortSelect(onChange) {
  const selectEl = document.getElementById("sort-select");
  if (!selectEl) return;
  selectEl.value = getSortOrder();
  selectEl.addEventListener("change", () => {
    setSortOrder(selectEl.value);
    onChange();
  });
}

// 消費チェック用のUI部品（チェックボックス＋取り消しボタン）を生成する
// タップ後すぐには反映せず、CONSUME_UNDO_DELAY_MSの間だけ「取消」を出して猶予を持たせる
// onCommit: 猶予時間が過ぎて実際に確定した後に呼ばれる（一覧の再描画など）
function createConsumeCheckboxArea(food, onCommit) {
  const wrap = document.createElement("div");
  wrap.className = "consume-area";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "consume-checkbox";
  checkbox.title = "消費済みにする";

  const undoBtn = document.createElement("button");
  undoBtn.type = "button";
  undoBtn.className = "undo-btn";
  undoBtn.textContent = "取消";
  undoBtn.hidden = true;

  let timerId = null;

  checkbox.addEventListener("change", () => {
    if (!checkbox.checked) return;

    checkbox.hidden = true;
    undoBtn.hidden = false;
    const row = wrap.closest("li");
    if (row) row.classList.add("pending-consume");

    timerId = setTimeout(() => {
      setFoodConsumed(food.id, true);
      onCommit();
    }, CONSUME_UNDO_DELAY_MS);
  });

  undoBtn.addEventListener("click", () => {
    clearTimeout(timerId);
    checkbox.checked = false;
    checkbox.hidden = false;
    undoBtn.hidden = true;
    const row = wrap.closest("li");
    if (row) row.classList.remove("pending-consume");
  });

  wrap.appendChild(checkbox);
  wrap.appendChild(undoBtn);
  return wrap;
}

// ===== 期限通知（F-04）=====
// ブラウザのNotification APIを使用。閉じている間は通知できないため、
// 「アプリ（サイト）を開いた時にその場でチェックして通知する」方式で実装している。
// 対象：消費(賞味)期限の2日前・当日（本来のワイヤーフレームの「17時」は、
// 開いたタイミングでのチェックのため厳密には再現できない）
const NOTIFY_LAST_KEY = "hozone_last_notified_date";

// 通知対象（2日前 or 当日）の食材一覧を返す
function getExpiringFoods(foods, today) {
  return foods.filter(food => {
    if (food.consumed || !food.expiryDate) return false;
    const daysLeft = daysBetween(today, food.expiryDate);
    return daysLeft === 2 || daysLeft === 0;
  });
}

// 通知条件を満たす食材があれば、ブラウザ通知を表示する（1日1回まで）
function maybeShowExpiryNotification() {
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  const today = getToday();
  const todayISO = toISODate(today);

  // 同じ日にすでに通知済みなら出さない（開くたびに何度も出るのを防ぐ）
  if (localStorage.getItem(NOTIFY_LAST_KEY) === todayISO) return;

  const foods = loadFoods();
  const targets = getExpiringFoods(foods, today);
  if (targets.length === 0) return;

  const names = targets.map(f => f.name).join("、");
  new Notification("HoZONE：期限が近い食材があります", {
    body: `${names} の消費(賞味)期限が近づいています。`,
  });

  localStorage.setItem(NOTIFY_LAST_KEY, todayISO);
}

// 全画面共通：読み込み時に通知チェックを行う
maybeShowExpiryNotification();

// ===== フッターナビの件数バッジ =====
// 常温・冷蔵（S-01対象）と冷凍庫（S-02対象）それぞれについて、
// 「要注意」な食材の件数を数える
// ・常温・冷蔵：残り3日以内 or 期限切れ
// ・冷凍庫：残り3日以内/期限切れ（冷凍食品そのもの） or 冷凍焼けリスク（15日以上）
function countUrgentFoods() {
  const today = getToday();
  const foods = loadFoods().filter(f => !f.consumed);

  let homeCount = 0;
  let freezerCount = 0;

  foods.forEach(food => {
    if (food.location === "冷凍") {
      if (food.isFrozenFood) {
        const daysLeft = daysBetween(today, food.expiryDate);
        if (daysLeft <= 3) freezerCount++;
      } else {
        const baseDateStr = food.frozenDate || food.purchaseDate;
        const elapsed = daysBetween(new Date(baseDateStr), toISODate(today));
        if (elapsed >= 15) freezerCount++;
      }
    } else {
      const daysLeft = daysBetween(today, food.expiryDate);
      if (daysLeft <= 3) homeCount++;
    }
  });

  return { home: homeCount, freezer: freezerCount };
}

// フッターのリンクに件数バッジを付ける（0件の時はバッジを消す）
function setNavBadge(linkEl, count) {
  let badge = linkEl.querySelector(".nav-badge");
  if (count > 0) {
    if (!badge) {
      badge = document.createElement("span");
      badge.className = "nav-badge";
      linkEl.appendChild(badge);
    }
    badge.textContent = count;
  } else if (badge) {
    badge.remove();
  }
}

function renderFooterBadges() {
  const counts = countUrgentFoods();
  document.querySelectorAll('footer a[href="index.html"]').forEach(el => setNavBadge(el, counts.home));
  document.querySelectorAll('footer a[href="freezer.html"]').forEach(el => setNavBadge(el, counts.freezer));
}

renderFooterBadges();
