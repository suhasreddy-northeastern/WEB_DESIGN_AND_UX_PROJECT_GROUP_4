/* eslint-env serviceworker */
/* eslint-disable no-restricted-globals */

const CACHE_NAME = "HomeFit-cache-v1";
const urlsToCache = [
  // Add Files thah you want to cache
  "",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
