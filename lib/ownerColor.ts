// A small fixed palette. Which owner gets which color is decided by hashing their id, so
// the same person always gets the same color across sessions/reloads without needing to
// hardcode names like "Sujait" / "Ovi" anywhere.
const PALETTE = [
  {
    name: "indigo",
    text: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-100 dark:bg-indigo-950/40",
    border: "border-indigo-300 dark:border-indigo-800",
    leftBorder: "border-l-indigo-500",
    dot: "bg-indigo-500",
    chipActive: "bg-indigo-600 text-white",
  },
  {
    name: "rose",
    text: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-100 dark:bg-rose-950/40",
    border: "border-rose-300 dark:border-rose-800",
    leftBorder: "border-l-rose-500",
    dot: "bg-rose-500",
    chipActive: "bg-rose-600 text-white",
  },
  {
    name: "amber",
    text: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-100 dark:bg-amber-950/40",
    border: "border-amber-300 dark:border-amber-800",
    leftBorder: "border-l-amber-500",
    dot: "bg-amber-500",
    chipActive: "bg-amber-600 text-white",
  },
  {
    name: "teal",
    text: "text-teal-600 dark:text-teal-400",
    bg: "bg-teal-100 dark:bg-teal-950/40",
    border: "border-teal-300 dark:border-teal-800",
    leftBorder: "border-l-teal-500",
    dot: "bg-teal-500",
    chipActive: "bg-teal-600 text-white",
  },
];

function hashString(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function ownerColor(ownerId: string) {
  return PALETTE[hashString(ownerId) % PALETTE.length];
}
