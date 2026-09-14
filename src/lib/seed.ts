import { addDays, subDays, subHours } from "date-fns";
import type { ClinicalDocument, DataSlice, DoseLog, Medication, Profile, Symptom, Vital } from "./types";
import { DEFAULT_THRESHOLDS } from "./types";
import { toLocalDate, toLocalStamp, applyTime } from "./format";

function at(day: Date, hhmm: string): string {
  return toLocalStamp(applyTime(day, hhmm));
}

function bpSeries(profileId: string, now: Date, days: number, sys: number, dia: number, hr: number): Vital[] {
  const out: Vital[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = subDays(now, i);
    const wobble = Math.round(Math.sin(i * 0.9) * 8 + (i % 5 === 0 ? 14 : 0));
    const sysV = sys + wobble;
    const diaV = dia + Math.round(wobble * 0.4);
    const hrV = hr + Math.round(Math.cos(i * 0.6) * 6);
    out.push({
      id: `v-bp-${profileId}-${i}`,
      profileId,
      type: "bp",
      systolic: sysV,
      diastolic: diaV,
      bpm: hrV,
      unit: "mmHg",
      context: i % 4 === 0 ? "a riposo" : i % 4 === 1 ? "dopo camminata" : undefined,
      recordedAt: at(d, i % 2 === 0 ? "08:15" : "19:40"),
    });
  }
  return out;
}

function weightSeries(profileId: string, now: Date, days: number, base: number): Vital[] {
  const out: Vital[] = [];
  for (let i = days - 1; i >= 0; i -= 3) {
    const d = subDays(now, i);
    const w = Math.round((base + Math.sin(i / 4) * 0.6) * 10) / 10;
    out.push({
      id: `v-w-${profileId}-${i}`,
      profileId,
      type: "weight",
      value: w,
      unit: "kg",
      recordedAt: at(d, "07:40"),
    });
  }
  return out;
}

export function createSeed(now = new Date()): DataSlice {
  const today = now;
  const profiles: Profile[] = [
    {
      id: "p-marco",
      name: "Marco Bianchi",
      relationship: "self",
      birthDate: "1972-03-18",
      sex: "M",
      bloodType: "A+",
      notes: "Ipertensione in terapia. Colesterolo in follow-up.",
      tone: "forest",
    },
    {
      id: "p-chiara",
      name: "Chiara Bianchi",
      relationship: "spouse",
      birthDate: "1975-11-02",
      sex: "F",
      bloodType: "0+",
      notes: "Ipotiroidismo. Eutirox a digiuno.",
      tone: "ink",
    },
    {
      id: "p-teresa",
      name: "Teresa Bianchi",
      relationship: "parent",
      birthDate: "1947-06-21",
      sex: "F",
      bloodType: "A+",
      notes: "Scompenso lieve, diuretico al mattino. Vigila pressione e peso.",
      tone: "clay",
    },
    {
      id: "p-luca",
      name: "Luca Bianchi",
      relationship: "child",
      birthDate: "2010-09-09",
      sex: "M",
      notes: "Asma lieve. Inalatore al bisogno e due volte al giorno in stagione.",
      tone: "slate",
    },
  ];

  const medications: Medication[] = [
    {
      id: "m-marco-amlo",
      profileId: "p-marco",
      name: "Amlodipina",
      activeIngredient: "Amlodipina",
      form: "tablet",
      doseAmount: 5,
      doseUnit: "mg",
      instructions: "Alla stessa ora ogni giorno",
      schedule: { type: "daily", times: ["08:00"], startDate: toLocalDate(subDays(today, 120)) },
      stockQuantity: 18,
      stockUnit: "compresse",
      perDose: 1,
      lowThresholdDays: 3,
      refillRequested: false,
      active: true,
    },
    {
      id: "m-marco-ator",
      profileId: "p-marco",
      name: "Atorvastatina",
      activeIngredient: "Atorvastatina",
      form: "tablet",
      doseAmount: 20,
      doseUnit: "mg",
      instructions: "Alla sera",
      schedule: { type: "daily", times: ["21:00"], startDate: toLocalDate(subDays(today, 90)) },
      stockQuantity: 26,
      stockUnit: "compresse",
      perDose: 1,
      lowThresholdDays: 3,
      refillRequested: false,
      active: true,
    },
    {
      id: "m-chiara-eu",
      profileId: "p-chiara",
      name: "Eutirox",
      activeIngredient: "Levotiroxina sodica",
      form: "tablet",
      doseAmount: 75,
      doseUnit: "mcg",
      instructions: "A digiuno, 30 minuti prima di colazione",
      schedule: { type: "daily", times: ["07:00"], startDate: toLocalDate(subDays(today, 400)) },
      stockQuantity: 41,
      stockUnit: "compresse",
      perDose: 1,
      lowThresholdDays: 3,
      refillRequested: false,
      active: true,
    },
    {
      id: "m-teresa-panto",
      profileId: "p-teresa",
      name: "Pantoprazolo",
      activeIngredient: "Pantoprazolo",
      form: "tablet",
      doseAmount: 20,
      doseUnit: "mg",
      instructions: "30 minuti prima di colazione",
      schedule: { type: "daily", times: ["07:30"], startDate: toLocalDate(subDays(today, 60)) },
      stockQuantity: 22,
      stockUnit: "compresse",
      perDose: 1,
      lowThresholdDays: 3,
      refillRequested: false,
      active: true,
    },
    {
      id: "m-teresa-amlo",
      profileId: "p-teresa",
      name: "Amlodipina",
      activeIngredient: "Amlodipina",
      form: "tablet",
      doseAmount: 5,
      doseUnit: "mg",
      instructions: "Al mattino, con un sorso d'acqua",
      schedule: { type: "daily", times: ["08:00"], startDate: toLocalDate(subDays(today, 200)) },
      stockQuantity: 9,
      stockUnit: "compresse",
      perDose: 1,
      lowThresholdDays: 3,
      refillRequested: false,
      active: true,
    },
    {
      id: "m-teresa-lasix",
      profileId: "p-teresa",
      name: "Lasix",
      activeIngredient: "Furosemide",
      form: "tablet",
      doseAmount: 25,
      doseUnit: "mg",
      instructions: "Al mattino, può aumentare la diuresi",
      schedule: { type: "daily", times: ["08:00"], startDate: toLocalDate(subDays(today, 80)) },
      stockQuantity: 2,
      stockUnit: "compresse",
      perDose: 1,
      lowThresholdDays: 3,
      refillRequested: false,
      active: true,
    },
    {
      id: "m-teresa-cardio",
      profileId: "p-teresa",
      name: "Cardioaspirin",
      activeIngredient: "Acido acetilsalicilico",
      form: "tablet",
      doseAmount: 100,
      doseUnit: "mg",
      instructions: "Dopo pranzo, deglutire intera",
      schedule: { type: "daily", times: ["12:30"], startDate: toLocalDate(subDays(today, 200)) },
      stockQuantity: 16,
      stockUnit: "compresse",
      perDose: 1,
      lowThresholdDays: 3,
      refillRequested: false,
      active: true,
    },
    {
      id: "m-teresa-d3",
      profileId: "p-teresa",
      name: "Dibase",
      activeIngredient: "Colecalciferolo",
      form: "drops",
      doseAmount: 25,
      doseUnit: "gocce",
      instructions: "Dopo pranzo",
      schedule: {
        type: "weekly",
        times: ["13:00"],
        daysOfWeek: [0],
        startDate: toLocalDate(subDays(today, 90)),
      },
      stockQuantity: 40,
      stockUnit: "ml",
      perDose: 1,
      lowThresholdDays: 7,
      refillRequested: false,
      active: true,
    },
    {
      id: "m-luca-vent",
      profileId: "p-luca",
      name: "Ventolin",
      activeIngredient: "Salbutamolo",
      form: "inhaler",
      doseAmount: 100,
      doseUnit: "mcg",
      instructions: "1–2 puff, agitare prima dell'uso",
      schedule: { type: "daily", times: ["08:00", "20:00"], startDate: toLocalDate(subDays(today, 14)) },
      stockQuantity: 120,
      stockUnit: "puff",
      perDose: 2,
      lowThresholdDays: 5,
      refillRequested: false,
      active: true,
    },
    {
      id: "m-marco-aug",
      profileId: "p-marco",
      name: "Augmentin",
      activeIngredient: "Amoxicillina / acido clavulanico",
      form: "tablet",
      doseAmount: 875,
      doseUnit: "mg",
      instructions: "A stomaco pieno, completare il ciclo",
      schedule: {
        type: "cycle",
        times: ["08:00", "20:00"],
        cycleOnDays: 6,
        cycleOffDays: 0,
        startDate: toLocalDate(subDays(today, 2)),
        endDate: toLocalDate(addDays(today, 3)),
      },
      stockQuantity: 8,
      stockUnit: "compresse",
      perDose: 1,
      lowThresholdDays: 2,
      refillRequested: false,
      active: true,
    },
  ];

  const taken = (
    medId: string,
    profileId: string,
    scheduledAt: string,
    takenAt: string,
  ): DoseLog => ({
    id: `log-${medId}-${scheduledAt}`,
    medicationId: medId,
    profileId,
    scheduledAt,
    dueAt: scheduledAt,
    status: "taken",
    takenAt,
  });

  const skipped = (
    medId: string,
    profileId: string,
    scheduledAt: string,
    reason: string,
  ): DoseLog => ({
    id: `log-s-${medId}-${scheduledAt}`,
    medicationId: medId,
    profileId,
    scheduledAt,
    dueAt: scheduledAt,
    status: "skipped",
    skipReason: reason,
  });

  const doseLogs: DoseLog[] = [];
  for (let i = 1; i <= 10; i += 1) {
    const d = subDays(today, i);
    doseLogs.push(
      taken("m-marco-amlo", "p-marco", at(d, "08:00"), at(d, "08:04")),
      taken("m-marco-ator", "p-marco", at(d, "21:00"), at(d, "21:10")),
      taken("m-chiara-eu", "p-chiara", at(d, "07:00"), at(d, "07:05")),
      taken("m-teresa-panto", "p-teresa", at(d, "07:30"), at(d, "07:32")),
      taken("m-teresa-amlo", "p-teresa", at(d, "08:00"), at(d, "08:12")),
      i === 3
        ? skipped("m-teresa-lasix", "p-teresa", at(d, "08:00"), "Dimenticato")
        : taken("m-teresa-lasix", "p-teresa", at(d, "08:00"), at(d, "08:14")),
      taken("m-teresa-cardio", "p-teresa", at(d, "12:30"), at(d, "12:40")),
      taken("m-luca-vent", "p-luca", at(d, "08:00"), at(d, "08:06")),
      taken("m-luca-vent", "p-luca", at(d, "20:00"), at(d, "20:05")),
    );
  }

  // Today: mornings taken, Lasix still open so it can be overdue/pending, evening pending
  doseLogs.push(
    taken("m-chiara-eu", "p-chiara", at(today, "07:00"), at(today, "07:03")),
    taken("m-teresa-panto", "p-teresa", at(today, "07:30"), at(today, "07:35")),
    taken("m-marco-amlo", "p-marco", at(today, "08:00"), at(today, "08:07")),
    taken("m-luca-vent", "p-luca", at(today, "08:00"), at(today, "08:10")),
    taken("m-marco-aug", "p-marco", at(today, "08:00"), at(today, "08:08")),
  );
  if (today.getHours() >= 13) {
    doseLogs.push(
      taken("m-teresa-cardio", "p-teresa", at(today, "12:30"), at(today, "12:38")),
    );
  }

  const vitals: Vital[] = [
    ...bpSeries("p-teresa", today, 21, 138, 82, 74),
    ...bpSeries("p-marco", today, 14, 128, 78, 68),
    ...weightSeries("p-teresa", today, 21, 64.2),
    ...weightSeries("p-marco", today, 18, 81.4),
    ...weightSeries("p-chiara", today, 15, 61.0),
    {
      id: "v-t-spo",
      profileId: "p-teresa",
      type: "spo2",
      value: 96,
      unit: "%",
      context: "a riposo",
      recordedAt: at(today, "08:20"),
    },
    {
      id: "v-t-temp",
      profileId: "p-teresa",
      type: "temp",
      value: 36.4,
      unit: "°C",
      recordedAt: at(subDays(today, 1), "21:00"),
    },
    {
      id: "v-c-glu",
      profileId: "p-chiara",
      type: "glucose",
      value: 98,
      unit: "mg/dL",
      context: "a digiuno",
      recordedAt: at(subDays(today, 2), "07:20"),
    },
    {
      id: "v-t-glu",
      profileId: "p-teresa",
      type: "glucose",
      value: 162,
      unit: "mg/dL",
      context: "dopo pasto",
      note: "Pranzo abbondante",
      recordedAt: at(subDays(today, 4), "15:10"),
    },
  ];

  const symptoms: Symptom[] = [
    {
      id: "s1",
      profileId: "p-teresa",
      name: "Mal di testa",
      intensity: 6,
      bodyPart: "Testa",
      note: "Pulsante, lato destro",
      recordedAt: toLocalStamp(subHours(today, 5)),
    },
    {
      id: "s2",
      profileId: "p-teresa",
      name: "Dolore ginocchio",
      intensity: 4,
      bodyPart: "Ginocchio",
      recordedAt: at(subDays(today, 1), "18:20"),
    },
    {
      id: "s3",
      profileId: "p-chiara",
      name: "Nausea",
      intensity: 3,
      bodyPart: "Addome",
      note: "Lieve, dopo la compressa del mattino",
      recordedAt: at(today, "07:40"),
    },
    {
      id: "s4",
      profileId: "p-luca",
      name: "Tosse secca",
      intensity: 5,
      bodyPart: "Petto",
      recordedAt: at(subDays(today, 2), "22:00"),
    },
  ];

  const documents: ClinicalDocument[] = [
    {
      id: "d1",
      profileId: "p-teresa",
      title: "Esami ematochimici",
      category: "Analisi del sangue",
      files: [],
      date: toLocalDate(subDays(today, 18)),
      facility: "Lab. San Luca",
      doctor: "Dr. Ferraro",
      notes: "Creatinina nella norma, colesterolo LDL 118",
    },
    {
      id: "d2",
      profileId: "p-teresa",
      title: "ECG a riposo",
      category: "Radiografie / RX",
      files: [],
      date: toLocalDate(subDays(today, 40)),
      facility: "Cardiologia Ospedale Civile",
      doctor: "Dr.ssa Greco",
    },
    {
      id: "d3",
      profileId: "p-marco",
      title: "Ricetta Amlodipina 5 mg",
      category: "Prescrizioni / Ricette",
      files: [],
      date: toLocalDate(subDays(today, 6)),
      facility: "MMG Dr. Conti",
      doctor: "Dr. Conti",
    },
    {
      id: "d4",
      profileId: "p-chiara",
      title: "TSH / FT4",
      category: "Analisi del sangue",
      files: [],
      date: toLocalDate(subDays(today, 50)),
      facility: "Lab. San Luca",
      doctor: "Dr.ssa Marini",
      notes: "TSH 2.1 — terapia confermata",
    },
    {
      id: "d5",
      profileId: "p-teresa",
      title: "Visita cardiologica",
      category: "Referti specialistici",
      files: [],
      date: toLocalDate(subDays(today, 40)),
      facility: "Cardiologia Ospedale Civile",
      doctor: "Dr.ssa Greco",
    },
  ];

  return {
    activeProfileId: "p-teresa",
    profiles,
    medications,
    doseLogs,
    vitals,
    thresholds: {
      "p-marco": { ...DEFAULT_THRESHOLDS, bpSysMax: 135 },
      "p-chiara": { ...DEFAULT_THRESHOLDS },
      "p-teresa": { ...DEFAULT_THRESHOLDS, bpSysMax: 140, bpDiaMax: 90, weightMax: 66 },
      "p-luca": { ...DEFAULT_THRESHOLDS },
    },
    symptoms,
    appointments: [
      {
        id: "a1",
        profileId: "p-marco",
        title: "Analisi del sangue",
        kind: "exam",
        doctor: "Lab. San Luca",
        facility: "Lab. San Luca — Via Roma 12",
        datetime: at(addDays(today, 1), "07:45"),
        reminders: [
          { hoursBefore: 12, label: "Digiuno da 12 ore" },
          { hoursBefore: 24, label: "Portare impegnativa" },
        ],
        questions: ["Consegnare ricetta del MMG", "Chiedere copia per il cardiologo"],
        status: "upcoming",
        files: [],
      },
      {
        id: "a2",
        profileId: "p-teresa",
        title: "Controllo cardiologico",
        kind: "visit",
        doctor: "Dr.ssa Greco",
        facility: "Cardiologia Ospedale Civile",
        datetime: at(addDays(today, 5), "10:30"),
        reminders: [
          { hoursBefore: 24, label: "Promemoria visita" },
          { hoursBefore: 2, label: "Portare diario pressione e elenco farmaci" },
        ],
        questions: [
          "Lasix al mattino: si può ridurre?",
          "Gonfiore alle caviglie la sera",
          "Il mal di testa di questi giorni è da pressione?",
        ],
        notes: "Portare ultimi esami e diario PA",
        status: "upcoming",
        files: [],
      },
      {
        id: "a3",
        profileId: "p-chiara",
        title: "Endocrinologo",
        kind: "visit",
        doctor: "Dr.ssa Marini",
        facility: "Ambulatorio endocrinologia",
        datetime: at(addDays(today, 12), "16:00"),
        reminders: [{ hoursBefore: 24, label: "Promemoria visita" }],
        questions: ["Confermare dosaggio Eutirox 75", "Ultimo TSH"],
        status: "upcoming",
        files: [],
      },
      {
        id: "a4",
        profileId: "p-teresa",
        title: "Visita cardiologica",
        kind: "visit",
        doctor: "Dr.ssa Greco",
        facility: "Cardiologia Ospedale Civile",
        datetime: at(subDays(today, 40), "11:00"),
        reminders: [],
        questions: [],
        outcome: "Fibrillazione assente. Confermata terapia. Controllo tra 6 mesi.",
        therapyChanges: "Nessuna variazione. Attenzione al peso e alla diuresi.",
        status: "done",
        files: [],
      },
      {
        id: "a5",
        profileId: "p-luca",
        title: "Pneumologo — follow-up asma",
        kind: "visit",
        doctor: "Dr. Albani",
        facility: "Pediatria / Pneumologia",
        datetime: at(addDays(today, 20), "15:15"),
        reminders: [{ hoursBefore: 24, label: "Portare inalatore" }],
        questions: ["Uso del Ventolin in aumento questa settimana"],
        status: "upcoming",
        files: [],
      },
    ],
    documents,
  };
}
