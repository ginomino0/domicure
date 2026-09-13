import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/lib/store";
import { formatDay, formatTime, toLocalStamp, asDate } from "@/lib/format";
import type { Appointment } from "@/lib/types";
import { format } from "date-fns";

export const Route = createFileRoute("/p/$profileId/visite")({
  component: VisitePage,
});

const KIND: Record<Appointment["kind"], string> = {
  visit: "Visita",
  exam: "Esame",
  procedure: "Intervento",
};

function VisitePage() {
  const { profileId } = Route.useParams();
  const allAppointments = useAppStore((s) => s.appointments);
  const list = allAppointments.filter((a) => a.profileId === profileId);
  const addAppointment = useAppStore((s) => s.addAppointment);
  const updateAppointment = useAppStore((s) => s.updateAppointment);
  const removeAppointment = useAppStore((s) => s.removeAppointment);
  const [open, setOpen] = useState(false);
  const [doneId, setDoneId] = useState<string | null>(null);
  const upcoming = list.filter((a) => a.status === "upcoming").sort((a, b) => a.datetime.localeCompare(b.datetime));
  const past = list.filter((a) => a.status !== "upcoming").sort((a, b) => b.datetime.localeCompare(a.datetime));
  const completing = list.find((a) => a.id === doneId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-medium">Visite e esami</h2>
        <Button onClick={() => setOpen(true)}>
          <Plus className="size-5" />
          Nuova
        </Button>
      </div>

      <section className="space-y-3">
        {upcoming.map((a) => (
          <article key={a.id} className="rounded-xl bg-card p-5 shadow-card">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="muted">{KIND[a.kind]}</Badge>
              <span className="text-sm text-muted-foreground">
                {formatDay(a.datetime)} · {formatTime(a.datetime)}
              </span>
            </div>
            <h3 className="mt-1 font-display text-xl font-medium">{a.title}</h3>
            <p className="text-sm text-muted-foreground">
              {[a.doctor, a.facility].filter(Boolean).join(" · ")}
            </p>
            {a.reminders.length > 0 && (
              <ul className="mt-3 space-y-1 text-sm">
                {a.reminders.map((r) => (
                  <li key={r.label}>Promemoria: {r.label}</li>
                ))}
              </ul>
            )}
            {a.questions.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium">Domande per il medico</p>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
                  {a.questions.map((q) => (
                    <li key={q}>{q}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" onClick={() => setDoneId(a.id)}>
                Segna come effettuata
              </Button>
              <Button size="sm" variant="ghost" onClick={() => updateAppointment(a.id, { status: "cancelled" })}>
                Annulla
              </Button>
              <Button size="sm" variant="ghost" onClick={() => removeAppointment(a.id)}>
                Elimina
              </Button>
            </div>
          </article>
        ))}
        {upcoming.length === 0 && (
          <p className="rounded-xl bg-card px-5 py-8 text-center text-muted-foreground shadow-card">
            Nessuna visita in programma.
          </p>
        )}
      </section>

      {past.length > 0 && (
        <section className="space-y-3">
          <h3 className="font-display text-xl font-medium">Storico</h3>
          {past.map((a) => (
            <article key={a.id} className="rounded-xl bg-card p-5 shadow-card">
              <p className="text-sm text-muted-foreground">
                {KIND[a.kind]} · {formatDay(a.datetime)}
                {a.status === "cancelled" ? " · Annullata" : ""}
              </p>
              <h4 className="font-display text-lg font-medium">{a.title}</h4>
              {a.outcome && <p className="mt-2 text-sm">{a.outcome}</p>}
              {a.therapyChanges && (
                <p className="mt-1 text-sm text-muted-foreground">Terapia: {a.therapyChanges}</p>
              )}
            </article>
          ))}
        </section>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuovo appuntamento</DialogTitle>
          </DialogHeader>
          <VisitForm
            onCancel={() => setOpen(false)}
            onSave={(draft) => {
              addAppointment({ ...draft, profileId });
              setOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(completing)} onOpenChange={(v) => !v && setDoneId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Esito della visita</DialogTitle>
          </DialogHeader>
          {completing && (
            <CompleteForm
              onCancel={() => setDoneId(null)}
              onSave={(outcome, therapyChanges) => {
                updateAppointment(completing.id, { status: "done", outcome, therapyChanges });
                setDoneId(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function VisitForm({
  onSave,
  onCancel,
}: {
  onSave: (a: Omit<Appointment, "id" | "profileId">) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<Appointment["kind"]>("visit");
  const [doctor, setDoctor] = useState("");
  const [facility, setFacility] = useState("");
  const [when, setWhen] = useState(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
  const [questions, setQuestions] = useState("");
  const [prep, setPrep] = useState("Promemoria 24h prima");

  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!title.trim()) return;
        onSave({
          title: title.trim(),
          kind,
          doctor: doctor || undefined,
          facility: facility || undefined,
          datetime: toLocalStamp(asDate(when)),
          reminders: prep
            ? [{ hoursBefore: 24, label: prep }]
            : [],
          questions: questions
            .split("\n")
            .map((q) => q.trim())
            .filter(Boolean),
          status: "upcoming",
        });
      }}
    >
      <div className="grid gap-1.5">
        <Label>Titolo</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="es. Controllo cardiologico" />
      </div>
      <div className="grid gap-1.5">
        <Label>Tipo</Label>
        <Select value={kind} onValueChange={(v) => setKind(v as Appointment["kind"])}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="visit">Visita</SelectItem>
            <SelectItem value="exam">Esame</SelectItem>
            <SelectItem value="procedure">Intervento</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-1.5">
        <Label>Data e ora</Label>
        <Input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <Label>Medico</Label>
          <Input value={doctor} onChange={(e) => setDoctor(e.target.value)} />
        </div>
        <div className="grid gap-1.5">
          <Label>Struttura</Label>
          <Input value={facility} onChange={(e) => setFacility(e.target.value)} />
        </div>
      </div>
      <div className="grid gap-1.5">
        <Label>Promemoria / prep-list</Label>
        <Input
          value={prep}
          onChange={(e) => setPrep(e.target.value)}
          placeholder="es. Digiuno 12h prima, portare impegnativa"
        />
      </div>
      <div className="grid gap-1.5">
        <Label>Domande per il medico (una per riga)</Label>
        <Textarea value={questions} onChange={(e) => setQuestions(e.target.value)} rows={3} />
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

function CompleteForm({
  onSave,
  onCancel,
}: {
  onSave: (outcome: string, therapyChanges: string) => void;
  onCancel: () => void;
}) {
  const [outcome, setOutcome] = useState("");
  const [therapy, setTherapy] = useState("");
  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(outcome, therapy);
      }}
    >
      <div className="grid gap-1.5">
        <Label>Esito</Label>
        <Textarea value={outcome} onChange={(e) => setOutcome(e.target.value)} rows={3} />
      </div>
      <div className="grid gap-1.5">
        <Label>Variazioni di terapia</Label>
        <Textarea value={therapy} onChange={(e) => setTherapy(e.target.value)} rows={2} />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Annulla
        </Button>
        <Button type="submit">Archivia</Button>
      </div>
    </form>
  );
}
