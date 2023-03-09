const CACHE_NAME = 'cool-cache'

// Add whichever assets you want to precache here:
const PRECACHE_ASSETS = ['/src/']

// Listener for the install event - precaches our assets list on service worker install.
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME)
      cache.addAll(PRECACHE_ASSETS)
    })()
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim())
})

self.addEventListener('fetch', (event) => {
  event.respondWith(async () => {
    const cache = await caches.open(CACHE_NAME)

    // match the request to our cache
    const cachedResponse = await cache.match(event.request)

    // check if we got a valid response
    if (cachedResponse !== undefined) {
      // Cache hit, return the resource
      return cachedResponse
    } else {
      // Otherwise, go to the network
      return fetch(event.request)
    }
  })
})

//browser push notification "onClick" event heandler
self.addEventListener('notificationclick', function (event) {
  console.log('[Service Worker] Notification click Received.')
  event.notification.close()

  /**
   * if exists open browser tab with matching url just set focus to it,
   * otherwise open new tab/window with sw root scope url
   */
  event.waitUntil(
    clients
      .matchAll({
        type: 'window',
      })
      .then(function (clientList) {
        for (var i = 0; i < clientList.length; i++) {
          var client = clientList[i]
          if (client.url == self.registration.scope && 'focus' in client) {
            return client.focus()
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/')
        }
      })
  )
})
