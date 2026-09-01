// 全画面共通：データの読み書き（localStorage）
const STORAGE_KEY = "hozone_foods";

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
