import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VitalForm } from "@/components/vital-form";
import { useAppStore } from "@/lib/store";
import { VITAL_META, type Thresholds, type VitalType } from "@/lib/types";
import { isOutOfRange, vitalDisplay } from "@/lib/vitals";
import { formatDayShort, formatTime } from "@/lib/format";

export const Route = createFileRoute("/p/$profileId/parametri")({
  component: ParametriPage,
});

const TYPES: VitalType[] = ["bp", "hr", "glucose", "weight", "temp", "spo2"];

function ParametriPage() {
  const { profileId } = Route.useParams();
  const allVitals = useAppStore((s) => s.vitals);
  const vitals = allVitals.filter((v) => v.profileId === profileId);
  const thresholds = useAppStore((s) => s.thresholds[profileId]);
  const addVital = useAppStore((s) => s.addVital);
  const removeVital = useAppStore((s) => s.removeVital);
  const setThresholds = useAppStore((s) => s.setThresholds);
  const [type, setType] = useState<VitalType>("bp");
  const [open, setOpen] = useState(false);
  const [thOpen, setThOpen] = useState(false);

  const filtered = vitals.filter((v) => v.type === type);
  const chartData = useMemo(
    () =>
      [...filtered]
        .sort((a, b) => a.recordedAt.localeCompare(b.recordedAt))
        .slice(-21)
        .map((v) => ({
          t: formatDayShort(v.recordedAt),
          v: v.type === "bp" ? v.systolic : v.type === "hr" ? v.bpm : v.value,
          d: v.diastolic,
        })),
    [filtered],
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl font-medium">Parametri vitali</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setThOpen(true)}>
            Soglie
          </Button>
          <Button onClick={() => setOpen(true)}>
            <Plus className="size-5" />
            Registra
          </Button>
        </div>
      </div>

      <div className="-mx-1 flex gap-2 overflow-x-auto pb-1">
        {TYPES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`h-11 shrink-0 rounded-full px-4 text-sm font-medium ${
              type === t ? "bg-primary text-primary-foreground" : "bg-muted"
            }`}
          >
            {VITAL_META[t].short}
          </button>
        ))}
      </div>

      {chartData.length >= 2 && (
        <div className="h-52 rounded-xl bg-card p-3 shadow-card">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="t" tick={{ fontSize: 11 }} stroke="currentColor" opacity={0.5} />
              <YAxis tick={{ fontSize: 11 }} stroke="currentColor" opacity={0.5} width={36} />
              <Tooltip />
              <Line type="monotone" dataKey="v" stroke="#1f4f45" strokeWidth={2} dot={false} />
              {type === "bp" && (
                <Line type="monotone" dataKey="d" stroke="#6e3d36" strokeWidth={2} dot={false} />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <ul className="space-y-2">
        {filtered.slice(0, 20).map((v) => {
          const bad = isOutOfRange(v, thresholds);
          return (
            <li
              key={v.id}
              className={`flex items-center justify-between gap-3 rounded-xl bg-card px-4 py-3 shadow-card ${
                bad ? "ring-1 ring-destructive/40" : ""
              }`}
            >
              <div>
                <p className="text-sm text-muted-foreground">
                  {formatDayShort(v.recordedAt)} · {formatTime(v.recordedAt)}
                  {v.context ? ` · ${v.context}` : ""}
                </p>
                <p className={`tabular-nums text-lg font-medium ${bad ? "text-destructive" : ""}`}>
                  {vitalDisplay(v)} {v.unit}
                  {v.type === "bp" && v.bpm ? ` · ${v.bpm} bpm` : ""}
                </p>
                {v.note && <p className="text-sm text-muted-foreground">{v.note}</p>}
              </div>
              <div className="flex items-center gap-2">
                {bad && <Badge variant="danger">Fuori soglia</Badge>}
                <Button variant="ghost" size="sm" onClick={() => removeVital(v.id)}>
                  Elimina
                </Button>
              </div>
            </li>
          );
        })}
        {filtered.length === 0 && (
          <p className="rounded-xl bg-card px-5 py-8 text-center text-muted-foreground shadow-card">
            Nessuna misurazione di questo tipo.
          </p>
        )}
      </ul>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuova misurazione · {VITAL_META[type].label}</DialogTitle>
          </DialogHeader>
          <VitalForm
            type={type}
            onCancel={() => setOpen(false)}
            onSubmit={(v) => {
              addVital({ ...v, profileId });
              setOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>

      {thresholds && (
        <Dialog open={thOpen} onOpenChange={setThOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Soglie di allerta</DialogTitle>
            </DialogHeader>
            <ThresholdForm
              value={thresholds}
              onSave={(t) => {
                setThresholds(profileId, t);
                setThOpen(false);
              }}
              onCancel={() => setThOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function ThresholdForm({
  value,
  onSave,
  onCancel,
}: {
  value: Thresholds;
  onSave: (t: Thresholds) => void;
  onCancel: () => void;
}) {
  const [t, setT] = useState(value);
  function num(key: keyof Thresholds) {
    return (
      <Input
        type="number"
        step="any"
        className="tabular-nums"
        value={t[key] ?? ""}
        onChange={(e) => setT((s) => ({ ...s, [key]: Number(e.target.value) }))}
      />
    );
  }
  return (
    <form
      className="grid gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(t);
      }}
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <Label>PA max sistolica</Label>
          {num("bpSysMax")}
        </div>
        <div className="grid gap-1.5">
          <Label>PA max diastolica</Label>
          {num("bpDiaMax")}
        </div>
        <div className="grid gap-1.5">
          <Label>FC min / max</Label>
          <div className="grid grid-cols-2 gap-2">
            {num("hrMin")}
            {num("hrMax")}
          </div>
        </div>
        <div className="grid gap-1.5">
          <Label>Glicemia max</Label>
          {num("glucoseMax")}
        </div>
        <div className="grid gap-1.5">
          <Label>SpO₂ minima</Label>
          {num("spo2Min")}
        </div>
        <div className="grid gap-1.5">
          <Label>Temperatura max</Label>
          {num("tempMax")}
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Annulla
        </Button>
        <Button type="submit">Salva soglie</Button>
      </div>
    </form>
  );
}
