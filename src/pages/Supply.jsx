import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, BarChart3 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useUpcomingSupply } from "../hooks/useUpcomingSupply";
import { summarizeByCrop } from "../utils/aggregate";
import { addDays } from "../utils/dates";
import SupplyChart from "../components/SupplyChart";
import SurplusAlerts from "../components/SurplusAlerts";

const WINDOWS = [
  { label: "30 days", days: 30 },
  { label: "60 days", days: 60 },
  { label: "90 days", days: 90 },
  { label: "180 days", days: 180 },
];

const BADGE_TEXT = { high: "SURPLUS", medium: "NEAR LIMIT", low: "OK" };

export default function Supply() {
  const { profile } = useAuth();
  const { logs, loading, error } = useUpcomingSupply();
  const [days, setDays] = useState(90);

  const rows = useMemo(() => {
    if (!profile) return [];
    return summarizeByCrop(logs, {
      location: profile.location,
      untilDate: addDays(days),
    });
  }, [logs, profile, days]);

  return (
    <main className="page-wide">
      <Link to="/" className="back-link">
        <ArrowLeft size={20} /> Back
      </Link>
      <h1>
        <BarChart3 size={32} /> Harvest supply
      </h1>
      <p style={{ marginTop: 0 }}>
        <span className="live-dot" />
        Live. Acres planned for harvest in{" "}
        <strong>{profile?.location ?? "your state"}</strong>.
      </p>

      <div className="form-group">
        <span className="group-label">Harvesting within</span>
        <div className="chips">
          {WINDOWS.map((w) => (
            <button
              key={w.days}
              type="button"
              className="chip"
              aria-pressed={days === w.days}
              onClick={() => setDays(w.days)}
            >
              {w.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <p role="status">Loading…</p>
      ) : rows.length === 0 ? (
        <p>
          No harvest plans in {profile?.location} for the next {days} days.
          Add one from the Dashboard to see it here.
        </p>
      ) : (
        <>
          <SurplusAlerts rows={rows} />

          <SupplyChart data={rows} />

          <h2 className="section-title">By crop</h2>
          <ul className="entry-list">
            {rows.map((row) => (
              <li className="entry-card" key={row.crop_id}>
                <div>
                  <strong>{row.name}</strong>
                  <span className={`badge badge-${row.risk_level}`}>
                    {BADGE_TEXT[row.risk_level]}
                  </span>
                  <div className="entry-meta">
                    {row.farmers} {row.farmers === 1 ? "farmer" : "farmers"} ·
                    safe level {row.safe} acres
                  </div>
                </div>
                <strong>{row.acres} acres</strong>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}