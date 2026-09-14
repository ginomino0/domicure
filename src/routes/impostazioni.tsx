import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import { ProfileAvatar } from "@/components/profile-avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { hashPin, useAppStore } from "@/lib/store";
import { RELATIONSHIP_LABEL } from "@/lib/types";
import { ageYears } from "@/lib/format";

export const Route = createFileRoute("/impostazioni")({ component: Impostazioni });

function Impostazioni() {
  const highContrast = useAppStore((s) => s.highContrast);
  const largeType = useAppStore((s) => s.largeType);
  const pinHash = useAppStore((s) => s.pinHash);
  const mode = useAppStore((s) => s.mode);
  const profiles = useAppStore((s) => s.profiles);
  const setHighContrast = useAppStore((s) => s.setHighContrast);
  const setLargeType = useAppStore((s) => s.setLargeType);
  const setPinHash = useAppStore((s) => s.setPinHash);
  const setMode = useAppStore((s) => s.setMode);
  const removeProfile = useAppStore((s) => s.removeProfile);
  const resetDemo = useAppStore((s) => s.resetDemo);
  const exportBackup = useAppStore((s) => s.exportBackup);
  const importBackup = useAppStore((s) => s.importBackup);
  const lock = useAppStore((s) => s.lock);
  const [pin, setPin] = useState("");
  const [pin2, setPin2] = useState("");
  const [msg, setMsg] = useState("");
  const [profileToDelete, setProfileToDelete] = useState<string | null>(null);
  const [importMsg, setImportMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const deleting = profiles.find((p) => p.id === profileToDelete);

  function handleExport() {
    const json = exportBackup();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `domicura-backup-${stamp}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function handleImportFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const result = importBackup(String(reader.result));
      if (result.ok) {
        setImportMsg("Backup importato correttamente.");
      } else {
        setImportMsg(result.error);
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="stagger-in mx-auto max-w-xl space-y-8">
      <header>
        <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">Privacy</p>
        <h1 className="mt-1 font-display text-4xl font-medium tracking-tight">Impostazioni</h1>
        <p className="mt-2 text-muted-foreground">
          Tutto resta su questo dispositivo. Nessun account, nessun invio in rete.
        </p>
      </header>

      <section className="space-y-4 rounded-xl bg-card p-5 shadow-card">
        <h2 className="font-display text-xl font-medium">Modalità</h2>
        <p className="text-sm text-muted-foreground">
          Usa i dati di esempio per capire come funziona il diario, poi passa alla tua
          scheda personale, vuota e pronta da compilare. Puoi tornare agli esempi in
          qualsiasi momento: i tuoi dati personali restano al sicuro.
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode("demo")}
            className={`flex-1 rounded-lg border px-4 py-3 text-sm font-medium ${
              mode === "demo"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-input bg-background"
            }`}
          >
            Dati di esempio
          </button>
          <button
            type="button"
            onClick={() => setMode("personal")}
            className={`flex-1 rounded-lg border px-4 py-3 text-sm font-medium ${
              mode === "personal"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-input bg-background"
            }`}
          >
            I miei dati
          </button>
        </div>
        {mode === "demo" && (
          <Button variant="outline" onClick={() => resetDemo()}>
            Ripristina diario di esempio
          </Button>
        )}
      </section>

      <section className="space-y-4 rounded-xl bg-card p-5 shadow-card">
        <h2 className="font-display text-xl font-medium">Profili</h2>
        {profiles.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nessun profilo in questa modalità. Aggiungine uno dalla pagina Famiglia.
          </p>
        ) : (
          <ul className="space-y-2">
            {profiles.map((p) => (
              <li
                key={p.id}
                className="flex items-center gap-3 rounded-lg border border-input px-3 py-2.5"
              >
                <ProfileAvatar profile={p} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {RELATIONSHIP_LABEL[p.relationship]} · {ageYears(p.birthDate)} anni
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setProfileToDelete(p.id)}
                >
                  <Trash2 className="size-4" />
                  Elimina
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-4 rounded-xl bg-card p-5 shadow-card">
        <h2 className="font-display text-xl font-medium">Lettura</h2>
        <div className="flex items-center justify-between gap-4">
          <div>
            <Label>Alto contrasto</Label>
            <p className="text-sm text-muted-foreground">Testo più scuro, bordi più netti.</p>
          </div>
          <Switch checked={highContrast} onCheckedChange={setHighContrast} />
        </div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <Label>Carattere grande</Label>
            <p className="text-sm text-muted-foreground">Aumenta la dimensione del testo.</p>
          </div>
          <Switch checked={largeType} onCheckedChange={setLargeType} />
        </div>
      </section>

      <section className="space-y-4 rounded-xl bg-card p-5 shadow-card">
        <h2 className="font-display text-xl font-medium">Blocco PIN</h2>
        <p className="text-sm text-muted-foreground">
          Un codice a 4 cifre protegge l'apertura del diario su questo dispositivo.
        </p>
        {pinHash ? (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => lock()}>
              Blocca ora
            </Button>
            <Button variant="ghost" onClick={() => setPinHash(null)}>
              Rimuovi PIN
            </Button>
          </div>
        ) : (
          <form
            className="grid gap-3"
            onSubmit={async (e) => {
              e.preventDefault();
              if (pin.length !== 4 || pin !== pin2) {
                setMsg("Il PIN deve essere di 4 cifre e coincidere.");
                return;
              }
              setPinHash(await hashPin(pin));
              setPin("");
              setPin2("");
              setMsg("PIN attivo.");
            }}
          >
            <input
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="Nuovo PIN"
              className="h-12 rounded-md border border-input bg-background px-4 tabular-nums"
            />
            <input
              inputMode="numeric"
              maxLength={4}
              value={pin2}
              onChange={(e) => setPin2(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="Conferma PIN"
              className="h-12 rounded-md border border-input bg-background px-4 tabular-nums"
            />
            <Button type="submit">Attiva PIN</Button>
            {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
          </form>
        )}
      </section>

      <section className="space-y-3 rounded-xl bg-card p-5 shadow-card">
        <h2 className="font-display text-xl font-medium">Backup</h2>
        <p className="text-sm text-muted-foreground">
          Esporta tutti i dati (profili, terapie, parametri, appuntamenti, referti e le
          immagini caricate) in un unico file, per averlo al sicuro o per reimportarlo
          rapidamente in caso di problemi.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleExport}>
            Backup dati (esporta)
          </Button>
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            Importa backup
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImportFile(file);
              e.target.value = "";
            }}
          />
        </div>
        {importMsg && <p className="text-sm text-muted-foreground">{importMsg}</p>}
      </section>

      <Dialog open={!!profileToDelete} onOpenChange={(v) => !v && setProfileToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminare {deleting?.name}?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Verranno eliminati in modo permanente anche tutte le terapie, i parametri, i
            sintomi, gli appuntamenti e i documenti collegati a questo profilo. L'azione
            non può essere annullata.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setProfileToDelete(null)}>
              Annulla
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (profileToDelete) removeProfile(profileToDelete);
                setProfileToDelete(null);
              }}
            >
              Elimina definitivamente
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
