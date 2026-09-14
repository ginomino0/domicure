import { useState } from "react";
import { Delete } from "lucide-react";
import { Button } from "@/components/ui/button";
import { hashPin, useAppStore } from "@/lib/store";

export function LockScreen() {
  const pinHash = useAppStore((s) => s.pinHash);
  const unlock = useAppStore((s) => s.unlock);
  const [digits, setDigits] = useState("");
  const [error, setError] = useState(false);

  if (!pinHash) return null;

  async function submit(code: string) {
    const hash = await hashPin(code);
    if (hash === pinHash) {
      setError(false);
      unlock();
    } else {
      setError(true);
      setDigits("");
    }
  }

  function press(d: string) {
    setError(false);
    const next = (digits + d).slice(0, 4);
    setDigits(next);
    if (next.length === 4) void submit(next);
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-6 text-foreground">
      <p className="font-display text-4xl font-medium tracking-tight">Domicura</p>
      <p className="mt-3 max-w-xs text-center text-muted-foreground">
        Inserisci il PIN per aprire il diario della famiglia.
      </p>
      <div className="mt-8 flex gap-3" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`size-4 rounded-full border border-foreground/30 ${
              i < digits.length ? "bg-primary border-primary" : "bg-transparent"
            }`}
          />
        ))}
      </div>
      {error ? (
        <p className="mt-4 text-sm text-destructive">PIN non corretto</p>
      ) : (
        <p className="mt-4 h-5 text-sm" />
      )}
      <div className="mt-6 grid grid-cols-3 gap-3">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
          <Button
            key={d}
            type="button"
            variant="outline"
            className="size-16 rounded-full text-xl"
            onClick={() => press(d)}
          >
            {d}
          </Button>
        ))}
        <span />
        <Button
          type="button"
          variant="outline"
          className="size-16 rounded-full text-xl"
          onClick={() => press("0")}
        >
          0
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="size-16 rounded-full"
          onClick={() => setDigits((s) => s.slice(0, -1))}
          aria-label="Cancella"
        >
          <Delete className="size-6" />
        </Button>
      </div>
    </div>
  );
}
