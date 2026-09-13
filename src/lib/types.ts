export type Relationship =
  | "self"
  | "spouse"
  | "parent"
  | "child"
  | "grandparent"
  | "other";

export type Profile = {
  id: string;
  name: string;
  relationship: Relationship;
  birthDate: string;
  sex: "M" | "F" | "X";
  bloodType?: string;
  notes?: string;
  tone: "forest" | "ink" | "clay" | "slate";
};

export type MedForm =
  | "tablet"
  | "capsule"
  | "drops"
  | "syrup"
  | "injection"
  | "inhaler"
  | "cream"
  | "sachet"
  | "other";

export type ScheduleType =
  | "daily"
  | "interval_hours"
  | "alternate_days"
  | "weekly"
  | "cycle";

export type MedicationSchedule = {
  type: ScheduleType;
  times: string[];
  intervalHours?: number;
  daysOfWeek?: number[];
  cycleOnDays?: number;
  cycleOffDays?: number;
  startDate: string;
  endDate?: string;
};

export type Medication = {
  id: string;
  profileId: string;
  name: string;
  activeIngredient?: string;
  form: MedForm;
  doseAmount: number;
  doseUnit: string;
  instructions: string;
  schedule: MedicationSchedule;
  stockQuantity: number;
  stockUnit: string;
  perDose: number;
  lowThresholdDays: number;
  refillRequested: boolean;
  active: boolean;
};

export type DoseStatus = "taken" | "skipped" | "postponed";

export type DoseLog = {
  id: string;
  medicationId: string;
  profileId: string;
  scheduledAt: string;
  dueAt: string;
  status: DoseStatus;
  takenAt?: string;
  skipReason?: string;
};

export type VitalType = "bp" | "glucose" | "weight" | "temp" | "spo2" | "hr";

export type Vital = {
  id: string;
  profileId: string;
  type: VitalType;
  systolic?: number;
  diastolic?: number;
  bpm?: number;
  value?: number;
  unit: string;
  context?: string;
  note?: string;
  recordedAt: string;
};

export type Thresholds = {
  bpSysMin: number;
  bpSysMax: number;
  bpDiaMin: number;
  bpDiaMax: number;
  hrMin: number;
  hrMax: number;
  glucoseMin: number;
  glucoseMax: number;
  spo2Min: number;
  tempMin: number;
  tempMax: number;
  weightMin?: number;
  weightMax?: number;
};

export type Symptom = {
  id: string;
  profileId: string;
  name: string;
  intensity: number;
  bodyPart?: string;
  note?: string;
  recordedAt: string;
};

export type Reminder = {
  hoursBefore: number;
  label: string;
};

export type Appointment = {
  id: string;
  profileId: string;
  title: string;
  kind: "visit" | "exam" | "procedure";
  doctor?: string;
  facility?: string;
  datetime: string;
  reminders: Reminder[];
  questions: string[];
  notes?: string;
  outcome?: string;
  therapyChanges?: string;
  status: "upcoming" | "done" | "cancelled";
};

export type DocCategory =
  | "blood"
  | "imaging"
  | "prescription"
  | "specialist"
  | "other";

export type ClinicalDocument = {
  id: string;
  profileId: string;
  title: string;
  category: DocCategory;
  date: string;
  facility?: string;
  doctor?: string;
  notes?: string;
  fileName?: string;
  fileData?: string;
};

export type AppData = {
  hasOnboarded: boolean;
  pinHash: string | null;
  highContrast: boolean;
  largeType: boolean;
  activeProfileId: string | null;
  profiles: Profile[];
  medications: Medication[];
  doseLogs: DoseLog[];
  vitals: Vital[];
  thresholds: Record<string, Thresholds>;
  symptoms: Symptom[];
  appointments: Appointment[];
  documents: ClinicalDocument[];
};

export const DEFAULT_THRESHOLDS: Thresholds = {
  bpSysMin: 90,
  bpSysMax: 140,
  bpDiaMin: 60,
  bpDiaMax: 90,
  hrMin: 50,
  hrMax: 100,
  glucoseMin: 70,
  glucoseMax: 140,
  spo2Min: 94,
  tempMin: 36,
  tempMax: 37.5,
};

export const RELATIONSHIP_LABEL: Record<Relationship, string> = {
  self: "Tu",
  spouse: "Coniuge",
  parent: "Genitore",
  child: "Figlio/a",
  grandparent: "Nonno/a",
  other: "Familiare",
};

export const FORM_LABEL: Record<MedForm, string> = {
  tablet: "Compressa",
  capsule: "Capsula",
  drops: "Gocce",
  syrup: "Sciroppo",
  injection: "Iniezione",
  inhaler: "Inalatore",
  cream: "Crema",
  sachet: "Bustina",
  other: "Altro",
};

export const VITAL_META: Record<
  VitalType,
  { label: string; unit: string; short: string }
> = {
  bp: { label: "Pressione arteriosa", unit: "mmHg", short: "PA" },
  hr: { label: "Frequenza cardiaca", unit: "bpm", short: "FC" },
  glucose: { label: "Glicemia", unit: "mg/dL", short: "Glu" },
  weight: { label: "Peso", unit: "kg", short: "Peso" },
  temp: { label: "Temperatura", unit: "°C", short: "T" },
  spo2: { label: "Saturazione", unit: "%", short: "SpO₂" },
};

export const DOC_LABEL: Record<DocCategory, string> = {
  blood: "Analisi del sangue",
  imaging: "Radiografie / RX",
  prescription: "Prescrizioni / Ricette",
  specialist: "Referti specialistici",
  other: "Altro",
};

export const SKIP_REASONS = [
  "Dimenticato",
  "Effetto collaterale",
  "Nausea",
  "Farmaco non disponibile",
  "Pressione / valori fuori soglia",
  "Indicazione del medico",
  "Altro",
] as const;

export const BODY_PARTS = [
  "Testa",
  "Collo",
  "Spalla",
  "Petto",
  "Addome",
  "Schiena",
  "Braccio sinistro",
  "Braccio destro",
  "Mano",
  "Anca",
  "Ginocchio",
  "Gamba sinistra",
  "Gamba destra",
  "Piede",
  "Generalizzato",
] as const;
