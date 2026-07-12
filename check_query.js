import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import fs from 'fs';

const firebaseCode = fs.readFileSync('src/lib/firebase.ts', 'utf-8');
const configMatch = firebaseCode.match(/const firebaseConfig = ({[\s\S]*?});/);
if (configMatch) {
  const configStr = configMatch[1]
    .replace(/import\.meta\.env\.VITE_FIREBASE_API_KEY/g, '""')
    .replace(/import\.meta\.env\.VITE_FIREBASE_AUTH_DOMAIN/g, '""')
    .replace(/import\.meta\.env\.VITE_FIREBASE_PROJECT_ID/g, '"parallax-landing"') // assuming project id
    .replace(/import\.meta\.env\.VITE_FIREBASE_STORAGE_BUCKET/g, '""')
    .replace(/import\.meta\.env\.VITE_FIREBASE_MESSAGING_SENDER_ID/g, '""')
    .replace(/import\.meta\.env\.VITE_FIREBASE_APP_ID/g, '""');
  console.log("Found config");
}
