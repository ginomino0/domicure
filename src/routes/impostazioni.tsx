import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { hashPin, useAppStore } from "@/lib/store";

export const Route = createFileRoute("/impostazioni")({ component: Impostazioni });

function Impostazioni() {
  const highContrast = useAppStore((s) => s.highContrast);
  const largeType = useAppStore((s) => s.largeType);
  const pinHash = useAppStore((s) => s.pinHash);
  const setHighContrast = useAppStore((s) => s.setHighContrast);
  const setLargeType = useAppStore((s) => s.setLargeType);
  const setPinHash = useAppStore((s) => s.setPinHash);
  const resetDemo = useAppStore((s) => s.resetDemo);
  const lock = useAppStore((s) => s.lock);
  const [pin, setPin] = useState("");
  const [pin2, setPin2] = useState("");
  const [msg, setMsg] = useState("");

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
        <h2 className="font-display text-xl font-medium">Dati di esempio</h2>
        <p className="text-sm text-muted-foreground">
          Ripristina la famiglia Bianchi con terapie, parametri e visite già compilati.
        </p>
        <Button variant="outline" onClick={() => resetDemo()}>
          Ripristina diario di esempio
        </Button>
      </section>
    </div>
  );
}
