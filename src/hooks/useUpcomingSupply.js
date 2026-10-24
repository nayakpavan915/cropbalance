import { useEffect, useState } from "react";
import { onValue, orderByChild, query, ref, startAt } from "firebase/database";
import { db, PATHS } from "../firebase";
import { toDateInput } from "../utils/dates";

// Live list of every farmer's entries with a harvest date of today or later.
export function useUpcomingSupply() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const today = toDateInput(new Date());
    const upcoming = query(
      ref(db, PATHS.logs),
      orderByChild("harvest_date"),
      startAt(today)
    );
    const unsubscribe = onValue(
      upcoming,
      (snap) => {
        const list = [];
        snap.forEach((child) => {
          list.push({ id: child.key, ...child.val() });
        });
        setLogs(list);
        setError("");
        setLoading(false);
      },
      (err) => {
        console.error("Could not load supply data:", err);
        setError("Could not load supply data.");
        setLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  return { logs, loading, error };
}