import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { initializeFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const {
  VITE_APP_apiKey: apiKey,
  VITE_APP_authDomain: authDomain,
  VITE_APP_projectId: projectId,
  VITE_APP_storageBucket: storageBucket,
  VITE_APP_messagingSenderId: messagingSenderId,
  VITE_APP_appId: appId,
  VITE_APP_measurementId: measurementId,
} = import.meta.env

const firebaseConfig = {
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

// connectAuthEmulator(auth, "http://localhost:9099");
// if(window.location.hostname === 'localhost'){
//   connectFirestoreEmulator(db, 'localhost', 8080);
//   connectStorageEmulator(storage,'localhost',9199)
// }

export { auth, db, googleAuthProvider, storage }
