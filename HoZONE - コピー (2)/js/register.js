// S-03 食材登録・編集画面 専用の処理（MU-01対応）

const foodForm = document.getElementById("food-form");
foodForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const newFood = {
    name: document.getElementById("food-name").value,
    expiryDate: document.getElementById("expiry-date").value,
    purchaseDate: document.getElementById("purchase-date").value,
    location: document.getElementById("location").value,
  };

  const foods = loadFoods();
  foods.push(newFood);
  saveFoods(foods);

  console.log("HoZONE: 食材登録OK", newFood);

  // 登録後はホーム画面（S-01）に戻る
  window.location.href = "index.html";
});
