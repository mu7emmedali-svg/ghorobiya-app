const CACHE_NAME = "ghorobi-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json",
  "https://cdn-icons-png.flaticon.com/512/3222/3222800.png"
];

// تثبيت الـ Service Worker وحفظ الملفات في الكاش
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// استراتيجية الاستجابة: البحث في الكاش أولاً ثم الشبكة
self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => {
      return res || fetch(e.request);
    })
  );
});
