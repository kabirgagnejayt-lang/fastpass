'use client';
import type { FirebaseApp } from 'firebase/app';
import type { Auth, User } from 'firebase/auth';
import type { Database } from 'firebase/database';
import { createContext, useContext, useEffect } from 'react';
import { useUser } from './auth/use-user';
import { ref, set, onValue, update } from 'firebase/database';

// This is the context that will be used to provide the Firebase instances to the app.
const FirebaseContext = createContext<{
  firebaseApp: FirebaseApp | null;
  auth: Auth | null;
  database: Database | null;
} | null>(null);

// This is a hook that allows components to access the Firebase instances.
export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}

// These are hooks that allow components to access the individual Firebase instances.
export function useFirebaseApp() {
  return useFirebase()?.firebaseApp;
}
export function useAuth() {
  return useFirebase()?.auth;
}
export function useDatabase() {
  return useFirebase()?.database;
}

const UserProfileSync = () => {
    const { user } = useUser();
    const database = useDatabase();

    useEffect(() => {
        if (database && user) {
            const userRef = ref(database, 'users/' + user.uid);

            onValue(userRef, (snapshot) => {
                if (!snapshot.exists()) {
                    set(userRef, {
                        uid: user.uid,
                        name: user.displayName,
                        email: user.email,
                        pfp: user.photoURL,
                        ageGroup: "",
                    });
                } else {
                    // If the user exists but doesn't have an ageGroup, add it.
                    const userData = snapshot.val();
                    if (!userData.hasOwnProperty('ageGroup')) {
                        update(userRef, { ageGroup: "" });
                    }
                }
            }, { onlyOnce: true });
        }
    }, [database, user]);

    return null; // This component does not render anything
}


// This is the provider component that will be used to wrap the app.
export function FirebaseProvider({
  children,
  firebaseApp,
  auth,
  database,
}: {
  children: React.ReactNode;
  firebaseApp: FirebaseApp;
  auth: Auth;
  database: Database;
}) {

  return (
    <FirebaseContext.Provider value={{ firebaseApp, auth, database }}>
      <UserProfileSync />
      {children}
    </FirebaseContext.Provider>
  );
}
