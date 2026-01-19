


const CACHE_NAME = "sirh-cache-v1";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./style.css", // Ajout du fichier CSS
  "./app.js",    // Ajout du fichier JS
  "./manifest.json",
  "https://cdn.tailwindcss.com",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/js/all.min.js",
  "https://cdn.jsdelivr.net/npm/sweetalert2@11",
  "https://unpkg.com/html5-qrcode",
  "https://cdn.jsdelivr.net/npm/chart.js",
  "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;600;700&display=swap"
];

// Installation
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Récupération (Stratégie : Cache First, then Network)
self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});--- START OF FILE manifest.json ---

{
  "name": "SIRH Secure Pro",
  "short_name": "SIRH",
  "start_url": "./index.html",
  "display": "standalone",
  "background_color": "#0f172a",
  "theme_color": "#0f172a",
  "orientation": "portrait",
  "icons": [
    {
      "src": "https://cdn-icons-png.flaticon.com/512/9322/9322127.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "https://cdn-icons-png.flaticon.com/512/9322/9322127.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}


