import { createFileRoute, Link } from "@tanstack/react-router";
import { useAppStore } from "@/lib/store";
import { formatDay, formatTime, daysUntil } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { ProfileAvatar } from "@/components/profile-avatar";

export const Route = createFileRoute("/agenda")({ component: Agenda });

const KIND: Record<string, string> = {
  visit: "Visita",
  exam: "Esame",
  procedure: "Intervento",
};

function Agenda() {
  const appointments = useAppStore((s) => s.appointments);
  const profiles = useAppStore((s) => s.profiles);
  const upcoming = appointments
    .filter((a) => a.status === "upcoming")
    .sort((a, b) => a.datetime.localeCompare(b.datetime));
  const past = appointments
    .filter((a) => a.status !== "upcoming")
    .sort((a, b) => b.datetime.localeCompare(a.datetime));

  return (
    <div className="stagger-in space-y-8">
      <header>
        <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">Calendario</p>
        <h1 className="mt-1 font-display text-4xl font-medium tracking-tight">Agenda sanitaria</h1>
        <p className="mt-2 text-muted-foreground">
          Visite, esami e promemoria di preparazione per tutta la famiglia.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="font-display text-2xl font-medium">Prossimi appuntamenti</h2>
        {upcoming.length === 0 && (
          <p className="rounded-xl bg-card px-5 py-8 text-center text-muted-foreground shadow-card">
            Nessuna visita in programma.
          </p>
        )}
        {upcoming.map((a) => {
          const p = profiles.find((x) => x.id === a.profileId);
          const d = daysUntil(a.datetime);
          return (
            <Link
              key={a.id}
              to="/p/$profileId/visite"
              params={{ profileId: a.profileId }}
              className="block rounded-xl bg-card p-5 shadow-card"
            >
              <div className="flex items-start gap-3">
                {p && <ProfileAvatar profile={p} size="sm" />}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="muted">{KIND[a.kind]}</Badge>
                    <span className="text-sm tabular-nums text-muted-foreground">
                      {d === 0 ? "Oggi" : d === 1 ? "Domani" : `Tra ${d} giorni`}
                    </span>
                  </div>
                  <h3 className="mt-1 font-display text-xl font-medium">{a.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {p?.name} · {formatDay(a.datetime)} alle {formatTime(a.datetime)}
                    {a.facility ? ` · ${a.facility}` : ""}
                  </p>
                  {a.reminders.length > 0 && (
                    <ul className="mt-2 space-y-1 text-sm">
                      {a.reminders.map((r) => (
                        <li key={r.label} className="text-foreground/80">
                          {r.label}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </section>

      {past.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display text-2xl font-medium">Storico</h2>
          {past.map((a) => {
            const p = profiles.find((x) => x.id === a.profileId);
            return (
              <article key={a.id} className="rounded-xl bg-card p-5 shadow-card">
                <p className="text-sm text-muted-foreground">
                  {p?.name} · {formatDay(a.datetime)}
                </p>
                <h3 className="font-display text-xl font-medium">{a.title}</h3>
                {a.outcome && <p className="mt-2 text-sm">{a.outcome}</p>}
                {a.therapyChanges && (
                  <p className="mt-1 text-sm text-muted-foreground">{a.therapyChanges}</p>
                )}
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
