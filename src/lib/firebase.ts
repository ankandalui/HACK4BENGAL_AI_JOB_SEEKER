import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";

// Firebase configuration

const firebaseConfig = {
  apiKey: "AIzaSyB3-Q7kKEgNL1P4e26VbHKgMxGnGScsykk",
  authDomain: "ai-job-650b3.firebaseapp.com",
  projectId: "ai-job-650b3",
  storageBucket: "ai-job-650b3.appspot.com",
  messagingSenderId: "267914290975",
  appId: "1:267914290975:web:c7b5f36defc7aab993322a",
};

// Initialize Firebase only if not already initialized
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

export { app, db, auth, googleProvider, githubProvider };
