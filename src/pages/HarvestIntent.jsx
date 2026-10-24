import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  CloudOff,
  Leaf,
  Minus,
  Plus,
  Sprout,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useOutbox } from "../context/OutboxContext";
import { CROPS, getCropName } from "../utils/crops";
import { addDays, formatDate, toDateInput } from "../utils/dates";

const QUICK_DATES = [
  { label: "2 weeks", days: 14 },
  { label: "1 month", days: 30 },
  { label: "2 months", days: 60 },
  { label: "3 months", days: 90 },
  { label: "4 months", days: 120 },
];

const MAX_ACRES = 1000;
const SLIDER_MAX = 50;

export default function HarvestIntent() {
  const { profile } = useAuth();
  const { addEntry, pending, connected, rejected, clearRejected } = useOutbox();

  const [crop, setCrop] = useState("");
  const [acresText, setAcresText] = useState("2");
  const [date, setDate] = useState("");
  const [error, setError] = useState("");
  const [savedCrop, setSavedCrop] = useState("");

  const acres = Number(acresText);
  const today = toDateInput(new Date());

  function changeAcres(delta) {
    const base = Number.isFinite(acres) && acres > 0 ? acres : 0;
    const next = Math.min(MAX_ACRES, Math.max(0.5, base + delta));
    setAcresText(String(Math.round(next * 10) / 10));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSavedCrop("");

    if (!profile) {
      setError("Your profile is not loaded yet. Please wait a moment and try again.");
      return;
    }
    if (!crop) {
      setError("Please choose a crop.");
      return;
    }
    if (!Number.isFinite(acres) || acres <= 0 || acres > MAX_ACRES) {
      setError(`Acreage must be more than 0 and at most ${MAX_ACRES}.`);
      return;
    }
    if (!date) {
      setError("Please choose the expected harvest date.");
      return;
    }
    if (date < today) {
      setError("The harvest date cannot be in the past.");
      return;
    }

    try {
      addEntry({
        crop_id: crop,
        quantity: Math.round(acres * 10) / 10,
        harvest_date: date,
        location: profile.location,
      });
      setSavedCrop(getCropName(crop));
      setCrop("");
      setAcresText("2");
      setDate("");
    } catch (err) {
      console.error(err);
      setError("Could not save your entry. Please try again.");
    }
  }

  return (
    <div className="harvest-shell">
      <header className="hero hero-compact">
        <div className="hero-inner">
          <Link to="/" className="hero-back">
            <ArrowLeft size={20} /> Back
          </Link>
          <h1>
            <Sprout size={32} /> Harvest plan
          </h1>
          <p>
            Tell other farmers what you plan to harvest
            {profile ? ` in ${profile.location}` : ""}.
          </p>
        </div>
      </header>

      <main className="page-wide pull-up">
        {savedCrop && (
          <p className="banner banner-success" role="status">
            <Check /> {savedCrop} saved.
          </p>
        )}

        {pending.length > 0 && (
          <p className="banner banner-warn" role="status">
            <CloudOff />
            {connected
              ? `Sending ${pending.length} ${pending.length === 1 ? "entry" : "entries"}…`
              : `Offline. ${pending.length} ${
                  pending.length === 1 ? "entry is" : "entries are"
                } saved on this phone and will be sent when you are online.`}
          </p>
        )}

        {rejected > 0 && (
          <p className="banner banner-error" role="alert">
            {rejected} {rejected === 1 ? "entry was" : "entries were"} refused by
            the server and removed.
            <button type="button" onClick={clearRejected}>
              OK
            </button>
          </p>
        )}

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* 1. Crop */}
          <section className="card step-card">
            <h2 className="step-title">
              <span className="step-num">1</span> Crop
            </h2>
            <div className="input-wrap">
              <Leaf className="input-icon" size={20} />
              <select
                aria-label="Crop"
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
              >
                <option value="">Select a crop</option>
                {CROPS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </section>

          {/* 2. Acreage */}
          <section className="card step-card">
            <h2 className="step-title">
              <span className="step-num">2</span> Land area
            </h2>
            <div className="acre-display">
              <p className="acre-big">
                {Number.isFinite(acres) && acres > 0 ? acres : "–"}
                <span className="acre-unit">acres</span>
              </p>
            </div>
            <div className="acre-row">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => changeAcres(-0.5)}
                aria-label="Decrease by half an acre"
              >
                <Minus />
              </button>
              <input
                type="range"
                min="0.5"
                max={SLIDER_MAX}
                step="0.5"
                value={Math.min(SLIDER_MAX, Math.max(0.5, acres || 0.5))}
                onChange={(e) => setAcresText(e.target.value)}
                aria-label="Land area in acres"
              />
              <button
                type="button"
                className="btn-secondary"
                onClick={() => changeAcres(0.5)}
                aria-label="Increase by half an acre"
              >
                <Plus />
              </button>
            </div>
            <div className="acre-number">
              <label htmlFor="acres-exact">More than 50? Type it:</label>
              <input
                id="acres-exact"
                type="number"
                inputMode="decimal"
                min="0.5"
                max={MAX_ACRES}
                step="0.5"
                value={acresText}
                onChange={(e) => setAcresText(e.target.value)}
              />
            </div>
          </section>

          {/* 3. Harvest date */}
          <section className="card step-card">
            <h2 className="step-title">
              <span className="step-num">3</span> Expected harvest in
            </h2>
            <div className="chips">
              {QUICK_DATES.map((q) => {
                const value = addDays(q.days);
                return (
                  <button
                    key={q.days}
                    type="button"
                    className="chip"
                    aria-pressed={date === value}
                    onClick={() => setDate(value)}
                  >
                    {q.label}
                  </button>
                );
              })}
            </div>
            <div className="input-wrap">
              <CalendarDays className="input-icon" size={20} />
              <input
                type="date"
                aria-label="Exact harvest date"
                min={today}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            {date && <p className="chosen-date">Harvest date: {formatDate(date)}</p>}
          </section>

          <div className="save-bar">
            <button className="btn-primary" type="submit">
              <Check size={20} />
              Save harvest plan
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}