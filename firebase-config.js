// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB9hHjs7GcHjYt1yg9rJ-ekgp0cjMGpLJQ",
    authDomain: "taskify-fa561.firebaseapp.com",
    projectId: "taskify-fa561",
    storageBucket: "taskify-fa561.firebasestorage.app",
    messagingSenderId: "939807735888",
    appId: "1:939807735888:web:129954b6e14ce9768f9155",
    measurementId: "G-81HNG0RY00"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
