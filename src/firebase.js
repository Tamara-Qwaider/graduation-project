// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAf3qnGp11VHlR8WI-_bN0KV6fEU9YJRHo",
  authDomain: "spots-gp.firebaseapp.com",
  projectId: "spots-gp",
  storageBucket: "spots-gp.firebasestorage.app",
  messagingSenderId: "726607665750",
  appId: "1:726607665750:web:484b0d57255bf8f1e739f7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);