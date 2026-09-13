import {
  addHours,
  addMinutes,
  differenceInCalendarDays,
  startOfDay,
} from "date-fns";
import type { DoseLog, Medication, Profile } from "./types";
import { applyTime, asDate, toLocalStamp } from "./format";

export type DoseSlot = {
  key: string;
  medication: Medication;
  profile: Profile;
  scheduledAt: string;
  dueAt: string;
  log?: DoseLog;
  state: "pending" | "overdue" | "taken" | "skipped" | "postponed";
};

export function scheduledTimesOnDate(med: Medication, date: Date): Date[] {
  if (!med.active) return [];
  const start = startOfDay(asDate(med.schedule.startDate));
  const day = startOfDay(date);
  if (day < start) return [];
  if (med.schedule.endDate && day > startOfDay(asDate(med.schedule.endDate))) {
    return [];
  }

  const times = med.schedule.times.length ? med.schedule.times : ["08:00"];

  switch (med.schedule.type) {
    case "daily":
      return times.map((t) => applyTime(day, t));
    case "alternate_days": {
      const diff = differenceInCalendarDays(day, start);
      if (diff % 2 !== 0) return [];
      return times.map((t) => applyTime(day, t));
    }
    case "weekly": {
      const dow = day.getDay();
      if (!med.schedule.daysOfWeek?.includes(dow)) return [];
      return times.map((t) => applyTime(day, t));
    }
    case "cycle": {
      const on = med.schedule.cycleOnDays ?? 5;
      const off = med.schedule.cycleOffDays ?? 2;
      const cycle = Math.max(1, on + off);
      const diff = differenceInCalendarDays(day, start);
      if (diff % cycle >= on) return [];
      return times.map((t) => applyTime(day, t));
    }
    case "interval_hours": {
      const interval = med.schedule.intervalHours ?? 8;
      const first = applyTime(start, times[0] ?? "08:00");
      const dayEnd = addHours(day, 24);
      const results: Date[] = [];
      let cursor = first;
      let guard = 0;
      while (cursor < dayEnd && guard < 400) {
        if (cursor >= day) results.push(new Date(cursor));
        cursor = addHours(cursor, interval);
        guard += 1;
      }
      return results;
    }
    default:
      return [];
  }
}

export function dosesPerDay(med: Medication, date = new Date()): number {
  return Math.max(1, scheduledTimesOnDate(med, date).length);
}

export function stockDaysLeft(med: Medication, date = new Date()): number {
  const perDay = dosesPerDay(med, date) * med.perDose;
  if (perDay <= 0) return Infinity;
  return Math.floor(med.stockQuantity / perDay);
}

export function logKey(medicationId: string, scheduledAt: string): string {
  return `${medicationId}|${scheduledAt}`;
}

export function buildDayPlan(opts: {
  date: Date;
  now?: Date;
  profiles: Profile[];
  medications: Medication[];
  doseLogs: DoseLog[];
  profileId?: string | null;
}): DoseSlot[] {
  const now = opts.now ?? new Date();
  const profileMap = new Map(opts.profiles.map((p) => [p.id, p]));
  const logByKey = new Map(
    opts.doseLogs.map((l) => [logKey(l.medicationId, l.scheduledAt), l]),
  );

  const slots: DoseSlot[] = [];
  for (const med of opts.medications) {
    if (!med.active) continue;
    if (opts.profileId && med.profileId !== opts.profileId) continue;
    const profile = profileMap.get(med.profileId);
    if (!profile) continue;
    for (const time of scheduledTimesOnDate(med, opts.date)) {
      const scheduledAt = toLocalStamp(time);
      const log = logByKey.get(logKey(med.id, scheduledAt));
      const dueAt = log?.dueAt ?? scheduledAt;
      let state: DoseSlot["state"] = "pending";
      if (log?.status === "taken") state = "taken";
      else if (log?.status === "skipped") state = "skipped";
      else if (log?.status === "postponed") {
        state = asDate(dueAt) < now ? "overdue" : "postponed";
      } else if (asDate(dueAt) < now) {
        state = "overdue";
      }
      slots.push({
        key: logKey(med.id, scheduledAt),
        medication: med,
        profile,
        scheduledAt,
        dueAt,
        log,
        state,
      });
    }
  }

  slots.sort((a, b) => a.dueAt.localeCompare(b.dueAt));
  return slots;
}

export function postponeDue(dueAt: string, minutes = 15): string {
  return toLocalStamp(addMinutes(asDate(dueAt), minutes));
}

export function adherenceFor(
  meds: Medication[],
  logs: DoseLog[],
  profileId: string,
  from: Date,
  to: Date,
): { due: number; taken: number; skipped: number; percent: number } {
  const relevant = meds.filter((m) => m.profileId === profileId && m.active);
  let due = 0;
  let taken = 0;
  let skipped = 0;
  const logByKey = new Map(
    logs.map((l) => [logKey(l.medicationId, l.scheduledAt), l]),
  );
  const cursor = startOfDay(from);
  const end = startOfDay(to);
  while (cursor <= end) {
    for (const med of relevant) {
      for (const time of scheduledTimesOnDate(med, cursor)) {
        if (time > to) continue;
        due += 1;
        const log = logByKey.get(logKey(med.id, toLocalStamp(time)));
        if (log?.status === "taken") taken += 1;
        else if (log?.status === "skipped") skipped += 1;
      }
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  const percent = due === 0 ? 100 : Math.round((taken / due) * 100);
  return { due, taken, skipped, percent };
}

export function recentDosesBefore(
  meds: Medication[],
  logs: DoseLog[],
  profileId: string,
  at: Date,
  hours = 8,
): { medication: Medication; log: DoseLog }[] {
  const from = addHours(at, -hours);
  const atStamp = toLocalStamp(at);
  const fromStamp = toLocalStamp(from);
  return logs
    .filter(
      (l) =>
        l.profileId === profileId &&
        l.status === "taken" &&
        l.takenAt &&
        l.takenAt >= fromStamp &&
        l.takenAt <= atStamp,
    )
    .map((log) => {
      const medication = meds.find((m) => m.id === log.medicationId);
      return medication ? { medication, log } : null;
    })
    .filter((x): x is { medication: Medication; log: DoseLog } => Boolean(x));
}

export const SCHEDULE_LABEL: Record<Medication["schedule"]["type"], string> = {
  daily: "Ogni giorno",
  interval_hours: "A intervalli",
  alternate_days: "A giorni alterni",
  weekly: "Settimanale",
  cycle: "A ciclo",
};

export function describeSchedule(med: Medication): string {
  const times = med.schedule.times.join(" · ");
  switch (med.schedule.type) {
    case "daily":
      return `Ogni giorno · ${times}`;
    case "alternate_days":
      return `A giorni alterni · ${times}`;
    case "weekly": {
      const days = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];
      const names = (med.schedule.daysOfWeek ?? [])
        .map((d) => days[d])
        .join(", ");
      return `${names} · ${times}`;
    }
    case "cycle":
      return `${med.schedule.cycleOnDays ?? 5} giorni on, ${med.schedule.cycleOffDays ?? 2} off · ${times}`;
    case "interval_hours":
      return `Ogni ${med.schedule.intervalHours ?? 8} ore`;
    default:
      return times;
  }
}
