import {
  format,
  parseISO,
  isToday,
  isYesterday,
  isTomorrow,
  differenceInYears,
  differenceInCalendarDays,
} from "date-fns";
import { it } from "date-fns/locale";

export function asDate(value: string | Date): Date {
  return value instanceof Date ? value : parseISO(value);
}

export function toLocalStamp(d: Date): string {
  return format(d, "yyyy-MM-dd'T'HH:mm:ss");
}

export function toLocalDate(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

export function applyTime(day: Date, hhmm: string): Date {
  const [h, m] = hhmm.split(":").map(Number);
  const next = new Date(day);
  next.setHours(h ?? 0, m ?? 0, 0, 0);
  return next;
}

export function formatTime(value: string | Date): string {
  return format(asDate(value), "HH:mm");
}

export function formatDay(value: string | Date): string {
  const date = asDate(value);
  if (isToday(date)) return "Oggi";
  if (isYesterday(date)) return "Ieri";
  if (isTomorrow(date)) return "Domani";
  return format(date, "EEEE d MMMM", { locale: it });
}

export function formatDayShort(value: string | Date): string {
  const date = asDate(value);
  if (isToday(date)) return "Oggi";
  if (isYesterday(date)) return "Ieri";
  if (isTomorrow(date)) return "Domani";
  return format(date, "d MMM", { locale: it });
}

export function formatFull(value: string | Date): string {
  return format(asDate(value), "d MMMM yyyy, HH:mm", { locale: it });
}

export function formatLongDate(value: string | Date): string {
  return format(asDate(value), "d MMMM yyyy", { locale: it });
}

export function ageYears(birthDate: string, now = new Date()): number {
  return differenceInYears(now, parseISO(birthDate));
}

export function greeting(now = new Date()): string {
  const h = now.getHours();
  if (h < 12) return "Buongiorno";
  if (h < 18) return "Buon pomeriggio";
  return "Buonasera";
}

export function daysUntil(value: string | Date, now = new Date()): number {
  return differenceInCalendarDays(asDate(value), now);
}

export function plural(n: number, one: string, many: string): string {
  return n === 1 ? one : many;
}
