// Dates are stored as "YYYY-MM-DD" text in the farmer's local time.
// (toISOString() would use UTC and can show yesterday's date in India.)
export function toDateInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Today's date plus a number of days, as "YYYY-MM-DD"
export function addDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toDateInput(date);
}

// "2026-12-05" -> "5 Dec 2026"
export function formatDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}