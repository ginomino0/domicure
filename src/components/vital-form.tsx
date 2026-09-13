import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Vital, VitalType } from "@/lib/types";
import { VITAL_META } from "@/lib/types";
import { toLocalStamp } from "@/lib/format";

const CONTEXTS = ["a riposo", "a digiuno", "prima dei pasti", "dopo i pasti", "dopo camminata", "sera"];

export function VitalForm({
  type,
  onSubmit,
  onCancel,
}: {
  type: VitalType;
  onSubmit: (v: Omit<Vital, "id" | "profileId">) => void;
  onCancel: () => void;
}) {
  const meta = VITAL_META[type];
  const [sys, setSys] = useState("120");
  const [dia, setDia] = useState("80");
  const [bpm, setBpm] = useState("72");
  const [value, setValue] = useState(
    type === "temp" ? "36.5" : type === "spo2" ? "98" : type === "weight" ? "70" : "100",
  );
  const [context, setContext] = useState("");
  const [note, setNote] = useState("");

  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          type,
          unit: meta.unit,
          systolic: type === "bp" ? Number(sys) : undefined,
          diastolic: type === "bp" ? Number(dia) : undefined,
          bpm: type === "bp" || type === "hr" ? Number(bpm) : undefined,
          value: type === "bp" ? undefined : Number(value),
          context: context || undefined,
          note: note || undefined,
          recordedAt: toLocalStamp(new Date()),
        });
      }}
    >
      {type === "bp" ? (
        <div className="grid grid-cols-3 gap-3">
          <div className="grid gap-1.5">
            <Label>Sistolica</Label>
            <Input inputMode="numeric" value={sys} onChange={(e) => setSys(e.target.value)} className="tabular-nums" />
          </div>
          <div className="grid gap-1.5">
            <Label>Diastolica</Label>
            <Input inputMode="numeric" value={dia} onChange={(e) => setDia(e.target.value)} className="tabular-nums" />
          </div>
          <div className="grid gap-1.5">
            <Label>BPM</Label>
            <Input inputMode="numeric" value={bpm} onChange={(e) => setBpm(e.target.value)} className="tabular-nums" />
          </div>
        </div>
      ) : type === "hr" ? (
        <div className="grid gap-1.5">
          <Label>Frequenza (bpm)</Label>
          <Input inputMode="numeric" value={bpm} onChange={(e) => setBpm(e.target.value)} className="tabular-nums" />
        </div>
      ) : (
        <div className="grid gap-1.5">
          <Label>
            {meta.label} ({meta.unit})
          </Label>
          <Input
            inputMode="decimal"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="tabular-nums"
          />
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {CONTEXTS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setContext(c)}
            className={`h-10 rounded-full px-3 text-sm ${
              context === c ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="grid gap-1.5">
        <Label>Nota</Label>
        <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Annulla
        </Button>
        <Button type="submit">Registra</Button>
      </div>
    </form>
  );
}
