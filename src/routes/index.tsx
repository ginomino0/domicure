import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, CalendarDays, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { DoseCard } from "@/components/dose-card";
import { ProfileAvatar } from "@/components/profile-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { buildDayPlan, stockDaysLeft } from "@/lib/schedule";
import { formatDay, greeting, formatTime, daysUntil } from "@/lib/format";

export const Route = createFileRoute("/")({ component: Oggi });

function Oggi() {
  const profiles = useAppStore((s) => s.profiles);
  const medications = useAppStore((s) => s.medications);
  const doseLogs = useAppStore((s) => s.doseLogs);
  const appointments = useAppStore((s) => s.appointments);
  const [filter, setFilter] = useState<string | "all">("all");

  const now = new Date();
  const slots = useMemo(
    () =>
      buildDayPlan({
        date: now,
        now,
        profiles,
        medications,
        doseLogs,
        profileId: filter === "all" ? null : filter,
      }),
    [profiles, medications, doseLogs, filter, now.getHours(), now.getMinutes()],
  );

  const open = slots.filter((s) => s.state === "pending" || s.state === "overdue" || s.state === "postponed");
  const done = slots.filter((s) => s.state === "taken" || s.state === "skipped");
  const overdue = open.filter((s) => s.state === "overdue");
  const lowStock = medications.filter((m) => m.active && stockDaysLeft(m) <= m.lowThresholdDays);
  const upcoming = appointments
    .filter((a) => a.status === "upcoming")
    .sort((a, b) => a.datetime.localeCompare(b.datetime))
    .filter((a) => daysUntil(a.datetime) <= 2)
    .slice(0, 3);

  return (
    <div className="stagger-in space-y-6">
      <header>
        <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
          {formatDay(now)}
        </p>
        <h1 className="mt-1 font-display text-4xl font-medium tracking-tight md:text-5xl">
          {greeting()}
        </h1>
        <p className="mt-2 max-w-xl text-lg text-muted-foreground">
          {open.length === 0
            ? "Nessuna assunzione in sospeso per oggi."
            : `${open.length} ${open.length === 1 ? "assunzione in programma" : "assunzioni in programma"}${
                overdue.length ? ` · ${overdue.length} in ritardo` : ""
              }.`}
        </p>
      </header>

      {(lowStock.length > 0 || upcoming.length > 0) && (
        <div className="grid gap-3">
          {lowStock.map((m) => {
            const p = profiles.find((x) => x.id === m.profileId);
            const days = stockDaysLeft(m);
            return (
              <div
                key={m.id}
                className="flex items-start gap-3 rounded-xl bg-card px-4 py-3 shadow-card"
              >
                <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">
                    Scorta bassa · {m.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {p?.name} · {days} {days === 1 ? "giorno" : "giorni"} di autonomia. Richiedi la ricetta.
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/p/$profileId/terapie" params={{ profileId: m.profileId }}>
                    Apri
                  </Link>
                </Button>
              </div>
            );
          })}
          {upcoming.map((a) => {
            const p = profiles.find((x) => x.id === a.profileId);
            return (
              <Link
                key={a.id}
                to="/p/$profileId/visite"
                params={{ profileId: a.profileId }}
                className="flex items-start gap-3 rounded-xl bg-card px-4 py-3 shadow-card"
              >
                <CalendarDays className="mt-0.5 size-5 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{a.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {p?.name} · {formatDay(a.datetime)} alle {formatTime(a.datetime)}
                    {a.reminders[0] ? ` · ${a.reminders[0].label}` : ""}
                  </p>
                </div>
                <ChevronRight className="size-5 text-muted-foreground" />
              </Link>
            );
          })}
        </div>
      )}

      <div className="-mx-1 flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`h-11 shrink-0 rounded-full px-4 text-sm font-medium ${
            filter === "all" ? "bg-primary text-primary-foreground" : "bg-muted"
          }`}
        >
          Tutti
        </button>
        {profiles.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setFilter(p.id)}
            className={`flex h-11 shrink-0 items-center gap-2 rounded-full px-3 text-sm font-medium ${
              filter === p.id ? "bg-primary text-primary-foreground" : "bg-muted"
            }`}
          >
            <ProfileAvatar profile={p} size="sm" className="size-7 text-[10px]" />
            {p.name.split(" ")[0]}
          </button>
        ))}
      </div>

      {open.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-2xl font-medium">Da confermare</h2>
            <Badge variant="muted">{open.length}</Badge>
          </div>
          {open.map((s) => (
            <DoseCard key={s.key} slot={s} />
          ))}
        </section>
      )}

      {done.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display text-2xl font-medium">Completate</h2>
          {done.map((s) => (
            <DoseCard key={s.key} slot={s} compact />
          ))}
        </section>
      )}

      {slots.length === 0 && (
        <p className="rounded-xl bg-card px-5 py-10 text-center text-muted-foreground shadow-card">
          Nessuna terapia in programma per oggi.
        </p>
      )}
    </div>
  );
}
