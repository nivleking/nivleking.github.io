importScripts("/src/js/idb.js");
importScripts("/src/js/utility.js");

var CACHE_STATIC_NAME = "static-v1";
var CACHE_DYNAMIC_NAME = "dynamic-v1";
var STATIC_FILES = [
  "/",
  "/index.html",
  "/offline.html",
  "src/js/card.js",
  "/src/js/app.js",
  "/src/js/idb.js",
  "/src/js/promise.js",
  "/src/js/fetch.js",
  "/src/js/utility.js",
  "/workout.html",
  "/src/css/bootstrap.min.css",
  "/src/js/bootstrap.bundle.min.js",
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

// membaca index db
function isInArray(string, array) {
  var cachePath;
  if (string.indexOf(self.origin) === 0) {
    console.log("matched ", string);
    cachePath = string.substring(self.origin.length);
  } else {
    cachePath = string;
  }
  return array.indexOf(cachePath) > -1;
}

self.addEventListener("fetch", function (event) {
  event.respondWith(
    fetch(event.request)
      .then(function (res) {
        return caches.open(CACHE_DYNAMIC_NAME).then(function (cache) {
          cache.put(event.request, res.clone());
          return res; // return the network response
        });
      })
      .catch(function () {
        return caches.match(event.request).then(function (res) {
          if (res) {
            return res;
          } else if (event.request.headers.get("accept").includes("text/html")) {
            return caches.match("/offline.html"); // return the offline fallback page
          }
        });
      })
  );
});
