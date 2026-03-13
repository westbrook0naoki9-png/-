const CACHE = 'casino-v1';
const ASSETS = [
  './index.html',
  'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Noto+Sans+JP:wght@400;500;700&display=swap'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ネットワーク優先・失敗時キャッシュ
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // Firebase通信はキャッシュしない
  if (e.request.url.includes('firebaseio.com') ||
      e.request.url.includes('googleapis.com/identitytoolkit')) return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
