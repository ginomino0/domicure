import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/lib/store";
import { DOC_LABEL, type ClinicalDocument, type DocCategory } from "@/lib/types";
import { formatLongDate, toLocalDate } from "@/lib/format";

export const Route = createFileRoute("/p/$profileId/documenti")({
  component: DocumentiPage,
});

function DocumentiPage() {
  const { profileId } = Route.useParams();
  const allDocs = useAppStore((s) => s.documents);
  const docs = allDocs.filter((d) => d.profileId === profileId);
  const addDocument = useAppStore((s) => s.addDocument);
  const removeDocument = useAppStore((s) => s.removeDocument);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<DocCategory | "all">("all");

  const filtered = useMemo(
    () =>
      docs.filter((d) => {
        if (cat !== "all" && d.category !== cat) return false;
        if (!q.trim()) return true;
        const hay = `${d.title} ${d.doctor ?? ""} ${d.facility ?? ""} ${d.notes ?? ""}`.toLowerCase();
        return hay.includes(q.toLowerCase());
      }),
    [docs, q, cat],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-medium">Referti e documenti</h2>
        <Button onClick={() => setOpen(true)}>
          <Plus className="size-5" />
          Aggiungi
        </Button>
      </div>

      <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cerca per titolo, medico, struttura" />

      <div className="-mx-1 flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setCat("all")}
          className={`h-11 shrink-0 rounded-full px-4 text-sm font-medium ${
            cat === "all" ? "bg-primary text-primary-foreground" : "bg-muted"
          }`}
        >
          Tutti
        </button>
        {(Object.keys(DOC_LABEL) as DocCategory[]).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCat(c)}
            className={`h-11 shrink-0 rounded-full px-4 text-sm font-medium ${
              cat === c ? "bg-primary text-primary-foreground" : "bg-muted"
            }`}
          >
            {DOC_LABEL[c]}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="rounded-xl bg-card px-5 py-10 text-center text-muted-foreground shadow-card">
          Nessun documento in questa vista.
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {filtered.map((d) => (
          <article key={d.id} className="rounded-xl bg-card p-5 shadow-card">
            <Badge variant="muted">{DOC_LABEL[d.category]}</Badge>
            <h3 className="mt-2 font-display text-xl font-medium">{d.title}</h3>
            <p className="text-sm text-muted-foreground">
              {formatLongDate(d.date)}
              {d.facility ? ` · ${d.facility}` : ""}
            </p>
            {d.doctor && <p className="text-sm text-muted-foreground">{d.doctor}</p>}
            {d.notes && <p className="mt-2 text-sm">{d.notes}</p>}
            {d.fileData && d.fileName && (
              <a
                href={d.fileData}
                download={d.fileName}
                className="mt-3 inline-block text-sm text-primary underline"
              >
                Apri allegato ({d.fileName})
              </a>
            )}
            <div className="mt-3">
              <Button variant="ghost" size="sm" onClick={() => removeDocument(d.id)}>
                Elimina
              </Button>
            </div>
          </article>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuovo documento</DialogTitle>
          </DialogHeader>
          <DocForm
            onCancel={() => setOpen(false)}
            onSave={(draft) => {
              addDocument({ ...draft, profileId });
              setOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DocForm({
  onSave,
  onCancel,
}: {
  onSave: (d: Omit<ClinicalDocument, "id" | "profileId">) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<DocCategory>("blood");
  const [date, setDate] = useState(toLocalDate(new Date()));
  const [facility, setFacility] = useState("");
  const [doctor, setDoctor] = useState("");
  const [notes, setNotes] = useState("");
  const [fileName, setFileName] = useState<string | undefined>();
  const [fileData, setFileData] = useState<string | undefined>();
  const [err, setErr] = useState("");

  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!title.trim()) return;
        onSave({
          title: title.trim(),
          category,
          date,
          facility: facility || undefined,
          doctor: doctor || undefined,
          notes: notes || undefined,
          fileName,
          fileData,
        });
      }}
    >
      <div className="grid gap-1.5">
        <Label>Titolo</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div className="grid gap-1.5">
        <Label>Categoria</Label>
        <Select value={category} onValueChange={(v) => setCategory(v as DocCategory)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(DOC_LABEL) as DocCategory[]).map((c) => (
              <SelectItem key={c} value={c}>
                {DOC_LABEL[c]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-1.5">
        <Label>Data esecuzione</Label>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <Label>Struttura</Label>
          <Input value={facility} onChange={(e) => setFacility(e.target.value)} />
        </div>
        <div className="grid gap-1.5">
          <Label>Medico</Label>
          <Input value={doctor} onChange={(e) => setDoctor(e.target.value)} />
        </div>
      </div>
      <div className="grid gap-1.5">
        <Label>Note</Label>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
      </div>
      <div className="grid gap-1.5">
        <Label>Allegato (max 700 KB)</Label>
        <Input
          type="file"
          accept="image/*,.pdf"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            if (file.size > 700_000) {
              setErr("File troppo grande per la memoria locale. Usa un PDF o una foto più leggera.");
              return;
            }
            setErr("");
            const reader = new FileReader();
            reader.onload = () => {
              setFileName(file.name);
              setFileData(String(reader.result));
            };
            reader.readAsDataURL(file);
          }}
        />
        {fileName && <p className="text-sm text-muted-foreground">{fileName}</p>}
        {err && <p className="text-sm text-destructive">{err}</p>}
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Annulla
        </Button>
        <Button type="submit">Salva</Button>
      </div>
    </form>
  );
}
