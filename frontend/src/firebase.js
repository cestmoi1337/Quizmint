// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";  // for Firestore usage
import { getAuth } from "firebase/auth";            // for Auth (future use)
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCE1QSJuC_79VIgkrBmtJtopyYTPm0uQAQ",
  authDomain: "quizmint-454815.firebaseapp.com",
  projectId: "quizmint-454815",
  storageBucket: "quizmint-454815.firebasestorage.app",
  messagingSenderId: "98028186009",
  appId: "1:98028186009:web:4deedff7cb26d832424b08"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services to use throughout the app
export const db = getFirestore(app);
export const auth = getAuth(app);