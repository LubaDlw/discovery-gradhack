import { getFirestore, collection, getDocs } from "firebase/firestore";
import { initializeApp } from "firebase/app";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDAlVzUeNuEYCnCWvg_v5rw80q9YXvysYc",
  authDomain: "discovery-gradhack25jnb-108.firebaseapp.com",
  projectId: "discovery-gradhack25jnb-108",
  storageBucket: "discovery-gradhack25jnb-108.firebasestorage.app",
  messagingSenderId: "1011454667050",
  appId: "1:1011454667050:web:230f3a6ca09b9c5907d653"

};


// Initialize Firebase (if not already done)
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
// Export the initialized services
export { db, app };
