import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Printer } from "lucide-react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { adherenceFor } from "@/lib/schedule";
import { formatDayShort, formatLongDate, formatTime, ageYears, toLocalDate } from "@/lib/format";
import { isOutOfRange, vitalDisplay } from "@/lib/vitals";
import { RELATIONSHIP_LABEL, VITAL_META } from "@/lib/types";
import { subDays } from "date-fns";

export const Route = createFileRoute("/p/$profileId/report")({
  component: ReportPage,
});

function ReportPage() {
  const { profileId } = Route.useParams();
  const profile = useAppStore((s) => s.profiles.find((p) => p.id === profileId));
  const allMeds = useAppStore((s) => s.medications);
  const medications = allMeds.filter((m) => m.profileId === profileId && m.active);
  const doseLogs = useAppStore((s) => s.doseLogs);
  const allVitals = useAppStore((s) => s.vitals);
  const vitals = allVitals.filter((v) => v.profileId === profileId);
  const thresholds = useAppStore((s) => s.thresholds[profileId]);
  const allSymptoms = useAppStore((s) => s.symptoms);
  const symptoms = allSymptoms.filter((x) => x.profileId === profileId);
  const [days, setDays] = useState(30);

  const now = new Date();
  const from = subDays(now, days);
  const adh = adherenceFor(allMeds, doseLogs, profileId, from, now);
  const periodVitals = vitals.filter((v) => v.recordedAt >= toLocalDate(from));
  const periodSymptoms = symptoms.filter((s) => s.recordedAt >= toLocalDate(from));
  const bp = useMemo(
    () =>
      periodVitals
        .filter((v) => v.type === "bp")
        .sort((a, b) => a.recordedAt.localeCompare(b.recordedAt))
        .map((v) => ({
          t: formatDayShort(v.recordedAt),
          sys: v.systolic,
          dia: v.diastolic,
        })),
    [periodVitals],
  );

  if (!profile) return null;

  return (
    <div className="space-y-6">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-medium">Report medico</h2>
          <p className="text-sm text-muted-foreground">Sintesi esportabile per la visita.</p>
        </div>
        <div className="flex gap-2">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDays(d)}
              className={`h-11 rounded-full px-4 text-sm font-medium ${
                days === d ? "bg-primary text-primary-foreground" : "bg-muted"
              }`}
            >
              {d} giorni
            </button>
          ))}
          <Button onClick={() => window.print()}>
            <Printer className="size-5" />
            Stampa / PDF
          </Button>
        </div>
      </div>

      <article className="rounded-xl bg-card p-6 shadow-card print:shadow-none">
        <header className="border-b border-border pb-4">
          <p className="font-display text-3xl font-medium">Salus</p>
          <p className="text-sm text-muted-foreground">Diario della salute familiare</p>
          <h3 className="mt-4 font-display text-2xl">{profile.name}</h3>
          <p className="text-sm text-muted-foreground">
            {RELATIONSHIP_LABEL[profile.relationship]} · {ageYears(profile.birthDate)} anni
            {profile.bloodType ? ` · gruppo ${profile.bloodType}` : ""}
          </p>
          <p className="mt-1 text-sm">
            Periodo: {formatLongDate(from)} — {formatLongDate(now)}
          </p>
        </header>

        <section className="mt-6">
          <h4 className="font-display text-xl font-medium">Aderenza alle terapie</h4>
          <p className="mt-2 text-3xl font-display tabular-nums">{adh.percent}%</p>
          <p className="text-sm text-muted-foreground">
            {adh.taken} assunte su {adh.due} previste · {adh.skipped} saltate
          </p>
        </section>

        <section className="mt-6">
          <h4 className="font-display text-xl font-medium">Terapie in corso</h4>
          <ul className="mt-2 divide-y divide-border">
            {medications.map((m) => (
              <li key={m.id} className="py-2 text-sm">
                <span className="font-medium">{m.name}</span> {m.doseAmount} {m.doseUnit}
                {m.instructions ? ` — ${m.instructions}` : ""}
              </li>
            ))}
          </ul>
        </section>

        {bp.length >= 2 && (
          <section className="mt-6 no-print">
            <h4 className="font-display text-xl font-medium">Pressione arteriosa</h4>
            <div className="mt-2 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={bp}>
                  <XAxis dataKey="t" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} width={36} />
                  <Tooltip />
                  <Line type="monotone" dataKey="sys" stroke="#1f4f45" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="dia" stroke="#6e3d36" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        <section className="mt-6">
          <h4 className="font-display text-xl font-medium">Parametri rilevanti</h4>
          <ul className="mt-2 space-y-1 text-sm">
            {periodVitals.slice(0, 16).map((v) => (
              <li key={v.id} className={isOutOfRange(v, thresholds) ? "text-destructive" : ""}>
                {formatDayShort(v.recordedAt)} {formatTime(v.recordedAt)} · {VITAL_META[v.type].label}:{" "}
                <span className="tabular-nums">
                  {vitalDisplay(v)} {v.unit}
                </span>
                {v.context ? ` (${v.context})` : ""}
                {isOutOfRange(v, thresholds) ? " — fuori soglia" : ""}
              </li>
            ))}
            {periodVitals.length === 0 && (
              <li className="text-muted-foreground">Nessun parametro nel periodo.</li>
            )}
          </ul>
        </section>

        <section className="mt-6">
          <h4 className="font-display text-xl font-medium">Sintomi registrati</h4>
          <ul className="mt-2 space-y-1 text-sm">
            {periodSymptoms.map((s) => (
              <li key={s.id}>
                {formatDayShort(s.recordedAt)} · {s.name} ({s.intensity}/10)
                {s.bodyPart ? ` — ${s.bodyPart}` : ""}
              </li>
            ))}
            {periodSymptoms.length === 0 && (
              <li className="text-muted-foreground">Nessun sintomo nel periodo.</li>
            )}
          </ul>
        </section>
      </article>
    </div>
  );
}
