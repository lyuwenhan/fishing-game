const CACHE = "fishing-game-v1";
self.addEventListener("install", event => {
	event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(["./", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"])).then(() => self.skipWaiting()))
});
self.addEventListener("activate", event => {
	event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()))
});
self.addEventListener("fetch", event => {
	if (event.request.mode !== "navigate") return;
	event.respondWith(fetch(event.request).catch(() => caches.match("./")))
});
