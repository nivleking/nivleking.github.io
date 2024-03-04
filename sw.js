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
  var url = "https://zxcvbn-ba039-default-rtdb.asia-southeast1.firebasedatabase.app/workouts";

  if (event.request.url.indexOf(url) > -1) {
    // Network then cache strategy for specific URL
    event.respondWith(
      fetch(event.request).then(function (res) {
        var clonedRes = res.clone();
        clearAllData("workouts")
          .then(function () {
            return clonedRes.json();
          })
          .then(function (data) {
            for (var key in data) {
              writeData("workouts", data[key]);
            }
          });
        return res;
      })
    );
  } else if (isInArray(event.request.url, STATIC_FILES)) {
    // Cache first strategy for static files
    event.respondWith(
      caches.match(event.request).then(function (response) {
        return (
          response ||
          fetch(event.request).then(function (res) {
            return caches.open(CACHE_DYNAMIC_NAME).then(function (cache) {
              cache.put(event.request.url, res.clone());
              return res;
            });
          })
        );
      })
    );
  } else {
    // Network then cache strategy for other requests
    event.respondWith(
      fetch(event.request)
        .then(function (res) {
          return caches.open(CACHE_DYNAMIC_NAME).then(function (cache) {
            cache.put(event.request.url, res.clone());
            return res;
          });
        })
        .catch(function () {
          return caches.match(event.request).then(function (res) {
            if (res) {
              return res;
            } else if (event.request.headers.get("accept").includes("text/html")) {
              return caches.match("/offline.html");
            }
          });
        })
    );
  }
});