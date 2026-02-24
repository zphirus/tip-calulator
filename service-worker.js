const CACHE_VERSION = "v3"; 
const CACHE_NAME = `tip-calculator-${CACHE_VERSION}`;

const urlsToCache = [
  "./",
  "./index.html",
  "./manifest.json"
];

// 설치 시 캐시
self.addEventListener("install", event => {
  self.skipWaiting(); // 새 SW 바로 활성화
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// 활성화 시 이전 캐시 삭제
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  return self.clients.claim();
});

// 네트워크 우선 전략 (항상 최신 가져옴)
self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME)
          .then(cache => cache.put(event.request, responseClone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
