import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DrugSearch } from "./drug-search";
import type { MedForm, Medication, ScheduleType } from "@/lib/types";
import { FORM_LABEL } from "@/lib/types";
import { toLocalDate } from "@/lib/format";
import type { Drug } from "@/lib/drugs";

const WEEK = [
  { v: 1, l: "Lun" },
  { v: 2, l: "Mar" },
  { v: 3, l: "Mer" },
  { v: 4, l: "Gio" },
  { v: 5, l: "Ven" },
  { v: 6, l: "Sab" },
  { v: 0, l: "Dom" },
];

export type MedDraft = Omit<Medication, "id" | "profileId">;

const empty = (): MedDraft => ({
  name: "",
  activeIngredient: "",
  form: "tablet",
  doseAmount: 1,
  doseUnit: "mg",
  instructions: "",
  schedule: { type: "daily", times: ["08:00"], startDate: toLocalDate(new Date()) },
  stockQuantity: 30,
  stockUnit: "compresse",
  perDose: 1,
  lowThresholdDays: 3,
  refillRequested: false,
  active: true,
});

export function MedicationForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: MedDraft;
  onSubmit: (draft: MedDraft) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<MedDraft>(initial ?? empty());
  const timesText = draft.schedule.times.join(", ");

  function applyDrug(d: Drug) {
    setDraft((s) => ({
      ...s,
      name: d.name,
      activeIngredient: d.ingredient,
      form: d.form as MedForm,
      doseAmount: d.typicalDose,
      doseUnit: d.unit,
      instructions: d.instructions,
    }));
  }

  function setTimes(text: string) {
    const times = text
      .split(/[,\s]+/)
      .map((t) => t.trim())
      .filter((t) => /^\d{1,2}:\d{2}$/.test(t));
    setDraft((s) => ({ ...s, schedule: { ...s.schedule, times: times.length ? times : s.schedule.times } }));
  }

  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!draft.name.trim()) return;
        onSubmit(draft);
      }}
    >
      <div className="grid gap-1.5">
        <Label>Farmaco</Label>
        <DrugSearch value={draft.name} onValue={(name) => setDraft((s) => ({ ...s, name }))} onPick={applyDrug} />
      </div>
      <div className="grid gap-1.5">
        <Label>Principio attivo</Label>
        <Input
          value={draft.activeIngredient ?? ""}
          onChange={(e) => setDraft((s) => ({ ...s, activeIngredient: e.target.value }))}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <Label>Dose</Label>
          <Input
            type="number"
            step="any"
            value={draft.doseAmount}
            onChange={(e) => setDraft((s) => ({ ...s, doseAmount: Number(e.target.value) }))}
          />
        </div>
        <div className="grid gap-1.5">
          <Label>Unità</Label>
          <Input value={draft.doseUnit} onChange={(e) => setDraft((s) => ({ ...s, doseUnit: e.target.value }))} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <Label>Forma</Label>
          <Select
            value={draft.form}
            onValueChange={(v) => setDraft((s) => ({ ...s, form: v as MedForm }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(FORM_LABEL) as MedForm[]).map((f) => (
                <SelectItem key={f} value={f}>
                  {FORM_LABEL[f]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5">
          <Label>Per assunzione</Label>
          <Input
            type="number"
            step="any"
            value={draft.perDose}
            onChange={(e) => setDraft((s) => ({ ...s, perDose: Number(e.target.value) }))}
          />
        </div>
      </div>
      <div className="grid gap-1.5">
        <Label>Raccomandazione</Label>
        <Textarea
          value={draft.instructions}
          onChange={(e) => setDraft((s) => ({ ...s, instructions: e.target.value }))}
          rows={2}
        />
      </div>
      <div className="grid gap-1.5">
        <Label>Frequenza</Label>
        <Select
          value={draft.schedule.type}
          onValueChange={(v) =>
            setDraft((s) => ({ ...s, schedule: { ...s.schedule, type: v as ScheduleType } }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Ogni giorno</SelectItem>
            <SelectItem value="interval_hours">Ogni N ore</SelectItem>
            <SelectItem value="alternate_days">A giorni alterni</SelectItem>
            <SelectItem value="weekly">Giorni della settimana</SelectItem>
            <SelectItem value="cycle">Ciclo on/off</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {draft.schedule.type !== "interval_hours" && (
        <div className="grid gap-1.5">
          <Label>Orari (HH:mm, separati da virgola)</Label>
          <Input defaultValue={timesText} onBlur={(e) => setTimes(e.target.value)} />
        </div>
      )}
      {draft.schedule.type === "interval_hours" && (
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-1.5">
            <Label>Ogni (ore)</Label>
            <Input
              type="number"
              value={draft.schedule.intervalHours ?? 8}
              onChange={(e) =>
                setDraft((s) => ({
                  ...s,
                  schedule: { ...s.schedule, intervalHours: Number(e.target.value) },
                }))
              }
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Prima ora</Label>
            <Input
              type="time"
              value={draft.schedule.times[0] ?? "08:00"}
              onChange={(e) =>
                setDraft((s) => ({ ...s, schedule: { ...s.schedule, times: [e.target.value] } }))
              }
            />
          </div>
        </div>
      )}
      {draft.schedule.type === "weekly" && (
        <div className="flex flex-wrap gap-2">
          {WEEK.map((d) => {
            const on = draft.schedule.daysOfWeek?.includes(d.v);
            return (
              <button
                key={d.v}
                type="button"
                onClick={() => {
                  const cur = new Set(draft.schedule.daysOfWeek ?? []);
                  if (cur.has(d.v)) cur.delete(d.v);
                  else cur.add(d.v);
                  setDraft((s) => ({ ...s, schedule: { ...s.schedule, daysOfWeek: [...cur] } }));
                }}
                className={`h-10 min-w-12 rounded-md px-3 text-sm ${
                  on ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                }`}
              >
                {d.l}
              </button>
            );
          })}
        </div>
      )}
      {draft.schedule.type === "cycle" && (
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-1.5">
            <Label>Giorni di terapia</Label>
            <Input
              type="number"
              value={draft.schedule.cycleOnDays ?? 5}
              onChange={(e) =>
                setDraft((s) => ({
                  ...s,
                  schedule: { ...s.schedule, cycleOnDays: Number(e.target.value) },
                }))
              }
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Giorni di pausa</Label>
            <Input
              type="number"
              value={draft.schedule.cycleOffDays ?? 2}
              onChange={(e) =>
                setDraft((s) => ({
                  ...s,
                  schedule: { ...s.schedule, cycleOffDays: Number(e.target.value) },
                }))
              }
            />
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <Label>Scorta</Label>
          <Input
            type="number"
            step="any"
            value={draft.stockQuantity}
            onChange={(e) => setDraft((s) => ({ ...s, stockQuantity: Number(e.target.value) }))}
          />
        </div>
        <div className="grid gap-1.5">
          <Label>Unità scorta</Label>
          <Input
            value={draft.stockUnit}
            onChange={(e) => setDraft((s) => ({ ...s, stockUnit: e.target.value }))}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Annulla
        </Button>
        <Button type="submit">Salva terapia</Button>
      </div>
    </form>
  );
}
