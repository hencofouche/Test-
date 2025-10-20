// sw.js

const CACHE_NAME = 'otakus-gambit-v4'; // Bumped version for new files

// Core assets are the files that make up the application's shell.
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/index.tsx',
  '/App.tsx',
  '/Tile.tsx',
  '/types.ts',
  '/constants.ts',
  '/icons.tsx',
  '/utils.ts',
  '/utils/SoundManager.ts',
  '/utils/names.ts',
  '/components/Board.tsx',
  '/components/Card.tsx',
  '/components/GameStatus.tsx',
  '/components/GameOverModal.tsx',
  '/components/StartMenu.tsx',
  '/components/Codex.tsx',
  '/components/DeckBuilder.tsx',
  '/components/Gacha.tsx',
  '/components/CardCreator.tsx',
  '/components/PreGameSetup.tsx',
  '/components/PlayMenu.tsx',
  '/components/ActionModal.tsx',
  '/components/ReviveModal.tsx',
  '/components/GameRules.tsx',
  '/components/CardDisplay.tsx',
  '/components/MediaDisplay.tsx',
  '/components/CardSelector.tsx',
  '/metadata.json',
  '/icon.svg',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Caching core assets');
      // Adding core assets. CDN assets will be cached on first fetch.
      return cache.addAll(CORE_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // We only want to handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - return response
      if (response) {
        return response;
      }

      // Not in cache - fetch from network, then cache it
      return fetch(event.request).then(
        (networkResponse) => {
          // Check if we received a valid response
          if (!networkResponse || networkResponse.status !== 200 || (networkResponse.type !== 'basic' && networkResponse.type !== 'cors')) {
            return networkResponse;
          }
          
          const responseToCache = networkResponse.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return networkResponse;
        }
      ).catch(error => {
          console.log('Fetch failed:', error);
          if (event.request.mode === 'navigate') {
              return caches.match('/');
          }
      });
    })
  );
});