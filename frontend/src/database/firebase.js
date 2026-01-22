// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue, get } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCkzgmcES-Ppgs4pqKoA9-s7MRUNdzNL5s",
    authDomain: "energy-trade-d73e8.firebaseapp.com",
    databaseURL: "https://energy-trade-d73e8-default-rtdb.firebaseio.com",
    projectId: "energy-trade-d73e8",
    storageBucket: "energy-trade-d73e8.firebasestorage.app",
    messagingSenderId: "571871976863",
    appId: "1:571871976863:web:793b0fb59ab2e0fc7471aa",
    measurementId: "G-13ZLZLKJPH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);

export { database, ref, set, onValue, get };