import { useEffect, useState, type ReactNode } from "react";
import { useAppStore } from "@/lib/store";

export function ClientGate({ children }: { children: ReactNode }) {
  const hydrated = useAppStore((s) => s.hydrated);
  const highContrast = useAppStore((s) => s.highContrast);
  const largeType = useAppStore((s) => s.largeType);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const persist = useAppStore.persist;
    const finish = () => useAppStore.getState().hydrateDone();
    if (persist.hasHydrated()) {
      finish();
    } else {
      const unsub = persist.onFinishHydration(finish);
      void persist.rehydrate();
      return unsub;
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.dataset.contrast = highContrast ? "on" : "off";
    document.documentElement.dataset.type = largeType ? "large" : "normal";
  }, [highContrast, largeType, mounted]);

  if (!mounted || !hydrated) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-background text-foreground">
        <p className="font-display text-4xl font-medium tracking-tight">Salus</p>
        <p className="mt-2 text-muted-foreground">Diario della salute familiare</p>
      </div>
    );
  }

  return <>{children}</>;
}
