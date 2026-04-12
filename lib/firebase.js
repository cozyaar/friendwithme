import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCT28twbrDhAgbGNCZ3ZZ6klegF5YBsum0",
  authDomain: "friendwithme-10395.firebaseapp.com",
  projectId: "friendwithme-10395",
  storageBucket: "friendwithme-10395.firebasestorage.app",
  messagingSenderId: "458129175154",
  appId: "1:458129175154:web:12e96cbc3b17a648afc8eb",
  measurementId: "G-43G12KPYCV"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);

export let analytics = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}
