import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyCqp7qvCGuYHUdfmSXKXSUPbov08xCDFYE",
  authDomain: "tehnology-kitchen-cards.firebaseapp.com",
  projectId: "tehnology-kitchen-cards",
  storageBucket: "tehnology-kitchen-cards.firebasestorage.app",
  messagingSenderId: "372101723227",
  appId: "1:372101723227:web:9babf2e9cfedceae40bb7e"
};


const app = initializeApp(firebaseConfig);



export const db = getFirestore(app);

