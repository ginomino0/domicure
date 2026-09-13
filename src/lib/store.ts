import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  AppData,
  Appointment,
  ClinicalDocument,
  DoseLog,
  Medication,
  Profile,
  Symptom,
  Thresholds,
  Vital,
} from "./types";
import { DEFAULT_THRESHOLDS } from "./types";
import { createSeed } from "./seed";
import { uid } from "./utils";
import { postponeDue } from "./schedule";
import { toLocalStamp } from "./format";

type Session = {
  unlocked: boolean;
  hydrated: boolean;
};

type Actions = {
  hydrateDone: () => void;
  setHydrated: (v: boolean) => void;
  unlock: () => void;
  lock: () => void;
  setPinHash: (hash: string | null) => void;
  setHighContrast: (v: boolean) => void;
  setLargeType: (v: boolean) => void;
  setActiveProfile: (id: string | null) => void;
  addProfile: (p: Omit<Profile, "id">) => string;
  updateProfile: (id: string, patch: Partial<Profile>) => void;
  removeProfile: (id: string) => void;
  addMedication: (m: Omit<Medication, "id">) => string;
  updateMedication: (id: string, patch: Partial<Medication>) => void;
  removeMedication: (id: string) => void;
  takeDose: (slot: { medicationId: string; profileId: string; scheduledAt: string; dueAt: string }) => void;
  skipDose: (slot: { medicationId: string; profileId: string; scheduledAt: string; dueAt: string }, reason: string) => void;
  postponeDose: (slot: { medicationId: string; profileId: string; scheduledAt: string; dueAt: string }, minutes?: number) => void;
  addVital: (v: Omit<Vital, "id">) => string;
  removeVital: (id: string) => void;
  setThresholds: (profileId: string, t: Thresholds) => void;
  addSymptom: (s: Omit<Symptom, "id">) => string;
  removeSymptom: (id: string) => void;
  addAppointment: (a: Omit<Appointment, "id">) => string;
  updateAppointment: (id: string, patch: Partial<Appointment>) => void;
  removeAppointment: (id: string) => void;
  addDocument: (d: Omit<ClinicalDocument, "id">) => string;
  removeDocument: (id: string) => void;
  resetDemo: () => void;
};

const empty: AppData = {
  hasOnboarded: false,
  pinHash: null,
  highContrast: false,
  largeType: false,
  activeProfileId: null,
  profiles: [],
  medications: [],
  doseLogs: [],
  vitals: [],
  thresholds: {},
  symptoms: [],
  appointments: [],
  documents: [],
};

function upsertLog(logs: DoseLog[], next: DoseLog): DoseLog[] {
  const idx = logs.findIndex(
    (l) => l.medicationId === next.medicationId && l.scheduledAt === next.scheduledAt,
  );
  if (idx === -1) return [...logs, next];
  const copy = logs.slice();
  copy[idx] = { ...logs[idx], ...next, id: logs[idx].id };
  return copy;
}

export const useAppStore = create<AppData & Session & Actions>()(
  persist(
    (set, get) => ({
      ...empty,
      unlocked: true,
      hydrated: false,
      hydrateDone: () => {
        const s = get();
        if (!s.hasOnboarded || s.profiles.length === 0) {
          set({ ...createSeed(), hydrated: true, unlocked: !s.pinHash });
          return;
        }
        set({ hydrated: true, unlocked: !s.pinHash });
      },
      setHydrated: (v) => set({ hydrated: v }),
      unlock: () => set({ unlocked: true }),
      lock: () => {
        if (get().pinHash) set({ unlocked: false });
      },
      setPinHash: (hash) => set({ pinHash: hash, unlocked: hash ? true : true }),
      setHighContrast: (v) => set({ highContrast: v }),
      setLargeType: (v) => set({ largeType: v }),
      setActiveProfile: (id) => set({ activeProfileId: id }),
      addProfile: (p) => {
        const id = uid("p");
        set((s) => ({
          profiles: [...s.profiles, { ...p, id }],
          thresholds: { ...s.thresholds, [id]: { ...DEFAULT_THRESHOLDS } },
          activeProfileId: id,
        }));
        return id;
      },
      updateProfile: (id, patch) =>
        set((s) => ({
          profiles: s.profiles.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        })),
      removeProfile: (id) =>
        set((s) => ({
          profiles: s.profiles.filter((p) => p.id !== id),
          medications: s.medications.filter((m) => m.profileId !== id),
          doseLogs: s.doseLogs.filter((l) => l.profileId !== id),
          vitals: s.vitals.filter((v) => v.profileId !== id),
          symptoms: s.symptoms.filter((x) => x.profileId !== id),
          appointments: s.appointments.filter((a) => a.profileId !== id),
          documents: s.documents.filter((d) => d.profileId !== id),
          activeProfileId: s.activeProfileId === id ? (s.profiles.find((p) => p.id !== id)?.id ?? null) : s.activeProfileId,
        })),
      addMedication: (m) => {
        const id = uid("m");
        set((s) => ({ medications: [...s.medications, { ...m, id }] }));
        return id;
      },
      updateMedication: (id, patch) =>
        set((s) => ({
          medications: s.medications.map((m) => (m.id === id ? { ...m, ...patch } : m)),
        })),
      removeMedication: (id) =>
        set((s) => ({
          medications: s.medications.filter((m) => m.id !== id),
          doseLogs: s.doseLogs.filter((l) => l.medicationId !== id),
        })),
      takeDose: (slot) => {
        const now = toLocalStamp(new Date());
        set((s) => {
          const med = s.medications.find((m) => m.id === slot.medicationId);
          return {
            doseLogs: upsertLog(s.doseLogs, {
              id: uid("log"),
              medicationId: slot.medicationId,
              profileId: slot.profileId,
              scheduledAt: slot.scheduledAt,
              dueAt: slot.dueAt,
              status: "taken",
              takenAt: now,
            }),
            medications: med
              ? s.medications.map((m) =>
                  m.id === med.id
                    ? { ...m, stockQuantity: Math.max(0, m.stockQuantity - m.perDose) }
                    : m,
                )
              : s.medications,
          };
        });
      },
      skipDose: (slot, reason) =>
        set((s) => ({
          doseLogs: upsertLog(s.doseLogs, {
            id: uid("log"),
            medicationId: slot.medicationId,
            profileId: slot.profileId,
            scheduledAt: slot.scheduledAt,
            dueAt: slot.dueAt,
            status: "skipped",
            skipReason: reason,
          }),
        })),
      postponeDose: (slot, minutes = 15) =>
        set((s) => ({
          doseLogs: upsertLog(s.doseLogs, {
            id: uid("log"),
            medicationId: slot.medicationId,
            profileId: slot.profileId,
            scheduledAt: slot.scheduledAt,
            dueAt: postponeDue(slot.dueAt, minutes),
            status: "postponed",
          }),
        })),
      addVital: (v) => {
        const id = uid("v");
        set((s) => ({ vitals: [ { ...v, id }, ...s.vitals ] }));
        return id;
      },
      removeVital: (id) => set((s) => ({ vitals: s.vitals.filter((v) => v.id !== id) })),
      setThresholds: (profileId, t) =>
        set((s) => ({ thresholds: { ...s.thresholds, [profileId]: t } })),
      addSymptom: (sym) => {
        const id = uid("s");
        set((s) => ({ symptoms: [{ ...sym, id }, ...s.symptoms] }));
        return id;
      },
      removeSymptom: (id) => set((s) => ({ symptoms: s.symptoms.filter((x) => x.id !== id) })),
      addAppointment: (a) => {
        const id = uid("a");
        set((s) => ({ appointments: [...s.appointments, { ...a, id }] }));
        return id;
      },
      updateAppointment: (id, patch) =>
        set((s) => ({
          appointments: s.appointments.map((a) => (a.id === id ? { ...a, ...patch } : a)),
        })),
      removeAppointment: (id) =>
        set((s) => ({ appointments: s.appointments.filter((a) => a.id !== id) })),
      addDocument: (d) => {
        const id = uid("d");
        set((s) => ({ documents: [{ ...d, id }, ...s.documents] }));
        return id;
      },
      removeDocument: (id) =>
        set((s) => ({ documents: s.documents.filter((d) => d.id !== id) })),
      resetDemo: () => set({ ...createSeed(), unlocked: true, hydrated: true }),
    }),
    {
      name: "salus-family-health",
      skipHydration: true,
      partialize: (s) => ({
        hasOnboarded: s.hasOnboarded,
        pinHash: s.pinHash,
        highContrast: s.highContrast,
        largeType: s.largeType,
        activeProfileId: s.activeProfileId,
        profiles: s.profiles,
        medications: s.medications,
        doseLogs: s.doseLogs,
        vitals: s.vitals,
        thresholds: s.thresholds,
        symptoms: s.symptoms,
        appointments: s.appointments,
        documents: s.documents,
      }),
    },
  ),
);

export async function hashPin(pin: string): Promise<string> {
  const data = new TextEncoder().encode(`salus-v1:${pin}`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
