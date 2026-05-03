/**
 * firebaseConfig.js
 * ----------------------------------------------------------------------
 * Inizializzazione di Firebase usando variabili d'ambiente.
 *
 * I valori vengono letti dal file `.env` (NON committato su GitHub).
 * Il file `.env.example` mostra la struttura attesa.
 *
 * NOTA: Le chiavi client Firebase (apiKey, etc.) sono pubbliche per design,
 * ma è buona prassi tenerle fuori dal repository per facilità di gestione
 * e per non esporle in cronologie git.
 *
 * La sicurezza VERA è garantita dalle regole nel file `firebase-rules.json`.
 * ----------------------------------------------------------------------
 */

import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// Verifica che tutte le variabili siano presenti
const missingKeys = Object.entries(firebaseConfig)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingKeys.length > 0) {
  console.error(
    'Configurazione Firebase incompleta. Variabili mancanti:',
    missingKeys.join(', '),
    '\n\nVerificare il file .env nella root del progetto.'
  );
}

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export const auth = getAuth(app);
export default app;
