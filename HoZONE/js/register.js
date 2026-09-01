// S-03 食材登録・編集画面 専用の処理（F-01対応）

const foodForm = document.getElementById("food-form");
const headingEl = document.getElementById("register-heading");
const submitBtn = document.getElementById("submit-btn");

// URLの ?id=xxx を見て、編集対象があるか判定する
const params = new URLSearchParams(window.location.search);
const editId = params.get("id");

let editingFood = null;

if (editId !== null) {
  const foods = loadFoods();
  editingFood = foods.find(f => f.id === editId) || null;
}

if (editingFood) {
  // 編集モード：既存の内容をフォームに反映
  headingEl.textContent = "食材編集";
  submitBtn.textContent = "更新する";
  document.getElementById("food-name").value = editingFood.name;
  document.getElementById("expiry-date").value = editingFood.expiryDate;
  document.getElementById("purchase-date").value = editingFood.purchaseDate;
  document.getElementById("location").value = editingFood.location;
}

foodForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const foods = loadFoods();

  const inputValues = {
    name: document.getElementById("food-name").value,
    expiryDate: document.getElementById("expiry-date").value,
    purchaseDate: document.getElementById("purchase-date").value,
    location: document.getElementById("location").value,
  };

  if (editingFood) {
    // 既存データを更新
    const index = foods.findIndex(f => f.id === editingFood.id);
    foods[index] = { ...foods[index], ...inputValues };
    console.log("HoZONE: 食材編集OK", foods[index]);
  } else {
    // 新規登録
    const newFood = { id: generateFoodId(foods), ...inputValues };
    foods.push(newFood);
    console.log("HoZONE: 食材登録OK", newFood);
  }

  saveFoods(foods);

  // 完了後はホーム画面（S-01）に戻る
  window.location.href = "index.html";
});
