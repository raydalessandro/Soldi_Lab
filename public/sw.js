// Service worker minimo per Soldi_Lab.
//
// Storia di v1 → v2: nella v1 pre-cachavamo tutte le route HTML
// all'install. Su un nuovo deploy il browser poteva continuare a servire
// la vecchia HTML (con chunk hash obsoleti), causando crash silenziosi e
// dati che apparivano persi. Da v2 precachiamo solo asset stabili (icone
// e manifest); le route HTML vengono cached opportunisticamente solo dopo
// la prima visita reale, e seguono comunque la strategia network-first.

const CACHE_NAME = "soldi-lab-v2";
const STABLE_PRECACHE_URLS = [
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
      await Promise.all(
        STABLE_PRECACHE_URLS.map(async (url) => {
          try {
            await cache.add(url);
          } catch {
            // non bloccare l'install per una singola risorsa
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
  if (url.origin !== self.location.origin) return;

  // Asset versionati di Next: stale-while-revalidate.
  // I filename includono hash, quindi una versione vecchia non collide.
  if (url.pathname.startsWith("/_next/")) {
    event.respondWith(staleWhileRevalidate(req));
    return;
  }

  // Naviga (HTML): network-first. Se siamo offline serviamo l'ultima HTML
  // che abbiamo (se mai cached); niente fallback a "/" perché può servire
  // un layout incoerente con la rotta corrente.
  if (
    req.mode === "navigate" ||
    req.headers.get("accept")?.includes("text/html")
  ) {
    event.respondWith(networkFirstHtml(req));
    return;
  }

  // Tutto il resto (manifest, icone, json): cache-first.
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

async function networkFirstHtml(req) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const fresh = await fetch(req);
    if (fresh.ok) cache.put(req, fresh.clone());
    return fresh;
  } catch {
    const cached = await cache.match(req);
    return cached ?? Response.error();
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
