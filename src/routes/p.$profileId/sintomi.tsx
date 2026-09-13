import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { BodyMap } from "@/components/body-map";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppStore } from "@/lib/store";
import { formatDay, formatTime, asDate, toLocalStamp } from "@/lib/format";
import { recentDosesBefore } from "@/lib/schedule";

export const Route = createFileRoute("/p/$profileId/sintomi")({
  component: SintomiPage,
});

function SintomiPage() {
  const { profileId } = Route.useParams();
  const allSymptoms = useAppStore((s) => s.symptoms);
  const symptoms = allSymptoms.filter((x) => x.profileId === profileId);
  const medications = useAppStore((s) => s.medications);
  const doseLogs = useAppStore((s) => s.doseLogs);
  const addSymptom = useAppStore((s) => s.addSymptom);
  const removeSymptom = useAppStore((s) => s.removeSymptom);
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-medium">Diario sintomi</h2>
        <Button onClick={() => setOpen(true)}>
          <Plus className="size-5" />
          Registra
        </Button>
      </div>

      {symptoms.length === 0 && (
        <p className="rounded-xl bg-card px-5 py-10 text-center text-muted-foreground shadow-card">
          Nessun sintomo registrato.
        </p>
      )}

      {symptoms.map((s) => {
        const related = recentDosesBefore(medications, doseLogs, profileId, asDate(s.recordedAt), 8);
        return (
          <article key={s.id} className="rounded-xl bg-card p-5 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">
                  {formatDay(s.recordedAt)} · {formatTime(s.recordedAt)}
                  {s.bodyPart ? ` · ${s.bodyPart}` : ""}
                </p>
                <h3 className="font-display text-xl font-medium">{s.name}</h3>
                <p className="mt-1 text-sm">
                  Intensità <span className="tabular-nums font-medium">{s.intensity}/10</span>
                </p>
                {s.note && <p className="mt-1 text-sm text-muted-foreground">{s.note}</p>}
              </div>
              <Button variant="ghost" size="sm" onClick={() => removeSymptom(s.id)}>
                Elimina
              </Button>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary"
                style={{ width: `${s.intensity * 10}%` }}
              />
            </div>
            {related.length > 0 && (
              <div className="mt-4 rounded-lg bg-muted px-4 py-3">
                <p className="text-sm font-medium">Assunzioni nelle 8 ore precedenti</p>
                <ul className="mt-1 space-y-1 text-sm text-muted-foreground">
                  {related.map(({ medication, log }) => (
                    <li key={log.id}>
                      {medication.name} {medication.doseAmount} {medication.doseUnit}
                      {log.takenAt ? ` alle ${formatTime(log.takenAt)}` : ""}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </article>
        );
      })}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuovo sintomo</DialogTitle>
          </DialogHeader>
          <SymptomForm
            onCancel={() => setOpen(false)}
            onSave={(draft) => {
              addSymptom({ ...draft, profileId, recordedAt: toLocalStamp(new Date()) });
              setOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SymptomForm({
  onSave,
  onCancel,
}: {
  onSave: (s: { name: string; intensity: number; bodyPart?: string; note?: string }) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [intensity, setIntensity] = useState([5]);
  const [bodyPart, setBodyPart] = useState<string | undefined>();
  const [note, setNote] = useState("");

  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim()) return;
        onSave({
          name: name.trim(),
          intensity: intensity[0] ?? 5,
          bodyPart,
          note: note || undefined,
        });
      }}
    >
      <div className="grid gap-1.5">
        <Label>Sintomo</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="es. mal di testa, nausea, dolore"
          required
        />
      </div>
      <BodyMap value={bodyPart} onChange={setBodyPart} />
      <div className="grid gap-2">
        <Label>Intensità {intensity[0]}/10</Label>
        <Slider min={1} max={10} step={1} value={intensity} onValueChange={setIntensity} />
      </div>
      <div className="grid gap-1.5">
        <Label>Nota</Label>
        <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Annulla
        </Button>
        <Button type="submit">Salva</Button>
      </div>
    </form>
  );
}
