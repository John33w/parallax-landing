import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import fs from "fs";

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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const checkCol = async (name) => {
  try {
    const snap = await getDocs(collection(db, name));
    console.log(`Collection ${name} has ${snap.size} docs`);
    if (snap.size > 0) {
      snap.forEach(doc => console.log(doc.id, doc.data().title));
    }
  } catch (e) {
    console.log(`Collection ${name} error:`, e.message);
  }
};

(async () => {
  await checkCol("posts");
  await checkCol("blogs");
  await checkCol("writings");
  await checkCol("articles");
  process.exit(0);
})();
