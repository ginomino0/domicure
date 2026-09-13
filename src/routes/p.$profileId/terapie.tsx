import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MedicationForm, type MedDraft } from "@/components/medication-form";
import { useAppStore } from "@/lib/store";
import { describeSchedule, stockDaysLeft } from "@/lib/schedule";
import { FORM_LABEL } from "@/lib/types";

export const Route = createFileRoute("/p/$profileId/terapie")({
  component: TerapiePage,
});

function TerapiePage() {
  const { profileId } = Route.useParams();
  const allMedications = useAppStore((s) => s.medications);
  const medications = allMedications.filter((m) => m.profileId === profileId);
  const addMedication = useAppStore((s) => s.addMedication);
  const updateMedication = useAppStore((s) => s.updateMedication);
  const removeMedication = useAppStore((s) => s.removeMedication);
  const [open, setOpen] = useState(false);

  function save(draft: MedDraft) {
    addMedication({ ...draft, profileId });
    setOpen(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-medium">Terapie attive</h2>
        <Button onClick={() => setOpen(true)}>
          <Plus className="size-5" />
          Nuova
        </Button>
      </div>

      {medications.length === 0 && (
        <p className="rounded-xl bg-card px-5 py-10 text-center text-muted-foreground shadow-card">
          Nessun farmaco in archivio. Aggiungi la prima terapia.
        </p>
      )}

      {medications.map((m) => {
        const days = stockDaysLeft(m);
        const low = days <= m.lowThresholdDays;
        return (
          <article key={m.id} className="rounded-xl bg-card p-5 shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-xl font-medium">{m.name}</h3>
                  {!m.active && <Badge variant="muted">Sospesa</Badge>}
                  {low && <Badge variant="warning">Scorta bassa</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">
                  {m.activeIngredient} · {m.doseAmount} {m.doseUnit} · {FORM_LABEL[m.form]}
                </p>
                <p className="mt-1 text-sm">{describeSchedule(m)}</p>
                {m.instructions && (
                  <p className="mt-1 text-sm text-muted-foreground">{m.instructions}</p>
                )}
              </div>
              <div className="text-right">
                <p className={`tabular-nums text-lg font-medium ${low ? "text-warning" : ""}`}>
                  {m.stockQuantity} {m.stockUnit}
                </p>
                <p className="text-sm text-muted-foreground">
                  {Number.isFinite(days) ? `${days} giorni` : "n.d."}
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {low && !m.refillRequested && (
                <Button size="sm" variant="outline" onClick={() => updateMedication(m.id, { refillRequested: true })}>
                  Segna ricetta richiesta
                </Button>
              )}
              {m.refillRequested && <Badge>Ricetta richiesta</Badge>}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => updateMedication(m.id, { active: !m.active })}
              >
                {m.active ? "Sospendi" : "Riattiva"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => updateMedication(m.id, { stockQuantity: m.stockQuantity + 30 })}
              >
                +30 scorta
              </Button>
              <Button size="sm" variant="ghost" onClick={() => removeMedication(m.id)}>
                Elimina
              </Button>
            </div>
          </article>
        );
      })}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nuova terapia</DialogTitle>
          </DialogHeader>
          <MedicationForm onSubmit={save} onCancel={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
