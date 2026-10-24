import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { get, onValue, push, ref, set } from "firebase/database";
import { db, PATHS } from "../firebase";
import { useAuth } from "./AuthContext";

const OutboxContext = createContext(null);

function storageKey(uid) {
  return `cropbalance_outbox_${uid}`;
}

function readOutbox(uid) {
  try {
    const raw = localStorage.getItem(storageKey(uid));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeOutbox(uid, items) {
  try {
    localStorage.setItem(storageKey(uid), JSON.stringify(items));
  } catch (error) {
    console.error("Could not save the outbox on this device:", error);
  }
}

function isPermissionDenied(error) {
  return (
    error?.code === "PERMISSION_DENIED" ||
    error?.message?.includes("PERMISSION_DENIED")
  );
}

export function OutboxProvider({ children }) {
  const { user } = useAuth();
  const uid = user?.uid;

  const [pending, setPending] = useState([]); // entries not yet confirmed by the server
  const [connected, setConnected] = useState(false);
  const [rejected, setRejected] = useState(0); // entries the server refused
  const pendingRef = useRef([]);
  const flushing = useRef(false);

  // Keep the state, the ref, and localStorage in sync
  const updatePending = useCallback(
    (next) => {
      pendingRef.current = next;
      setPending(next);
      if (uid) writeOutbox(uid, next);
    },
    [uid]
  );

  // Load this user's saved outbox when they log in
  useEffect(() => {
    const items = uid ? readOutbox(uid) : [];
    pendingRef.current = items;
    setPending(items);
    setRejected(0);
  }, [uid]);

  // Track the connection to Firebase
  useEffect(() => {
    const unsubscribe = onValue(ref(db, ".info/connected"), (snap) => {
      setConnected(snap.val() === true);
    });
    return unsubscribe;
  }, []);

  // Send queued entries to Firebase, one at a time
  const flush = useCallback(async () => {
    if (!uid || flushing.current) return;
    flushing.current = true;
    try {
      let guard = 0;
      while (pendingRef.current.length > 0 && guard < 200) {
        guard += 1;
        const item = pendingRef.current[0];
        const itemRef = ref(db, `${PATHS.logs}/${item.id}`);
        try {
          await set(itemRef, item.data);
        } catch (error) {
          if (!isPermissionDenied(error)) break; // network trouble: try again later

          // Refused. Either it was already saved earlier, or the rules rejected it.
          let alreadySaved = false;
          try {
            const snap = await get(itemRef);
            alreadySaved = snap.exists() && snap.val().uid === uid;
          } catch {
            break; // can't check right now: try again later
          }
          if (!alreadySaved) setRejected((count) => count + 1);
        }
        updatePending(pendingRef.current.filter((entry) => entry.id !== item.id));
      }
    } finally {
      flushing.current = false;
    }
  }, [uid, updatePending]);

  // Send whenever we are online and something is waiting
  useEffect(() => {
    if (connected && uid && pending.length > 0) flush();
  }, [connected, uid, pending.length, flush]);

  // Queue a new harvest entry. Works offline.
  const addEntry = useCallback(
    ({ crop_id, quantity, harvest_date, location }) => {
      if (!uid) throw new Error("You must be logged in.");
      const id = push(ref(db, PATHS.logs)).key; // generated on this device, no network needed
      const item = {
        id,
        data: {
          uid,
          crop_id,
          quantity,
          harvest_date,
          location,
          created_at: Date.now(),
        },
      };
      updatePending([...pendingRef.current, item]);
      return id;
    },
    [uid, updatePending]
  );

  const clearRejected = useCallback(() => setRejected(0), []);

  const value = { pending, connected, rejected, addEntry, clearRejected };
  return (
    <OutboxContext.Provider value={value}>{children}</OutboxContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useOutbox() {
  const context = useContext(OutboxContext);
  if (!context) throw new Error("useOutbox must be used inside <OutboxProvider>");
  return context;
}