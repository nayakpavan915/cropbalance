import { OctagonAlert, TriangleAlert } from "lucide-react";

// Red and yellow banners for crops that are at or over their safe level.
// rows: output of summarizeByCrop(). onlyCropIds: optional Set to limit which crops show.
export default function SurplusAlerts({ rows, onlyCropIds }) {
  const shown = rows
    .filter(
      (row) =>
        row.risk_level !== "low" && (!onlyCropIds || onlyCropIds.has(row.crop_id))
    )
    .sort((a, b) => b.ratio - a.ratio);

  if (shown.length === 0) return null;

  return (
    <div className="alert-list">
      {shown.map((row) => {
        const high = row.risk_level === "high";
        return (
          <p
            key={row.crop_id}
            className={`banner ${high ? "banner-error" : "banner-warn"}`}
            role={high ? "alert" : "status"}
          >
            {high ? <OctagonAlert /> : <TriangleAlert />}
            <span>
              <strong>
                {high ? "Surplus alert" : "Nearing limit"}: {row.name}
              </strong>
              <br />
              {row.acres} acres planned, safe level {row.safe} (
              {Math.round(row.ratio * 100)}%).{" "}
              {high
                ? "Too many farmers plan to harvest this at once. Consider another crop or a different harvest date."
                : "Think twice before planting more of this."}
            </span>
          </p>
        );
      })}
    </div>
  );
}