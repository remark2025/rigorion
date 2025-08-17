// Service Worker for SAT Practice App
// Provides offline functionality with cache-first strategy

const CACHE_VERSION = 'v1.0.0';
const STATIC_CACHE = `sat-practice-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `sat-practice-dynamic-${CACHE_VERSION}`;
const PACKS_CACHE = `sat-practice-packs-${CACHE_VERSION}`;

// Resources to cache immediately
const STATIC_RESOURCES = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.webmanifest',
  '/offline.html' // Fallback page
];

// Cache-first resources (packs, media)
const CACHE_FIRST_PATTERNS = [
  /\/functions\/v1\/content.*route.*pack/,
  /\/media\//,
  /\.(png|jpg|jpeg|svg|woff2|woff)$/
];

// Network-first resources (manifest, API calls)
const NETWORK_FIRST_PATTERNS = [
  /\/functions\/v1\/content.*route.*manifest/,
  /\/functions\/v1\/attempts-batch/,
  /\/functions\/v1\/log-interaction/
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('[SW] Install event');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static resources');
        return cache.addAll(STATIC_RESOURCES);
      })
      .then(() => {
        console.log('[SW] Skip waiting');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Install failed:', error);
      })
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName.startsWith('sat-practice-') && 
                     !cacheName.includes(CACHE_VERSION);
            })
            .map((cacheName) => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[SW] Claiming clients');
        return self.clients.claim();
      })
  );
});

// Fetch event - routing strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip cross-origin requests (except Supabase)
  if (url.origin !== location.origin && !url.host.includes('supabase.co')) {
    return;
  }
  
  event.respondWith(handleRequest(request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Cache-first strategy for packs and media
    if (CACHE_FIRST_PATTERNS.some(pattern => pattern.test(url.href))) {
      return await cacheFirstStrategy(request, PACKS_CACHE);
    }
    
    // Network-first strategy for manifest and API calls
    if (NETWORK_FIRST_PATTERNS.some(pattern => pattern.test(url.href))) {
      return await networkFirstStrategy(request, DYNAMIC_CACHE);
    }
    
    // Default: Cache-first for app shell
    return await cacheFirstStrategy(request, STATIC_CACHE);
    
  } catch (error) {
    console.error('[SW] Request failed:', error);
    return await getOfflineFallback(request);
  }
}

async function cacheFirstStrategy(request, cacheName) {
  // Try cache first
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    console.log('[SW] Cache hit:', request.url);
    
    // Background refresh for packs if ETag differs
    if (cacheName === PACKS_CACHE) {
      backgroundRefresh(request, cacheName);
    }
    
    return cachedResponse;
  }
  
  // Fetch from network and cache
  console.log('[SW] Cache miss, fetching:', request.url);
  const networkResponse = await fetch(request);
  
  if (networkResponse.ok) {
    const cache = await caches.open(cacheName);
    await cache.put(request, networkResponse.clone());
    console.log('[SW] Cached:', request.url);
  }
  
  return networkResponse;
}

async function networkFirstStrategy(request, cacheName) {
  try {
    // Try network first
    console.log('[SW] Network first:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      await cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Fallback to cache
    console.log('[SW] Network failed, trying cache:', request.url);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

async function backgroundRefresh(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      await cache.put(request, networkResponse.clone());
      console.log('[SW] Background refresh completed:', request.url);
      
      // Notify clients of update
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({
          type: 'CACHE_UPDATED',
          url: request.url
        });
      });
    }
  } catch (error) {
    console.log('[SW] Background refresh failed:', error);
  }
}

async function getOfflineFallback(request) {
  const url = new URL(request.url);
  
  // Return offline page for navigation requests
  if (request.mode === 'navigate') {
    const offlinePage = await caches.match('/offline.html');
    return offlinePage || new Response('Offline - Please check your connection', {
      status: 503,
      headers: { 'Content-Type': 'text/html' }
    });
  }
  
  // Return empty response for other requests
  return new Response('', { 
    status: 503,
    statusText: 'Service Unavailable' 
  });
}

// Listen for messages from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_VERSION });
  }
});