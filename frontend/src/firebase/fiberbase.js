// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics  } from "firebase/analytics";
import {getAuth,GoogleAuthProvider,signInWithPopup} from "firebase/auth"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
 apiKey: "AIzaSyByKreslJHYkxXEltf7aH5e_V5s5Leh2EY",
 authDomain: "chatty-60f74.firebaseapp.com",
 projectId: "chatty-60f74",
 storageBucket: "chatty-60f74.firebasestorage.app",
 messagingSenderId: "1021892372825",
 appId: "1:1021892372825:web:b7d001c5f49e97c374c448",
 measurementId: "G-59Z73Q6G2L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider()

export {app , auth , googleProvider};
