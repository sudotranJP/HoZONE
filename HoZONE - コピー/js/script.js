// S-01 ホーム画面（一覧表示）
// デザインは後回し、機能（表示・並べ替え）の確認が目的
// ※データ保存機能はまだ未実装のため、ここでは仮データを使用

// 仮データ（保存機能が完成するまでのダミー）
// location: "常温" | "冷蔵" | "冷凍"
// ※保存機能（localStorage等）は未実装のため、ページを再読み込みすると消えます（タスク5で対応予定）
let foods = [
  { name: "牛乳",     location: "冷蔵", purchaseDate: "2026-07-10", expiryDate: "2026-07-17" },
  { name: "食パン",   location: "常温", purchaseDate: "2026-07-12", expiryDate: "2026-07-16" },
  { name: "卵",       location: "冷蔵", purchaseDate: "2026-07-05", expiryDate: "2026-07-25" },
  { name: "冷凍餃子", location: "冷凍", purchaseDate: "2026-07-01", expiryDate: "2026-12-01" },
  { name: "バナナ",   location: "常温", purchaseDate: "2026-07-13", expiryDate: "2026-07-15" },
];

function renderFoodList() {
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

// S-03 食材登録フォームの送信処理（MU-01対応）
const foodForm = document.getElementById("food-form");
foodForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const newFood = {
    name: document.getElementById("food-name").value,
    expiryDate: document.getElementById("expiry-date").value,
    purchaseDate: document.getElementById("purchase-date").value,
    location: document.getElementById("location").value,
  };

  foods.push(newFood);
  renderFoodList();
  foodForm.reset();

  console.log("HoZONE: 食材登録OK", newFood);
});

renderFoodList();
console.log("HoZONE: S-01 一覧表示（期限順ソート）動作確認OK");
