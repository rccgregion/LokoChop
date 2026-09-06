import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase client safely
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Use the designated custom Firestore Database ID provisioned for LokoChop
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);

// Validate connection per Firebase guidelines
async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('[LokoChop Firestore] Client appears offline; local cache will be used.');
    }
  }
}

testFirestoreConnection();

export default app;
