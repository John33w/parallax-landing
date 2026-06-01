import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import fs from "fs";

// Load .env manually
const envFile = fs.readFileSync(".env", "utf8");
const env = {};
envFile.split("\n").forEach(line => {
  const parts = line.split("=");
  if (parts.length === 2) {
    env[parts[0].trim()] = parts[1].replace(/"/g, "").trim();
  }
});

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID
};

console.log("Firebase Config Project ID:", firebaseConfig.projectId);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

try {
  const snapshot = await getDocs(collection(db, "posts"));
  console.log("Number of posts in Firestore:", snapshot.size);
  snapshot.forEach(doc => {
    const data = doc.data();
    console.log(doc.id, "=>", {
      title: data.title,
      status: data.status,
      publishDate: data.publishDate,
      permalink: data.permalink
    });
  });
} catch (e) {
  console.error("Error reading Firestore:", e);
}
