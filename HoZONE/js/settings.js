// S-05 設定画面 専用の処理（F-07：データのバックアップ/復元）

const exportBtn = document.getElementById("export-btn");
const importBtn = document.getElementById("import-btn");
const importFileInput = document.getElementById("import-file-input");

// データのエクスポート：現在の食材データをJSONファイルとしてダウンロード
exportBtn.addEventListener("click", () => {
  const foods = loadFoods();
  const json = JSON.stringify(foods, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const dateStr = toISODate(getToday()).replace(/-/g, "");
  const a = document.createElement("a");
  a.href = url;
  a.download = `hozone_backup_${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  console.log("HoZONE: データをエクスポートしました", foods.length, "件");
});

// データのインポート：ファイル選択ダイアログを開く
importBtn.addEventListener("click", () => {
  importFileInput.click();
});

// 選択されたファイルを読み込み、現在のデータと置き換える
importFileInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  event.target.value = ""; // 同じファイルを連続で選び直せるようにリセット
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    let imported;
    try {
      imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) {
        throw new Error("バックアップファイルの形式が正しくありません（配列ではありません）");
      }
    } catch (err) {
      console.error("HoZONE: インポート失敗", err);
      window.alert("ファイルの読み込みに失敗しました。正しいバックアップファイル（.json）か確認してください。");
      return;
    }

    const currentCount = loadFoods().length;
    const confirmed = window.confirm(
      `現在のデータ（${currentCount}件）を、このバックアップファイルの内容（${imported.length}件）で置き換えます。\nこの操作は元に戻せません。よろしいですか？`
    );
    if (!confirmed) return;

    saveFoods(imported);
    window.alert("データを復元しました。");
    window.location.href = "index.html";
  };
  reader.onerror = () => {
    window.alert("ファイルの読み込み中にエラーが発生しました。");
  };
  reader.readAsText(file);
});
