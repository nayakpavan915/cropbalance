import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Fail loudly in development if configuration is incomplete
const required = ["apiKey", "authDomain", "databaseURL", "projectId", "appId"];
const missing = required.filter((key) => !firebaseConfig[key]);
if (missing.length > 0) {
  throw new Error(
    `Missing Firebase config: ${missing.join(", ")}. ` +
      "Check your .env.local file (see .env.example) and restart the dev server."
  );
}

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); // keeps the signed-in session in the browser
export const db = getDatabase(app);

// Single source of truth for database node names (matches the schema)
export const PATHS = {
  users: "users",           // uid, location, crop_history
  logs: "logs",             // crop_id, quantity, harvest_date, uid
  aggregates: "aggregates", // crop_name, total_area, risk_level
};