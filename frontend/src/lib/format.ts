const MONTHS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

// Dates come from the API as UTC-midnight (@db.Date) — read them in UTC.
export const fmtDate = (d: string | Date) => {
  const x = new Date(d);
  return `${x.getUTCDate()} ${MONTHS[x.getUTCMonth()]} ${x.getUTCFullYear()}`;
};

export const nf = (n?: number | null) =>
  ("" + Math.round(n || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

export const money = (n?: number | null) => nf(n) + " DA";

export const daysBetween = (a: string, b: string) =>
  Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000) + 1;

export const todayISO = () => new Date().toISOString().slice(0, 10);

// Two closed date ranges overlap iff aStart <= bEnd && bStart <= aEnd.
export const overlaps = (aS: string, aE: string, bS: string, bE: string) =>
  aS <= bE && bS <= aE;
