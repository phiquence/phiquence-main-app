
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBI-vDrlmwe0SUxukmRT6pBsALfRytoSHA",
  authDomain: "phiquence-ndim2.firebaseapp.com",
  databaseURL: "https://phiquence-ndim2-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "phiquence-ndim2",
  storageBucket: "phiquence-ndim2.appspot.com",
  messagingSenderId: "107293394177",
  appId: "1:107293394177:web:eae17deb60de18b2ff4700"
};

// Initialize Firebase
// We check if the apps are already initialized to avoid errors.
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth = getAuth(app);
const db = getFirestore(app);

export { app as firebaseApp, auth, db };
