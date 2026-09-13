export type Drug = {
  name: string;
  ingredient: string;
  form: "tablet" | "capsule" | "drops" | "syrup" | "inhaler" | "injection" | "sachet";
  typicalDose: number;
  unit: string;
  instructions: string;
};

export const DRUG_CATALOG: Drug[] = [
  { name: "Tachipirina 1000", ingredient: "Paracetamolo", form: "tablet", typicalDose: 1000, unit: "mg", instructions: "A stomaco pieno, non superare 3 g/die" },
  { name: "Tachipirina 500", ingredient: "Paracetamolo", form: "tablet", typicalDose: 500, unit: "mg", instructions: "Al bisogno, massimo 3 volte al giorno" },
  { name: "Moment", ingredient: "Ibuprofene", form: "tablet", typicalDose: 400, unit: "mg", instructions: "A stomaco pieno" },
  { name: "Oki", ingredient: "Ketoprofene sale di lisina", form: "sachet", typicalDose: 80, unit: "mg", instructions: "Sciogliere in acqua, a stomaco pieno" },
  { name: "Aspirina", ingredient: "Acido acetilsalicilico", form: "tablet", typicalDose: 500, unit: "mg", instructions: "A stomaco pieno" },
  { name: "Cardioaspirin", ingredient: "Acido acetilsalicilico", form: "tablet", typicalDose: 100, unit: "mg", instructions: "Dopo pranzo, deglutire intera" },
  { name: "Amlodipina", ingredient: "Amlodipina", form: "tablet", typicalDose: 5, unit: "mg", instructions: "Alla stessa ora ogni giorno" },
  { name: "Norvasc", ingredient: "Amlodipina", form: "tablet", typicalDose: 5, unit: "mg", instructions: "Alla stessa ora ogni giorno" },
  { name: "Lisinopril", ingredient: "Lisinopril", form: "tablet", typicalDose: 10, unit: "mg", instructions: "Al mattino, anche a digiuno" },
  { name: "Enapren", ingredient: "Enalapril", form: "tablet", typicalDose: 5, unit: "mg", instructions: "Al mattino" },
  { name: "Triatec", ingredient: "Ramipril", form: "tablet", typicalDose: 5, unit: "mg", instructions: "Alla stessa ora ogni giorno" },
  { name: "Lasix", ingredient: "Furosemide", form: "tablet", typicalDose: 25, unit: "mg", instructions: "Al mattino, può aumentare la diuresi" },
  { name: "Atorvastatina", ingredient: "Atorvastatina", form: "tablet", typicalDose: 20, unit: "mg", instructions: "Alla sera" },
  { name: "Torvast", ingredient: "Atorvastatina", form: "tablet", typicalDose: 20, unit: "mg", instructions: "Alla sera" },
  { name: "Simvastatina", ingredient: "Simvastatina", form: "tablet", typicalDose: 20, unit: "mg", instructions: "Alla sera" },
  { name: "Eutirox", ingredient: "Levotiroxina sodica", form: "tablet", typicalDose: 75, unit: "mcg", instructions: "A digiuno, 30 minuti prima di colazione" },
  { name: "Metformina", ingredient: "Metformina", form: "tablet", typicalDose: 500, unit: "mg", instructions: "A stomaco pieno, durante i pasti" },
  { name: "Gliclazide", ingredient: "Gliclazide", form: "tablet", typicalDose: 30, unit: "mg", instructions: "A colazione" },
  { name: "Lantus", ingredient: "Insulina glargine", form: "injection", typicalDose: 12, unit: "UI", instructions: "Sempre alla stessa ora, ruotare il sito" },
  { name: "NovoRapid", ingredient: "Insulina aspart", form: "injection", typicalDose: 6, unit: "UI", instructions: "Subito prima dei pasti" },
  { name: "Pantoprazolo", ingredient: "Pantoprazolo", form: "tablet", typicalDose: 20, unit: "mg", instructions: "30 minuti prima di colazione" },
  { name: "Pantorc", ingredient: "Pantoprazolo", form: "tablet", typicalDose: 20, unit: "mg", instructions: "30 minuti prima di colazione" },
  { name: "Omeprazolo", ingredient: "Omeprazolo", form: "capsule", typicalDose: 20, unit: "mg", instructions: "Prima di colazione" },
  { name: "Lansoprazolo", ingredient: "Lansoprazolo", form: "capsule", typicalDose: 15, unit: "mg", instructions: "Prima di colazione" },
  { name: "Augmentin", ingredient: "Amoxicillina / acido clavulanico", form: "tablet", typicalDose: 875, unit: "mg", instructions: "A stomaco pieno, completare il ciclo" },
  { name: "Amoxicillina", ingredient: "Amoxicillina", form: "capsule", typicalDose: 1000, unit: "mg", instructions: "A stomaco pieno" },
  { name: "Ventolin", ingredient: "Salbutamolo", form: "inhaler", typicalDose: 100, unit: "mcg", instructions: "1–2 puff, agitare prima dell'uso" },
  { name: "Clenil", ingredient: "Beclometasone", form: "inhaler", typicalDose: 250, unit: "mcg", instructions: "Risciacquare la bocca dopo l'uso" },
  { name: "Coumadin", ingredient: "Warfarin", form: "tablet", typicalDose: 5, unit: "mg", instructions: "Alla stessa ora, controllo INR" },
  { name: "Eliquis", ingredient: "Apixaban", form: "tablet", typicalDose: 5, unit: "mg", instructions: "Due volte al giorno, con o senza cibo" },
  { name: "Xarelto", ingredient: "Rivaroxaban", form: "tablet", typicalDose: 20, unit: "mg", instructions: "A stomaco pieno" },
  { name: "Zoloft", ingredient: "Sertralina", form: "tablet", typicalDose: 50, unit: "mg", instructions: "Al mattino, con o senza cibo" },
  { name: "Xanax", ingredient: "Alprazolam", form: "tablet", typicalDose: 0.25, unit: "mg", instructions: "Secondo prescrizione, non sospendere bruscamente" },
  { name: "Tavor", ingredient: "Lorazepam", form: "tablet", typicalDose: 1, unit: "mg", instructions: "Alla sera se prescritto per il sonno" },
  { name: "Deltacortene", ingredient: "Prednisone", form: "tablet", typicalDose: 25, unit: "mg", instructions: "Al mattino, a stomaco pieno" },
  { name: "Bentelan", ingredient: "Betametasone", form: "tablet", typicalDose: 1, unit: "mg", instructions: "Secondo schema del medico" },
  { name: "Enterogermina", ingredient: "Bacillus clausii", form: "capsule", typicalDose: 2, unit: "mld", instructions: "Lontano dagli antibiotici di almeno 2 ore" },
  { name: "Buscopan", ingredient: "Scopolamina butilbromuro", form: "tablet", typicalDose: 10, unit: "mg", instructions: "Al bisogno per crampi addominali" },
  { name: "Maalox", ingredient: "Alluminio / magnesio idrossido", form: "syrup", typicalDose: 10, unit: "ml", instructions: "Dopo i pasti o al bisogno" },
  { name: "Dibase", ingredient: "Colecalciferolo (vitamina D3)", form: "drops", typicalDose: 25, unit: "gocce", instructions: "Una volta a settimana, a stomaco pieno" },
  { name: "Clexane", ingredient: "Enoxaparina", form: "injection", typicalDose: 4000, unit: "UI", instructions: "Sottocute, ruotare la sede" },
  { name: "Tiklid", ingredient: "Ticlopidina", form: "tablet", typicalDose: 250, unit: "mg", instructions: "A stomaco pieno" },
  { name: "Plavix", ingredient: "Clopidogrel", form: "tablet", typicalDose: 75, unit: "mg", instructions: "Alla stessa ora ogni giorno" },
  { name: "Sintrom", ingredient: "Acenocumarolo", form: "tablet", typicalDose: 4, unit: "mg", instructions: "Alla stessa ora, controllo INR" },
  { name: "Ciproxin", ingredient: "Ciprofloxacina", form: "tablet", typicalDose: 500, unit: "mg", instructions: "Lontano da latte e antiacidi" },
  { name: "Nexium", ingredient: "Esomeprazolo", form: "tablet", typicalDose: 20, unit: "mg", instructions: "Prima di colazione" },
  { name: "Concor", ingredient: "Bisoprololo", form: "tablet", typicalDose: 2.5, unit: "mg", instructions: "Al mattino, controllo frequenza" },
  { name: "Seloken", ingredient: "Metoprololo", form: "tablet", typicalDose: 50, unit: "mg", instructions: "A stomaco pieno" },
  { name: "Dilatrend", ingredient: "Carvedilolo", form: "tablet", typicalDose: 6.25, unit: "mg", instructions: "A stomaco pieno" },
  { name: "Coverlam", ingredient: "Perindopril / amlodipina", form: "tablet", typicalDose: 5, unit: "mg", instructions: "Al mattino" },
];

export function searchDrugs(query: string): Drug[] {
  const q = query.trim().toLowerCase();
  if (!q) return DRUG_CATALOG.slice(0, 12);
  return DRUG_CATALOG.filter(
    (d) =>
      d.name.toLowerCase().includes(q) ||
      d.ingredient.toLowerCase().includes(q),
  ).slice(0, 16);
}
