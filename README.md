# Domicura — Diario della salute familiare

App web per gestire in un unico posto le terapie, i parametri vitali, i
sintomi, gli appuntamenti medici e i referti di tutta la famiglia.

È pensata per essere semplice da usare anche da persone anziane (testo
grande, alto contrasto, pulsanti ampi) e per restare completamente privata:
**non c'è nessun account e nessun server**. Tutti i dati vengono salvati
solo sul dispositivo su cui apri l'app.

## Funzionalità

- **Profili familiari**: crea una scheda per ogni persona (tu, coniuge,
  genitore, figlio, nonno, altro familiare), ognuna con le proprie terapie,
  parametri e documenti.
- **Terapie**: archivio farmaci con ricerca, orari anche complessi (ogni N
  ore, giorni alterni, cicli), conferma/rimando/salto di ogni dose con
  motivo, e calcolo automatico dei giorni di scorta rimanenti con avviso
  quando sta per esaurirsi.
- **Parametri vitali**: pressione, frequenza cardiaca, glicemia, peso,
  temperatura e saturazione, con soglie di allerta personalizzabili per
  ogni profilo ed evidenziazione dei valori fuori range.
- **Diario sintomi**: intensità da 1 a 10, parte del corpo interessata e
  correlazione automatica con le ultime assunzioni di farmaco.
- **Agenda visite**: promemoria, domande da preparare per il medico, esito
  della visita e variazioni di terapia.
- **Referti e documenti**: categorie personalizzabili (analisi del sangue,
  radiografie, ricette, oppure una categoria creata da te come "Psichiatra"
  o "Fisiatra"), con possibilità di allegare più foto o file per referto
  (es. le pagine di un documento fotografate con il telefono) e di
  scaricarle riunite in un unico PDF.
- **Report di sintesi**: riepilogo degli ultimi 30 giorni — aderenza alle
  terapie, valori fuori soglia, sintomi registrati — pronto da stampare o
  esportare in PDF prima di una visita.
- **Modalità Esempio / I miei dati**: puoi esplorare l'app con una famiglia
  di esempio già compilata per capire come funziona, poi passare in
  qualsiasi momento alla tua scheda personale, che parte vuota. I due
  archivi restano indipendenti e nessuno dei due viene mai cancellato
  passando dall'uno all'altro.
- **Backup**: esporta tutti i dati (inclusi i documenti e le immagini
  caricate) in un unico file, da reimportare in caso di problemi o per
  spostarli su un altro dispositivo.
- **Blocco con PIN**, modalità alto contrasto e testo grande, per un uso
  più semplice e sicuro.

## Avvio in locale

Richiede [Node.js](https://nodejs.org) 20 o superiore.

```bash
npm install
npm run dev
```

Poi apri http://localhost:8080 nel browser.

## Build di produzione

```bash
npm run build
npm run preview
```

I file pronti per il deploy vengono generati nella cartella `dist/`: è un
sito statico, quindi puoi pubblicarlo ovunque (Vercel, Netlify, GitHub
Pages, un semplice hosting statico, ecc.) senza bisogno di un server
backend.

## Struttura del progetto

- `src/routes/` — le pagine dell'app (Oggi, Famiglia, Agenda, Impostazioni,
  e le sotto-pagine per profilo: Terapie, Parametri, Sintomi, Visite,
  Documenti, Report).
- `src/components/` — componenti UI riutilizzabili (form farmaci, form
  parametri vitali, schermata di blocco con PIN, ecc.).
- `src/lib/store.ts` — lo stato dell'app (Zustand), con salvataggio
  automatico in `localStorage`.
- `src/lib/types.ts` — i modelli dati (profili, farmaci, parametri, sintomi,
  appuntamenti, documenti).
- `src/lib/drugs.ts` — archivio locale di farmaci comuni per la ricerca
  rapida durante l'inserimento di una terapia.
- `src/styles.css` — tema colori e tipografia (Tailwind CSS v4).

## Privacy

Domicura funziona interamente nel browser: non invia dati a nessun server,
non richiede account e non usa servizi in cloud. Tutte le informazioni
restano salvate localmente sul dispositivo che stai usando.
