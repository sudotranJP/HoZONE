// HoZONE 用のシンプルなService Worker
// 目的：一度開いたことがあれば、電波が無い状態でもアプリ本体（画面）が開けるようにする
// ※データそのものはlocalStorageに保存されているため、この仕組みとは別に元々オフラインで読み書きできる

const CACHE_NAME = "hozone-cache-v1";
const FILES_TO_CACHE = [
  "index.html",
  "freezer.html",
  "register.html",
  "consumed.html",
  "settings.html",
  "css/style.css",
  "js/common.js",
  "js/home.js",
  "js/freezer.js",
  "js/register.js",
  "js/consumed.js",
  "js/settings.js",
  "manifest.json",
  "icons/icon-192.png",
  "icons/icon-512.png",
];

// インストール時：必要なファイルを一括でキャッシュしておく
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

// 古いキャッシュの掃除（バージョンを上げた時に前のキャッシュを消す）
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

// リクエスト時：キャッシュがあればそれを返し、無ければネットワークから取得
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
