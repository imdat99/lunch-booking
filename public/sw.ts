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
