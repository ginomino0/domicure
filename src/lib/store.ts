import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  AppData,
  Appointment,
  ClinicalDocument,
  DataMode,
  DataSlice,
  DoseLog,
  Medication,
  Profile,
  Symptom,
  Thresholds,
  Vital,
} from "./types";
import { DEFAULT_THRESHOLDS, DEFAULT_DOCUMENT_CATEGORIES, EMPTY_DATA_SLICE } from "./types";
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
  setMode: (mode: DataMode) => void;
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
  updateDocument: (id: string, patch: Partial<ClinicalDocument>) => void;
  removeDocument: (id: string) => void;
  addDocumentCategory: (name: string) => void;
  resetDemo: () => void;
  exportBackup: () => string;
  importBackup: (json: string) => { ok: true } | { ok: false; error: string };
};

type GlobalSettings = {
  hasOnboarded: boolean;
  pinHash: string | null;
  highContrast: boolean;
  largeType: boolean;
  documentCategories: string[];
};

function sliceFrom(s: AppData): DataSlice {
  return {
    activeProfileId: s.activeProfileId,
    profiles: s.profiles,
    medications: s.medications,
    doseLogs: s.doseLogs,
    vitals: s.vitals,
    thresholds: s.thresholds,
    symptoms: s.symptoms,
    appointments: s.appointments,
    documents: s.documents,
  };
}

const emptyGlobal: GlobalSettings = {
  hasOnboarded: false,
  pinHash: null,
  highContrast: false,
  largeType: false,
  documentCategories: [...DEFAULT_DOCUMENT_CATEGORIES],
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
      ...emptyGlobal,
      ...EMPTY_DATA_SLICE,
      mode: "demo",
      dataCache: {},
      unlocked: true,
      hydrated: false,
      hydrateDone: () => {
        const s = get();
        if (!s.hasOnboarded || s.profiles.length === 0) {
          set({
            ...createSeed(),
            hasOnboarded: true,
            mode: "demo",
            dataCache: {},
            hydrated: true,
            unlocked: !s.pinHash,
          });
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
      setMode: (mode) =>
        set((s) => {
          if (mode === s.mode) return {};
          const current = sliceFrom(s);
          const dataCache = { ...s.dataCache, [s.mode]: current };
          const target = dataCache[mode] ?? (mode === "demo" ? createSeed() : { ...EMPTY_DATA_SLICE });
          return { ...target, mode, dataCache };
        }),
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
        set((s) => ({ vitals: [{ ...v, id }, ...s.vitals] }));
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
      updateDocument: (id, patch) =>
        set((s) => ({
          documents: s.documents.map((d) => (d.id === id ? { ...d, ...patch } : d)),
        })),
      removeDocument: (id) =>
        set((s) => ({ documents: s.documents.filter((d) => d.id !== id) })),
      addDocumentCategory: (name) =>
        set((s) => {
          const clean = name.trim();
          if (!clean) return {};
          const exists = s.documentCategories.some(
            (c) => c.toLowerCase() === clean.toLowerCase(),
          );
          if (exists) return {};
          return { documentCategories: [...s.documentCategories, clean] };
        }),
      resetDemo: () =>
        set((s) => {
          const seed = createSeed();
          const dataCache = { ...s.dataCache, demo: seed };
          if (s.mode === "demo") {
            return { ...seed, dataCache, unlocked: true, hydrated: true };
          }
          return { dataCache };
        }),
      exportBackup: () => {
        const s = get();
        const payload = {
          app: "domicura-backup",
          version: 1,
          exportedAt: new Date().toISOString(),
          hasOnboarded: s.hasOnboarded,
          pinHash: s.pinHash,
          highContrast: s.highContrast,
          largeType: s.largeType,
          documentCategories: s.documentCategories,
          mode: s.mode,
          dataCache: { ...s.dataCache, [s.mode]: sliceFrom(s) },
        };
        return JSON.stringify(payload, null, 2);
      },
      importBackup: (json) => {
        try {
          const parsed = JSON.parse(json);
          if (!parsed || typeof parsed !== "object" || !parsed.dataCache) {
            return { ok: false, error: "Il file non sembra un backup valido." };
          }
          const mode: DataMode = parsed.mode === "personal" ? "personal" : "demo";
          const active = parsed.dataCache[mode] ?? EMPTY_DATA_SLICE;
          set({
            hasOnboarded: true,
            pinHash: parsed.pinHash ?? null,
            highContrast: Boolean(parsed.highContrast),
            largeType: Boolean(parsed.largeType),
            documentCategories:
              Array.isArray(parsed.documentCategories) && parsed.documentCategories.length
                ? parsed.documentCategories
                : [...DEFAULT_DOCUMENT_CATEGORIES],
            mode,
            dataCache: parsed.dataCache,
            ...active,
            unlocked: !parsed.pinHash,
            hydrated: true,
          });
          return { ok: true };
        } catch {
          return { ok: false, error: "Impossibile leggere il file: formato non valido." };
        }
      },
    }),
    {
      name: "domicura-family-health",
      skipHydration: true,
      partialize: (s) => ({
        hasOnboarded: s.hasOnboarded,
        pinHash: s.pinHash,
        highContrast: s.highContrast,
        largeType: s.largeType,
        documentCategories: s.documentCategories,
        mode: s.mode,
        dataCache: s.dataCache,
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
  const data = new TextEncoder().encode(`domicura-v1:${pin}`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
