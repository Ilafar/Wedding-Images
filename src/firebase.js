// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB5B6AGKpQEgKNjXgUXZt4KyFGLMJ4lRYU",
  authDomain: "wedding-images-b5d03.firebaseapp.com",
  projectId: "wedding-images-b5d03",
  storageBucket: "wedding-images-b5d03.firebasestorage.app",
  messagingSenderId: "617984375570",
  appId: "1:617984375570:web:ed530b38e40b40721951cb",
  measurementId: "G-9ZH3M2BDD7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);