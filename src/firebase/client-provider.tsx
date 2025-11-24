
'use client';
import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getDatabase, type Database } from 'firebase/database';
import { firebaseConfig } from './config';
import { FirebaseProvider } from './provider';

// Helper to initialize Firebase on the client.
function initializeFirebaseClient() {
  if (getApps().length) {
    return {
      firebaseApp: getApp(),
      auth: getAuth(),
      database: getDatabase(),
    };
  }

  const firebaseApp = initializeApp(firebaseConfig);
  const auth = getAuth(firebaseApp);
  const database = getDatabase(firebaseApp);

  return { firebaseApp, auth, database };
}

type FirebaseContext = {
  firebaseApp: FirebaseApp;
  auth: Auth;
  database: Database;
};

// This provider is responsible for initializing Firebase on the client
// and providing the Firebase instances to the rest of the app.
export function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
  const { firebaseApp, auth, database } = initializeFirebaseClient();

  return (
    <FirebaseProvider firebaseApp={firebaseApp} auth={auth} database={database}>
      {children}
    </FirebaseProvider>
  );
}
