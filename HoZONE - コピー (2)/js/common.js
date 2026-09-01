// 全画面共通：データの読み書き（localStorage）
// キー名
const STORAGE_KEY = "hozone_foods";

// 初回アクセス時の仮データ（保存データが無い場合のみ使用）
const seedFoods = [
  { name: "牛乳",     location: "冷蔵", purchaseDate: "2026-07-10", expiryDate: "2026-07-17" },
  { name: "食パン",   location: "常温", purchaseDate: "2026-07-12", expiryDate: "2026-07-16" },
  { name: "卵",       location: "冷蔵", purchaseDate: "2026-07-05", expiryDate: "2026-07-25" },
  { name: "冷凍餃子", location: "冷凍", purchaseDate: "2026-07-01", expiryDate: "2026-12-01" },
  { name: "バナナ",   location: "常温", purchaseDate: "2026-07-13", expiryDate: "2026-07-15" },
];

// 保存されている食材データを取得する
function loadFoods() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === null) {
    // 初回はseedFoodsを保存してから返す
    saveFoods(seedFoods);
    return seedFoods;
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error("HoZONE: 保存データの読み込みに失敗", e);
    return [];
  }
}

// 食材データを保存する
function saveFoods(foods) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(foods));
}
