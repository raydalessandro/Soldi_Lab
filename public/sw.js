// Service worker minimo per Soldi_Lab.
//
// Strategia:
//  - precache delle route principali + manifest + icone all'install
//  - fetch handler stale-while-revalidate per asset Next (/_next/static/*)
//    e network-first con fallback cache per le route HTML
//  - quando offline e la cache non ha la risorsa, fallback alla home
//
// Quando il manifesto della versione cambia (CACHE_NAME), il SW cancella
// la vecchia cache all'activate.

const CACHE_NAME = "soldi-lab-v1";
const PRECACHE_URLS = [
  "/",
  "/floor/",
  "/income/",
  "/patrimony/",
  "/cycle/",
  "/advisor/",
  "/settings/",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-192.png",
  "/icons/icon-maskable-512.png",
  "/icons/apple-touch-icon.png",
  "/favicon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      // addAll fallisce all-or-nothing: usiamo add per non bloccare il
      // SW se una singola risorsa manca temporaneamente in dev.
      await Promise.all(
        PRECACHE_URLS.map(async (url) => {
          try {
            await cache.add(url);
          } catch {
            // ignora il singolo, non bloccare l'install
          }
        }),
      );
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  // Solo same-origin: niente proxying di terze parti
  if (url.origin !== self.location.origin) return;

  // Asset versionati di Next: stale-while-revalidate
  if (url.pathname.startsWith("/_next/")) {
    event.respondWith(staleWhileRevalidate(req));
    return;
  }

  // Naviga (HTML): network-first, fallback cache, ultimate fallback "/"
  if (req.mode === "navigate" || req.headers.get("accept")?.includes("text/html")) {
    event.respondWith(networkFirst(req));
    return;
  }

  // Tutto il resto (manifest, icone, json): cache-first
  event.respondWith(cacheFirst(req));
});

async function cacheFirst(req) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(req);
  if (cached) return cached;
  try {
    const fresh = await fetch(req);
    if (fresh.ok) cache.put(req, fresh.clone());
    return fresh;
  } catch {
    return cached ?? Response.error();
  }
}

async function networkFirst(req) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const fresh = await fetch(req);
    if (fresh.ok) cache.put(req, fresh.clone());
    return fresh;
  } catch {
    const cached = await cache.match(req);
    if (cached) return cached;
    const fallback = await cache.match("/");
    return fallback ?? Response.error();
  }
}

async function staleWhileRevalidate(req) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(req);
  const fetchPromise = fetch(req)
    .then((res) => {
      if (res.ok) cache.put(req, res.clone());
      return res;
    })
    .catch(() => cached);
  return cached ?? fetchPromise;
}
