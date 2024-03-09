var CACHE_STATIC_NAME = "static";
var CACHE_DYNAMIC_NAME = "dynamic";
var STATIC_FILES = [
  "/",
  "/index.html",
  "/offline.html",
  "/src/js/card.js",
  "/src/js/app.js",
  "/src/js/promise.js",
  "/src/js/fetch.js",
  "/workout.html",
  "/src/css/bootstrap.min.css",
  "/src/js/bootstrap.bundle.min.js",
  "/src/js/bootstrap.min.js",
  "/src/css/style.css",
  // "/src/assets/images/1.jpg",
  // "/src/assets/images/2.jpg",
  // "/src/assets/images/3.jpg",
  // "/src/assets/images/4.jpg",
  // "/src/assets/images/5.jpg",
  // "/src/assets/images/6.jpg",
  // "/src/assets/images/7.jpg",
  "https://fonts.googleapis.com/css2?family=Style+Script&display=swap",
  // "/src/images/icons/*",
  "/favicon.ico",
  // "/node_modules/*",
];

self.addEventListener("install", function (event) {
  console.log("[Service Worker] Installing Service Worker ...", event);
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME).then(function (cache) {
      console.log("[Service Worker] Precaching App Shell");
      cache.addAll(STATIC_FILES);
    })
  );
});

self.addEventListener("activate", function (event) {
  console.log("[Service Worker] Activating Service Worker ....", event);
  event.waitUntil(
    caches.keys().then(function (keyList) {
      return Promise.all(
        keyList.map(function (key) {
          if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
            console.log("[Service Worker] Removing old cache.", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Network first, then cache, with offline fallback
self.addEventListener("fetch", function (event) {
  event.respondWith(
    fetch(event.request)
      .then(async function (res) {
        const cache = await caches.open(CACHE_DYNAMIC_NAME);
        cache.put(event.request.url, res.clone());
        return res;
      })
      .catch(function (err) {
        return caches.match(event.request)
          .then(function (res) {
            if (res) {
              return res; // cached file
            } else {
              return caches.match('/offline.html'); // offline fallback page
            }
          });
      })
  );
});