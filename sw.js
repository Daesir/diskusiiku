/* Service worker Sidang Nalar.
   Semua berkas aplikasi disimpan di perangkat supaya game bisa dimainkan tanpa internet.
   Setiap kali mengubah berkas lain, naikkan angka VERSI agar pengguna mendapat pembaruan. */
const VERSI = 'v1';
const CACHE = 'sidang-nalar-' + VERSI;
const BERKAS = [
  './',
  'index.html',
  'css/style.css',
  'js/game.js',
  'manifest.webmanifest',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png',
  'fonts/pixelify-sans-latin-400-normal.woff2',
  'fonts/pixelify-sans-latin-600-normal.woff2',
  'fonts/press-start-2p-latin-400-normal.woff2'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(BERKAS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((nama) => Promise.all(nama.filter((n) => n.startsWith('sidang-nalar-') && n !== CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

/* Ambil dari cache dulu supaya cepat, lalu perbarui cache di belakang layar. */
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    caches.match(req).then((cache) => {
      const jaringan = fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const salinan = res.clone();
            caches.open(CACHE).then((c) => c.put(req, salinan));
          }
          return res;
        })
        .catch(() => cache || caches.match('index.html'));
      return cache || jaringan;
    })
  );
});
