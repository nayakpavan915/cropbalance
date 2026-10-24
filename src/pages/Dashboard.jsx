import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ref, remove } from "firebase/database";
import {
  BarChart3,
  CloudOff,
  LogOut,
  MapPin,
  Plus,
  Sprout,
  Trash2,
} from "lucide-react";
import { db, PATHS } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useOutbox } from "../context/OutboxContext";
import { useMyEntries } from "../hooks/useMyEntries";
import { useUpcomingSupply } from "../hooks/useUpcomingSupply";
import SurplusAlerts from "../components/SurplusAlerts";
import { summarizeByCrop } from "../utils/aggregate";
import { getCropName } from "../utils/crops";
import { addDays, formatDate, toDateInput } from "../utils/dates";

export default function Dashboard() {
  const { user, profile, logout } = useAuth();
  const { pending } = useOutbox();
  const { entries, loading, error } = useMyEntries(user?.uid);
  const { logs } = useUpcomingSupply();
  const [deleteError, setDeleteError] = useState("");
  const [deletingId, setDeletingId] = useState("");

  // Supply per crop in my state over the next 90 days
  const supplyRows = useMemo(() => {
    if (!profile) return [];
    return summarizeByCrop(logs, {
      location: profile.location,
      untilDate: addDays(90),
    });
  }, [logs, profile]);

  // The crops I still plan to harvest
  const myCropIds = useMemo(() => {
    const today = toDateInput(new Date());
    return new Set(
      entries.filter((e) => e.harvest_date >= today).map((e) => e.crop_id)
    );
  }, [entries]);

  async function handleDelete(entry) {
    const ok = window.confirm(
      `Delete ${getCropName(entry.crop_id)} (${entry.quantity} acres)?`
    );
    if (!ok) return;
    setDeleteError("");
    setDeletingId(entry.id);
    try {
      await remove(ref(db, `${PATHS.logs}/${entry.id}`));
    } catch (err) {
      console.error(err);
      setDeleteError("Could not delete this entry. Please try again.");
    } finally {
      setDeletingId("");
    }
  }

  return (
    <main className="auth-page">
      <h1>
        <Sprout size={32} /> CropBalance
      </h1>

      {profile ? (
        <>
          <p className="subtitle">Welcome, {profile.name}</p>
          <p
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "0.75rem 1rem",
              borderRadius: 8,
              fontWeight: 700,
              background: "var(--green-100)",
            }}
          >
            <MapPin />
            {profile.district ? `${profile.district}, ` : ""}
            {profile.location}
          </p>

          <Link to="/harvest" className="btn-link">
            <Plus size={20} style={{ verticalAlign: "middle", marginRight: 6 }} />
            Add harvest plan
          </Link>
          <Link to="/supply" className="btn-link btn-link-outline">
            <BarChart3
              size={20}
              style={{ verticalAlign: "middle", marginRight: 6 }}
            />
            See supply in {profile.location}
          </Link>

          <SurplusAlerts rows={supplyRows} onlyCropIds={myCropIds} />

          {pending.length > 0 && (
            <p className="banner banner-warn" role="status">
              <CloudOff />
              {pending.length} {pending.length === 1 ? "entry is" : "entries are"}{" "}
              waiting to be sent.
            </p>
          )}

          <h2 className="section-title">My harvest plans</h2>

          {deleteError && (
            <p className="form-error" role="alert">
              {deleteError}
            </p>
          )}
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          {loading ? (
            <p role="status">Loading…</p>
          ) : entries.length === 0 ? (
            <p>You have no harvest plans yet. Tap "Add harvest plan" to start.</p>
          ) : (
            <ul className="entry-list">
              {entries.map((entry) => (
                <li className="entry-card" key={entry.id}>
                  <div>
                    <strong>{getCropName(entry.crop_id)}</strong>
                    <div className="entry-meta">
                      {entry.quantity} acres · {formatDate(entry.harvest_date)}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-icon"
                    onClick={() => handleDelete(entry)}
                    disabled={deletingId === entry.id}
                    aria-label={`Delete ${getCropName(entry.crop_id)} entry`}
                  >
                    <Trash2 />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <p className="form-error" role="alert">
          No profile was found for {user?.email}. Please log out and register
          again.
        </p>
      )}

      <button className="btn-secondary" onClick={logout}>
        <LogOut size={18} style={{ verticalAlign: "middle", marginRight: 6 }} />
        Log out
      </button>
    </main>
  );
}