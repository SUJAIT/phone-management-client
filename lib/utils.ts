import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Consistent BDT currency formatting used across the whole app.
export function money(n?: number) {
  return `\u09F3${Math.round(n ?? 0).toLocaleString("en-US")}`;
}

export function formatDate(d?: string | Date) {
  if (!d) return "";
  return new Date(d).toLocaleString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
