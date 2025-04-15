/* eslint-env serviceworker */
/* eslint-disable no-restricted-globals */

const CACHE_NAME = "HomeFit-cache-v1";
const urlsToCache = [
  // Add Files thah you want to cache
  "./index.html",
];

// htmlfile, png File, css file

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("activate", (event) => {
  // clean up cache activity or useless cache.

  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key); // caches.delete will return me a promise
          }
        })
      );
    })
  );
});

self.addEventListener("fetch", (event) => {
  // Offline experiene
  // Whenever a file is requested
  // 1. fetch from network , if there is new data i will update my cache.if network call fails i will use cache as a fallback.

  //this then case here is when i'm online.

  console.log("Handling fetch for:", event.request.url);

  if (!event.request.url.startsWith("http")) return;

  event.respondWith(
    fetch(event.request)
      .then((res) => {
        // update my cache
        const cloneData = res.clone();
        caches.open(CACHE_NAME).then((cache) => {
          return cache.put(event.request, cloneData);
        });
        console.log("returning from network");
        return res;
      })
      .catch(() => {
        console.log("Returning from cache");
        return caches.match(event.request).then((file) => file);
      })
  );

  // event.respondWith(
  //   caches
  //     .match(event.request)
  //     .then((response) => response || fetch(event.request))
  // );
});
