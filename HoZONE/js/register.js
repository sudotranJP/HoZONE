// S-03 食材登録・編集画面 専用の処理（F-01, F-03対応）

const foodForm = document.getElementById("food-form");
const headingEl = document.getElementById("register-heading");
const submitBtn = document.getElementById("submit-btn");
const locationSelect = document.getElementById("location");
const frozenFoodField = document.getElementById("frozen-food-field");
const isFrozenFoodCheckbox = document.getElementById("is-frozen-food");

// 保存場所が「冷凍」の時だけ「これは冷凍食品です」チェックを表示する
function updateFrozenFoodFieldVisibility() {
  frozenFoodField.hidden = (locationSelect.value !== "冷凍");
}
locationSelect.addEventListener("change", updateFrozenFoodFieldVisibility);
updateFrozenFoodFieldVisibility();

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
  locationSelect.value = editingFood.location;
  isFrozenFoodCheckbox.checked = !!editingFood.isFrozenFood;
  updateFrozenFoodFieldVisibility();
}

foodForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const foods = loadFoods();

  const inputValues = {
    name: document.getElementById("food-name").value,
    expiryDate: document.getElementById("expiry-date").value,
    purchaseDate: document.getElementById("purchase-date").value,
    location: locationSelect.value,
    // 保存場所が冷凍の時だけ意味を持つ（冷凍食品そのものか、生鮮食品の冷凍保存か）
    isFrozenFood: (locationSelect.value === "冷凍") ? isFrozenFoodCheckbox.checked : false,
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
