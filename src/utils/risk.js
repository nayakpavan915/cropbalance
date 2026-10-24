// Supply-to-demand ratio = planned acres / safe acres.
export const WARN_RATIO = 0.75; // yellow from here
export const SURPLUS_RATIO = 1; // red when planned acres go ABOVE the safe level

export function getRisk(acres, safe) {
  const ratio = safe > 0 ? acres / safe : 0;
  let level = "low";
  if (ratio > SURPLUS_RATIO) level = "high";
  else if (ratio >= WARN_RATIO) level = "medium";
  return { ratio, level };
}