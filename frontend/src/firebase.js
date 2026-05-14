import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDenmXvdm6oCNjj7gFb6lTWw24wnrV2UuI",
  authDomain: "cinenova-e2f7f.firebaseapp.com",
  projectId: "cinenova-e2f7f",
  storageBucket: "cinenova-e2f7f.firebasestorage.app",
  messagingSenderId: "78818948769",
  appId: "1:78818948769:web:38382ab307f2313878a2e0",
  measurementId: "G-CHQFZLXGJ5"
};

const app = initializeApp(firebaseConfig);

// FIX ANALYTICS ERROR
isSupported().then((yes) => {
  if (yes) {
    getAnalytics(app);
  }
});

export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();

// OPTIONAL BUT IMPORTANT
googleProvider.setCustomParameters({
  prompt: "select_account",
});