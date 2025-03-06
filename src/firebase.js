// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD77M9uv2sOjWFpXcZRrCczWm6sI9twfyU",
  authDomain: "poopfriend-7e2ff.firebaseapp.com",
  projectId: "poopfriend-7e2ff",
  storageBucket: "poopfriend-7e2ff.appspot.com",
  messagingSenderId: "1065754358330",
  appId: "1:1065754358330:web:8d964e4f4a4d92cd90bb03",
  measurementId: "G-7E2ZWZ2LZX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { db, auth, provider };
