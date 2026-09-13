import { createFileRoute, Link } from "@tanstack/react-router";
import { useAppStore } from "@/lib/store";
import { buildDayPlan, stockDaysLeft, adherenceFor } from "@/lib/schedule";
import { formatDay, formatTime, daysUntil } from "@/lib/format";
import { isOutOfRange, vitalDisplay } from "@/lib/vitals";
import { VITAL_META } from "@/lib/types";
import { subDays } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/p/$profileId/")({
  component: ProfileHome,
});

function ProfileHome() {
  const { profileId } = Route.useParams();
  const profile = useAppStore((s) => s.profiles.find((p) => p.id === profileId));
  const allMedications = useAppStore((s) => s.medications);
  const doseLogs = useAppStore((s) => s.doseLogs);
  const allVitals = useAppStore((s) => s.vitals);
  const thresholds = useAppStore((s) => s.thresholds[profileId]);
  const allSymptoms = useAppStore((s) => s.symptoms);
  const allAppointments = useAppStore((s) => s.appointments);
  const profiles = useAppStore((s) => s.profiles);
  const medications = allMedications.filter((m) => m.profileId === profileId && m.active);
  const vitals = allVitals.filter((v) => v.profileId === profileId);
  const symptoms = allSymptoms.filter((x) => x.profileId === profileId);
  const appointments = allAppointments.filter((a) => a.profileId === profileId);

  if (!profile) return null;

  const now = new Date();
  const plan = buildDayPlan({
    date: now,
    profiles,
    medications,
    doseLogs,
    profileId,
  });
  const pending = plan.filter((s) => s.state !== "taken" && s.state !== "skipped").length;
  const adh = adherenceFor(medications, doseLogs, profileId, subDays(now, 30), now);
  const next = appointments
    .filter((a) => a.status === "upcoming")
    .sort((a, b) => a.datetime.localeCompare(b.datetime))[0];
  const latestByType = ["bp", "weight", "spo2", "glucose", "temp"] as const;
  const alerts = vitals.filter((v) => isOutOfRange(v, thresholds)).slice(0, 4);

  return (
    <div className="space-y-6">
      {profile.notes && (
        <p className="rounded-xl bg-accent px-5 py-4 text-accent-foreground">{profile.notes}</p>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Terapie attive" value={String(medications.length)} />
        <Stat label="Aderenza 30 gg" value={`${adh.percent}%`} />
        <Stat label="Oggi da confermare" value={String(pending)} />
      </div>

      {alerts.length > 0 && (
        <section className="rounded-xl bg-card p-5 shadow-card">
          <h2 className="font-display text-xl font-medium">Valori fuori soglia</h2>
          <ul className="mt-3 space-y-2">
            {alerts.map((v) => (
              <li key={v.id} className="flex justify-between gap-3 text-sm">
                <span>
                  {VITAL_META[v.type].label} · {formatDay(v.recordedAt)}
                </span>
                <span className="tabular-nums font-medium text-destructive">
                  {vitalDisplay(v)} {v.unit}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-xl bg-card p-5 shadow-card">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-medium">Ultimi parametri</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/p/$profileId/parametri" params={{ profileId }}>
              Tutti
            </Link>
          </Button>
        </div>
        <ul className="mt-3 divide-y divide-border">
          {latestByType.map((t) => {
            const v = vitals.find((x) => x.type === t);
            if (!v) return null;
            const bad = isOutOfRange(v, thresholds);
            return (
              <li key={t} className="flex items-center justify-between py-2.5">
                <span className="text-muted-foreground">{VITAL_META[t].label}</span>
                <span className={`tabular-nums font-medium ${bad ? "text-destructive" : ""}`}>
                  {vitalDisplay(v)} {v.unit}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="rounded-xl bg-card p-5 shadow-card">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-medium">Terapie</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/p/$profileId/terapie" params={{ profileId }}>
              Gestisci
            </Link>
          </Button>
        </div>
        <ul className="mt-3 space-y-2">
          {medications.map((m) => {
            const days = stockDaysLeft(m);
            return (
              <li key={m.id} className="flex items-center justify-between gap-3 text-sm">
                <span>
                  {m.name} {m.doseAmount} {m.doseUnit}
                </span>
                {days <= m.lowThresholdDays ? (
                  <Badge variant="warning">{days} gg scorta</Badge>
                ) : (
                  <span className="text-muted-foreground">{days} gg</span>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {next && (
        <section className="rounded-xl bg-card p-5 shadow-card">
          <h2 className="font-display text-xl font-medium">Prossima visita</h2>
          <p className="mt-2 text-lg">{next.title}</p>
          <p className="text-sm text-muted-foreground">
            {formatDay(next.datetime)} alle {formatTime(next.datetime)}
            {daysUntil(next.datetime) >= 0 ? ` · tra ${daysUntil(next.datetime)} giorni` : ""}
          </p>
          {next.questions.length > 0 && (
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
              {next.questions.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ul>
          )}
        </section>
      )}

      {symptoms[0] && (
        <section className="rounded-xl bg-card p-5 shadow-card">
          <h2 className="font-display text-xl font-medium">Ultimo sintomo</h2>
          <p className="mt-2">
            {symptoms[0].name} · intensità {symptoms[0].intensity}/10
            {symptoms[0].bodyPart ? ` · ${symptoms[0].bodyPart}` : ""}
          </p>
          <p className="text-sm text-muted-foreground">{formatDay(symptoms[0].recordedAt)}</p>
        </section>
      )}

      <Button asChild className="w-full" size="lg">
        <Link to="/p/$profileId/report" params={{ profileId }}>
          Prepara report per la visita
        </Link>
      </Button>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-card px-5 py-4 shadow-card">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-3xl font-medium tabular-nums">{value}</p>
    </div>
  );
}
