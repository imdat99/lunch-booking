import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { initializeFirestore } from 'firebase/firestore'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'
import { getStorage } from 'firebase/storage'
import { useAuthState } from 'react-firebase-hooks/auth'

const {
  VITE_APP_apiKey: apiKey,
  VITE_APP_authDomain: authDomain,
  VITE_APP_projectId: projectId,
  VITE_APP_storageBucket: storageBucket,
  VITE_APP_messagingSenderId: messagingSenderId,
  VITE_APP_appId: appId,
  VITE_APP_measurementId: measurementId,
  VITE_APP_vapiKey: vapiKey,
} = import.meta.env

export const firebaseConfig = {
  apiKey,
  authDomain,
  projectId,
  storageBucket,
  messagingSenderId,
  appId,
  measurementId,
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
})
const auth = getAuth(app)
const googleAuthProvider = new GoogleAuthProvider()
const storage = getStorage(app)
const messaging = getMessaging(app)
function requestPermission() {
  console.log('Requesting permission...')
  Notification.requestPermission().then((permission) => {
    if (permission === 'granted') {
      console.log('Notification permission granted.')
    } else {
      console.log('Notification permission is not granted.')
    }
  })
}
requestPermission()

// connectAuthEmulator(auth, "http://localhost:9099");
// if(window.location.hostname === 'localhost'){
//   connectFirestoreEmulator(db, 'localhost', 8080);
//   connectStorageEmulator(storage,'localhost',9199)
// }

export { auth, db, googleAuthProvider, messaging, storage }
