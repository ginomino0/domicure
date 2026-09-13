import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { CalendarDays, HeartPulse, Settings, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { ClientGate } from "./client-gate";
import { LockScreen } from "./lock-screen";
import { useAppStore } from "@/lib/store";

const NAV = [
  { to: "/", label: "Oggi", icon: HeartPulse },
  { to: "/famiglia", label: "Famiglia", icon: Users },
  { to: "/agenda", label: "Agenda", icon: CalendarDays },
  { to: "/impostazioni", label: "Impostazioni", icon: Settings },
] as const;

function navActive(pathname: string, to: string) {
  if (to === "/") return pathname === "/";
  return pathname === to || pathname.startsWith(`${to}/`);
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const unlocked = useAppStore((s) => s.unlocked);
  const pinHash = useAppStore((s) => s.pinHash);

  return (
    <ClientGate>
      {pinHash && !unlocked ? (
        <LockScreen />
      ) : (
        <div className="min-h-dvh bg-background text-foreground">
          <aside className="fixed top-0 left-0 z-30 hidden h-dvh w-60 flex-col border-r border-border bg-card px-4 py-6 md:flex">
            <Link to="/" className="px-2">
              <span className="font-display text-3xl font-medium tracking-tight">Salus</span>
              <span className="mt-1 block text-sm text-muted-foreground">Diario familiare</span>
            </Link>
            <nav className="mt-10 flex flex-col gap-1">
              {NAV.map((item) => {
                const active = navActive(pathname, item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "flex h-12 items-center gap-3 rounded-lg px-3 text-base transition-colors duration-150",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-muted",
                    )}
                  >
                    <item.icon className="size-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <p className="mt-auto px-2 text-xs leading-relaxed text-muted-foreground">
              I dati restano su questo dispositivo. Nessun account in rete.
            </p>
          </aside>

          <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur-sm md:hidden">
            <Link to="/" className="font-display text-2xl font-medium tracking-tight">
              Salus
            </Link>
            <span className="text-sm text-muted-foreground">
              {NAV.find((n) => navActive(pathname, n.to))?.label ?? "Diario"}
            </span>
          </header>

          <main className="mx-auto w-full max-w-5xl px-4 pb-28 pt-5 md:ml-60 md:px-8 md:pb-12 md:pt-8">
            {children}
          </main>

          <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur-sm md:hidden">
            <ul className="grid grid-cols-4">
              {NAV.map((item) => {
                const active = navActive(pathname, item.to);
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className={cn(
                        "flex h-16 flex-col items-center justify-center gap-1 text-xs",
                        active ? "text-primary" : "text-muted-foreground",
                      )}
                    >
                      <item.icon className="size-5" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      )}
    </ClientGate>
  );
}
