/* Service worker «ГТМ ГТС ЗФ»: network-first для same-origin GET (свежие данные важнее),
   кэш — офлайн-фолбэк. CDN и тайлы карт идут напрямую в сеть. */
const CACHE = 'gtm-gts-v1';

self.addEventListener('install', () => { self.skipWaiting(); });

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const u = new URL(e.request.url);
  if (u.origin !== location.origin) return; // CDN-библиотеки, тайлы, метео-API — напрямую
  e.respondWith(
    fetch(e.request).then(r => {
      if (r.ok) { const c = r.clone(); caches.open(CACHE).then(cc => cc.put(e.request, c)); }
      return r;
    }).catch(() => caches.match(e.request))
  );
});
