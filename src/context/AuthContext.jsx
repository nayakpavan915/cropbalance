import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { ref, onValue, set } from "firebase/database";
import { auth, db, PATHS } from "../firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // Firebase Auth user (or null)
  const [profile, setProfile] = useState(null); // data from /users/<uid>
  const [loading, setLoading] = useState(true); // true until we know who is logged in

  // 1) Watch the login state (also restores the session after a page refresh)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        setLoading(true); // wait until the profile has loaded
      } else {
        setProfile(null);
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  // 2) Watch the logged-in user's profile in the database
  const uid = user?.uid;
  useEffect(() => {
    if (!uid) return undefined;
    const unsubscribe = onValue(
      ref(db, `${PATHS.users}/${uid}`),
      (snap) => {
        setProfile(snap.val());
        setLoading(false);
      },
      (error) => {
        console.error("Could not read profile:", error);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [uid]);

  // Create the account, then save the farmer's profile
  async function register({ name, email, password, location, district }) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    try {
      const data = {
        uid: cred.user.uid,
        name: name.trim(),
        location,
        created_at: Date.now(),
      };
      if (district && district.trim()) data.district = district.trim();
      await set(ref(db, `${PATHS.users}/${cred.user.uid}`), data);
    } catch (error) {
      // Don't leave an account behind with no profile
      await cred.user.delete().catch(() => {});
      throw error;
    }
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    return signOut(auth);
  }

  const value = { user, profile, loading, register, login, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}