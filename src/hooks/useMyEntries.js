import { useEffect, useState } from "react";
import { equalTo, onValue, orderByChild, query, ref } from "firebase/database";
import { db, PATHS } from "../firebase";

// Live list of the logged-in farmer's own harvest entries, soonest harvest first.
export function useMyEntries(uid) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!uid) return undefined;
    const myEntries = query(
      ref(db, PATHS.logs),
      orderByChild("uid"),
      equalTo(uid)
    );
    const unsubscribe = onValue(
      myEntries,
      (snap) => {
        const list = [];
        snap.forEach((child) => {
          list.push({ id: child.key, ...child.val() });
        });
        list.sort((a, b) => a.harvest_date.localeCompare(b.harvest_date));
        setEntries(list);
        setError("");
        setLoading(false);
      },
      (err) => {
        console.error("Could not load entries:", err);
        setError("Could not load your entries.");
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [uid]);

  return { entries, loading, error };
}