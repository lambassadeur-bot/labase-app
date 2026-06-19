// DIG PWA Service Worker — cache offline + stratégies réseau
const CACHE_VERSION = 'dig-v34';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

// Fichiers à mettre en cache au premier lancement
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  // CDN libs
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js',
  'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
];

// Install — pré-cache les assets statiques
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

// Activate — nettoie les vieux caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => !key.startsWith(CACHE_VERSION))
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch — stratégies différentes selon le type de requête
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ne pas cacher les requêtes non-GET
  if (request.method !== 'GET') return;

  // APIs externes (Open Library, OMDB, BGG, RAWG, etc.) — Network First
  // (pour avoir les données les plus fraîches mais avec fallback offline)
  if (
    url.hostname.includes('openlibrary.org') ||
    url.hostname.includes('omdbapi.com') ||
    url.hostname.includes('boardgamegeek.com') ||
    url.hostname.includes('rawg.io') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('musicbrainz.org') ||
    url.hostname.includes('coverartarchive.org') ||
    url.hostname.includes('openfoodfacts.org') ||
    url.hostname.includes('wikipedia.org') ||
    url.hostname.includes('upcitemdb.com') ||
    url.hostname.includes('nominatim.openstreetmap.org') ||
    url.hostname.includes('supabase.co')
  ) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Tiles de carte (Leaflet/OSM) — Cache First (les tiles changent peu)
  if (url.hostname.includes('tile.openstreetmap.org') || url.hostname.includes('basemaps.cartocdn.com')) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // HTML (index.html, racine) — Network First pour avoir les MAJ immédiates
  if (request.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname === '/' || url.pathname.endsWith('/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Tout le reste (CSS, JS app, images) — Cache First avec MAJ en arrière-plan
  event.respondWith(staleWhileRevalidate(request));
});

// === Stratégies ===

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (e) {
    return cached || new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (e) {
    const cached = await caches.match(request);
    return cached || new Response(JSON.stringify({ error: 'offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => cached);
  return cached || fetchPromise;
}

// Notifications push (préparation pour plus tard)
self.addEventListener('push', (event) => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || 'DIG', {
      body: data.body,
      icon: 'icon-192.png',
      badge: 'icon-192.png',
      data: data.url ? { url: data.url } : undefined,
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || './';
  event.waitUntil(clients.openWindow(url));
});
