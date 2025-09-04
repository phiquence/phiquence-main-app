
import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
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

// --- Reliable Initialization ---
let app: FirebaseApp;
let appInitialized = false;
const appInitializationPromise = new Promise<FirebaseApp>((resolve) => {
    if (getApps().length === 0) {
        app = initializeApp(firebaseConfig);
    } else {
        app = getApp();
    }
    appInitialized = true;
    resolve(app);
});


const auth = getAuth(app);
const db = getFirestore(app);


/**
 * Ensures that any action depending on Firebase is executed only after
 * the app is fully initialized.
 * @param callback The function to execute after initialization.
 */
export async function onInit<T>(callback: () => T): Promise<T> {
    if (appInitialized) {
        return callback();
    }
    await appInitializationPromise;
    return callback();
}

export { app as firebaseApp, auth, db };
