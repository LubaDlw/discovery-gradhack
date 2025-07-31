// Uncomment when ready to use Firebase
/*
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

export class FirebaseService {
  static app = null;
  static auth = null;
  static db = null;

  static async initialize() {
    try {
      this.app = initializeApp(firebaseConfig);
      this.auth = getAuth(this.app);
      this.db = getFirestore(this.app);

      const initialAuthToken = window.__initial_auth_token || null;

      if (initialAuthToken) {
        await signInWithCustomToken(this.auth, initialAuthToken);
        console.log("Signed in with custom token.");
      } else {
        await signInAnonymously(this.auth);
        console.log("Signed in anonymously.");
      }

      return this.auth;
    } catch (error) {
      console.error("Error initializing Firebase:", error);
      throw error;
    }
  }

  static onAuthStateChanged(callback) {
    if (this.auth) {
      return onAuthStateChanged(this.auth, callback);
    }
  }
}
*/

// Placeholder for when Firebase is not used
export class FirebaseService {
  static async initialize() {
    console.log("Firebase service is disabled. Uncomment code to enable.");
    return null;
  }

  static onAuthStateChanged(callback) {
    // No-op when Firebase is disabled
  }
}