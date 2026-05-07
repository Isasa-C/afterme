import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function percent(part: number, total: number) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

export function formatMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (!hours) return `${mins}m`;
  if (!mins) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export function timeLabel(value: string | Date) {
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function monthYear(value: string | Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
