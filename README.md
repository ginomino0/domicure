# Salus — Diario della salute familiare

App web per gestire terapie, parametri vitali, sintomi, appuntamenti e referti
di più familiari, con conferma dosi, avviso scorte in esaurimento e report
esportabile per il medico.

Questo progetto è la versione **ripulita** di quanto generato da Grok: sono
stati rimossi tutti i riferimenti, le dipendenze e le funzionalità legate alla
piattaforma Grok (autenticazione, PWA installer, hosting Vercel/Nitro,
database Postgres/PGLite lato server) mantenendo intatte grafica e
funzionalità dell'app. È stato inoltre corretto un errore nel codice
originale (una variabile dichiarata due volte) che impediva la build.

L'app ora è una **Single Page Application 100% client-side**: nessun server,
nessun account, nessun login. Tutti i dati restano salvati nel browser del
dispositivo (tramite `localStorage`), esattamente come previsto dal progetto
originale ("Sicurezza locale e offline first").

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
sito statico, quindi puoi pubblicarlo ovunque (Netlify, Vercel, GitHub Pages,
un semplice hosting statico, ecc.) senza bisogno di un server backend.

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
- `src/styles.css` — tema colori/tipografia (Tailwind CSS v4).

## Funzionalità incluse

- **Profili familiari** multipli con avatar e relazione (tu, coniuge,
  genitore, figlio, nonno, altro familiare).
- **Terapie**: archivio farmaci con ricerca, orari complessi (ogni N ore,
  giorni alterni, cicli), conferma/rimando/salto dose con motivo, calcolo
  automatico dei giorni di scorta rimanenti con avviso quando si scende sotto
  la soglia impostata.
- **Parametri vitali**: pressione, frequenza cardiaca, glicemia, peso,
  temperatura, saturazione — con soglie personalizzabili per profilo ed
  evidenziazione dei valori fuori range.
- **Diario sintomi**: intensità 1–10, parte del corpo, correlazione con le
  ultime assunzioni di farmaco.
- **Agenda visite**: promemoria, domande da fare al medico, esito e
  variazioni di terapia post-visita.
- **Referti**: archivio documenti categorizzato con struttura, medico e data.
- **Report di sintesi** per la visita medica, stampabile/esportabile in PDF.
- **Blocco con PIN** e modalità alto contrasto / testo grande per un utilizzo
  più semplice anche da persone anziane.

## Cosa è stato rimosso rispetto alla versione Grok

- Cartella `.grok/` (skill, riferimenti e configurazione della piattaforma).
- Autenticazione (`better-auth`), sessioni, provider OAuth e relativa UI.
- Server TanStack Start, funzioni server, middleware PWA `__grok`.
- Database Postgres/PGLite lato server (non necessario: i dati sono già
  gestiti interamente lato client).
- Configurazione di deploy Vercel/Nitro, script di build specifici di Grok,
  icone e assets del brand Grok.
- Bridge di anteprima (`preview-host-bridge`) usato solo dall'editor Grok.
