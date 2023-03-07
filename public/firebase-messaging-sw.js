// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js')

// Initialize the Firebase app in the service worker by passing the generated config
const firebaseConfig = {
  apiKey: 'AIzaSyDBiz4TUFtdQTE9ISHK5S5dtP6GIUaF8AU',
  authDomain: 'lunchbooking-d4fbf.firebaseapp.com',
  projectId: 'lunchbooking-d4fbf',
  storageBucket: 'lunchbooking-d4fbf.appspot.com',
  messagingSenderId: '123054878462',
  appId: '1:123054878462:web:7673277f92786f742abfaf',
  measurementId: 'G-Q9MMWCJ82S',
}

firebase.initializeApp(firebaseConfig)

// Retrieve firebase messaging
const messaging = firebase.messaging()

messaging.onBackgroundMessage(function (payload) {
  console.log('Received background message ', payload)

  const notificationTitle = payload.data.context
  const notificationOptions = {
    body: payload.data.created_date,
  }

  self.registration.showNotification(notificationTitle, notificationOptions)
})
