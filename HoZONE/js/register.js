// S-03 食材登録・編集画面 専用の処理（F-01, F-03対応）

const foodForm = document.getElementById("food-form");
const headingEl = document.getElementById("register-heading");
const submitBtn = document.getElementById("submit-btn");
const locationButtons = document.querySelectorAll(".location-btn");
const frozenFoodField = document.getElementById("frozen-food-field");
const isFrozenFoodCheckbox = document.getElementById("is-frozen-food");
const frozenDateField = document.getElementById("frozen-date-field");
const frozenDateInput = document.getElementById("frozen-date");

// 保存場所（常温・冷蔵・冷凍）はボタンで選択する
let selectedLocation = "常温";

function setSelectedLocation(value) {
  selectedLocation = value;
  locationButtons.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.value === value);
  });
  updateFrozenFieldsVisibility();
}

locationButtons.forEach(btn => {
  btn.addEventListener("click", () => setSelectedLocation(btn.dataset.value));
});

// 保存場所・冷凍食品チェックの状態に応じて、関連フィールドの表示を切り替える
function updateFrozenFieldsVisibility() {
  const isFrozenLocation = (selectedLocation === "冷凍");
  frozenFoodField.hidden = !isFrozenLocation;

  // 「冷凍開始日」が必要なのは、非冷凍食品を冷凍保存する場合のみ
  // （冷凍焼け通知のトラッキング対象になるため。冷凍食品そのものはチェックで対象外にできる）
  frozenDateField.hidden = !(isFrozenLocation && !isFrozenFoodCheckbox.checked);
}
isFrozenFoodCheckbox.addEventListener("change", updateFrozenFieldsVisibility);

setSelectedLocation(selectedLocation); // 初期表示

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
  setSelectedLocation(editingFood.location);
  isFrozenFoodCheckbox.checked = !!editingFood.isFrozenFood;
  // 冷凍開始日が未設定の古いデータは購入日を仮表示（後方互換）
  frozenDateInput.value = editingFood.frozenDate || editingFood.purchaseDate || "";
  updateFrozenFieldsVisibility();
}

foodForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const foods = loadFoods();
  const isFrozenLocation = (selectedLocation === "冷凍");
  const isFrozenFood = isFrozenLocation && isFrozenFoodCheckbox.checked;

  const inputValues = {
    name: document.getElementById("food-name").value,
    expiryDate: document.getElementById("expiry-date").value,
    purchaseDate: document.getElementById("purchase-date").value,
    location: selectedLocation,
    // 保存場所が冷凍の時だけ意味を持つ（冷凍食品そのものか、生鮮食品の冷凍保存か）
    isFrozenFood: isFrozenFood,
    // 冷凍庫に入れた日（非冷凍食品を冷凍保存する場合のみ入力。未入力なら購入日を代用）
    frozenDate: (isFrozenLocation && !isFrozenFood)
      ? (frozenDateInput.value || document.getElementById("purchase-date").value)
      : "",
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
