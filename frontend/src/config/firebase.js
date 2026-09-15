import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

export const firebaseConfig = {
  apiKey: "AIzaSyCi2cUfZ9IRWoGMqenELZegxiH9MtjaC5w",
  authDomain: "techschool-da235.firebaseapp.com",
  projectId: "techschool-da235",
  storageBucket: "techschool-da235.firebasestorage.app",
  messagingSenderId: "417832453592",
  appId: "1:417832453592:web:f6eb461fbecc39ffb59ead",
  measurementId: "G-8LTR583D5K"
};

// Initialize Firebase
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
