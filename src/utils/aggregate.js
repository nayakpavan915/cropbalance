import { getCropName } from "./crops";
import { getSafeAcres } from "./demand";
import { getRisk } from "./risk";

// Adds up planned acres per crop for one state, up to a cutoff date.
// logs: entries from /logs. untilDate: "YYYY-MM-DD".
export function summarizeByCrop(logs, { location, untilDate }) {
  const byCrop = new Map();

  for (const log of logs) {
    if (log.location !== location) continue;
    if (log.harvest_date > untilDate) continue;

    const row = byCrop.get(log.crop_id) ?? {
      crop_id: log.crop_id,
      acres: 0,
      farmers: new Set(),
    };
    row.acres += Number(log.quantity) || 0;
    row.farmers.add(log.uid);
    byCrop.set(log.crop_id, row);
  }

  return [...byCrop.values()]
    .map((row) => {
      const acres = Math.round(row.acres * 10) / 10;
      const safe = getSafeAcres(row.crop_id);
      const { ratio, level } = getRisk(acres, safe);
      return {
        crop_id: row.crop_id,
        name: getCropName(row.crop_id),
        shortName: getCropName(row.crop_id).split(" (")[0],
        acres,
        farmers: row.farmers.size,
        safe,
        ratio,
        risk_level: level,
      };
    })
    .sort((a, b) => b.acres - a.acres);
}