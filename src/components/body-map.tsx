import { cn } from "@/lib/utils";

const PARTS: { id: string; label: string; d: string }[] = [
  { id: "Testa", label: "Testa", d: "M100 18c12 0 22 10 22 24s-10 22-22 22-22-8-22-22 10-24 22-24z" },
  { id: "Collo", label: "Collo", d: "M90 62h20v14H90z" },
  { id: "Petto", label: "Petto", d: "M68 76h64v36H68z" },
  { id: "Addome", label: "Addome", d: "M72 112h56v36H72z" },
  { id: "Braccio sinistro", label: "Braccio sx", d: "M38 78h28v70H38z" },
  { id: "Braccio destro", label: "Braccio dx", d: "M134 78h28v70h-28z" },
  { id: "Gamba sinistra", label: "Gamba sx", d: "M74 150h24v78H74z" },
  { id: "Gamba destra", label: "Gamba dx", d: "M102 150h24v78h-24z" },
];

export function BodyMap({
  value,
  onChange,
}: {
  value?: string;
  onChange: (part: string) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <svg viewBox="0 0 200 240" className="h-56 w-48" role="img" aria-label="Mappa del corpo">
        {PARTS.map((p) => (
          <path
            key={p.id}
            d={p.d}
            role="button"
            tabIndex={0}
            aria-label={p.label}
            onClick={() => onChange(p.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onChange(p.id);
              }
            }}
            className={cn(
              "cursor-pointer stroke-[1.5] transition-colors duration-150",
              value === p.id
                ? "fill-primary/30 stroke-primary"
                : "fill-muted stroke-foreground/30 hover:fill-accent",
            )}
          />
        ))}
      </svg>
      <p className="text-sm text-muted-foreground">
        {value ? `Zona: ${value}` : "Tocca la zona interessata"}
      </p>
    </div>
  );
}
