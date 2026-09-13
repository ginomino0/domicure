import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

const ITEMS = [
  { to: "/p/$profileId", label: "Scheda" },
  { to: "/p/$profileId/terapie", label: "Terapie" },
  { to: "/p/$profileId/parametri", label: "Parametri" },
  { to: "/p/$profileId/sintomi", label: "Sintomi" },
  { to: "/p/$profileId/visite", label: "Visite" },
  { to: "/p/$profileId/documenti", label: "Referti" },
  { to: "/p/$profileId/report", label: "Report" },
] as const;

export function ProfileSubnav({ profileId, current }: { profileId: string; current: string }) {
  return (
    <nav className="-mx-1 mb-6 flex gap-1 overflow-x-auto pb-1">
      {ITEMS.map((item) => {
        const href = item.to.replace("$profileId", profileId);
        const active = current === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            params={{ profileId }}
            className={cn(
              "h-11 shrink-0 rounded-full px-4 text-sm font-medium leading-[2.75rem] transition-colors duration-150",
              active ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-secondary",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
