import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { searchDrugs, type Drug } from "@/lib/drugs";

export function DrugSearch({
  onPick,
  value,
  onValue,
}: {
  onPick: (drug: Drug) => void;
  value: string;
  onValue: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const results = useMemo(() => searchDrugs(value), [value]);

  return (
    <div className="relative">
      <Input
        value={value}
        onChange={(e) => {
          onValue(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Cerca nome o principio attivo"
        autoComplete="off"
      />
      {open && results.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg bg-card py-1 shadow-card">
          {results.map((d) => (
            <li key={`${d.name}-${d.ingredient}`}>
              <button
                type="button"
                className="flex w-full flex-col items-start px-3 py-2.5 text-left hover:bg-muted"
                onClick={() => {
                  onPick(d);
                  onValue(d.name);
                  setOpen(false);
                }}
              >
                <span className="font-medium">{d.name}</span>
                <span className="text-sm text-muted-foreground">
                  {d.ingredient} · {d.typicalDose} {d.unit}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
