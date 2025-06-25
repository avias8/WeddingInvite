// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBPKpeXlhqfY3jaBfxX3z0XileaCTwbw1c",
  authDomain: "wedding-selfie-game.firebaseapp.com",
  projectId: "wedding-selfie-game",
  storageBucket: "wedding-selfie-game.firebasestorage.app",
  messagingSenderId: "239563720137",
  appId: "1:239563720137:web:9b1b65e6c120190960d418",
  measurementId: "G-ZT3NXTN8H6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export default app;
