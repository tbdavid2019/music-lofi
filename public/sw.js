const CACHE_NAME = "888-music-v3";
const CACHE_PREFIX = "888-music-";
const STATIC_PATHS = ["/assets/", "/icons/", "/favicon", "/site.webmanifest", "/LofiEngine.png", "/app-icon.png"];

async function getPrecacheAssets() {
  const fallbackAssets = [
    "/",
    "/site.webmanifest",
    "/favicon.svg",
    "/favicon.ico",
    "/icons/icon-192.png",
    "/icons/icon-512.png"
  ];

  try {
    const response = await fetch("/build-manifest.json");
    if (!response.ok) return fallbackAssets;

    const manifest = await response.json();
    const assets = new Set(fallbackAssets);

    for (const entry of Object.values(manifest)) {
      for (const file of [entry.file, ...(entry.css || [])]) {
        if (/\.(js|css)$/i.test(file)) assets.add(`/${file}`);
      }
    }

    return [...assets];
  } catch (err) {
    console.warn("[SW] Manifest precache fallback:", err);
    return fallbackAssets;
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    getPrecacheAssets()
      .then((assets) => caches.open(CACHE_NAME).then((cache) => cache.addAll(assets)))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((cacheName) => cacheName.startsWith(CACHE_PREFIX) && cacheName !== CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName))
        )
      ),
      self.clients.claim(),
    ])
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).then(async (response) => {
        if (response.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put("/", response.clone());
        }
        return response;
      }).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        return (await cache.match(request)) || (await cache.match("/"));
      })
    );
    return;
  }

  const isAudioOrVideo = /\.(mp3|m4a|aac|ogg|wav|mp4|webm)$/i.test(url.pathname);
  const isStaticAsset = !isAudioOrVideo && STATIC_PATHS.some((path) => url.pathname.startsWith(path));
  if (!isStaticAsset) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cachedResponse = await cache.match(request);
      try {
        const response = await fetch(request);
        if (response.ok) await cache.put(request, response.clone());
        return response;
      } catch {
        if (cachedResponse) return cachedResponse;
        throw new Error("Offline and no cached response is available.");
      }
    })
  );
});
