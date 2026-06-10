import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBzlvVUxZrMaU8OxYve9GNts1ZdCz35CWk",
  authDomain: "kitchen-app-31fa9.firebaseapp.com",
  projectId: "kitchen-app-31fa9",
  storageBucket: "kitchen-app-31fa9.firebasestorage.app",
  messagingSenderId: "18408555856",
  appId: "1:18408555856:web:b4a4337326d408f5f5d855",
  measurementId: "G-FH002VEFFE"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

window.db = db;
window.doc = doc;
window.setDoc = setDoc;
window.getDoc = getDoc;
window.onSnapshot = onSnapshot;