import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, X, FileText, Download, Image as ImageIcon } from "lucide-react";
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
import { useAppStore } from "@/lib/store";
import type { ClinicalDocument, DocFile } from "@/lib/types";
import { formatLongDate, toLocalDate } from "@/lib/format";

const MAX_FILE_BYTES = 1_200_000; // ~1.2 MB per file, kept small for localStorage
const MAX_FILES_PER_DOC = 12;

export const Route = createFileRoute("/p/$profileId/documenti")({
  component: DocumentiPage,
});

function fileKind(file: File): DocFile["kind"] {
  if (file.type === "application/pdf") return "pdf";
  if (file.type.startsWith("image/")) return "image";
  return "other";
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/** Combines the images of a document into a single downloadable multi-page PDF. */
async function downloadImagesAsPdf(doc: ClinicalDocument) {
  const images = doc.files.filter((f) => f.kind === "image");
  if (images.length === 0) return;
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();

  for (let i = 0; i < images.length; i += 1) {
    const img = images[i];
    const dims = await new Promise<{ w: number; h: number }>((resolve) => {
      const el = new window.Image();
      el.onload = () => resolve({ w: el.naturalWidth || 1, h: el.naturalHeight || 1 });
      el.src = img.dataUrl;
    });
    const margin = 24;
    const maxW = pageW - margin * 2;
    const maxH = pageH - margin * 2;
    const scale = Math.min(maxW / dims.w, maxH / dims.h);
    const w = dims.w * scale;
    const h = dims.h * scale;
    if (i > 0) pdf.addPage();
    pdf.addImage(img.dataUrl, "JPEG", (pageW - w) / 2, (pageH - h) / 2, w, h, undefined, "FAST");
  }

  pdf.save(`${doc.title.replace(/[^\w\-]+/g, "_") || "documento"}.pdf`);
}

function DocumentiPage() {
  const { profileId } = Route.useParams();
  const allDocs = useAppStore((s) => s.documents);
  const docs = allDocs.filter((d) => d.profileId === profileId);
  const categories = useAppStore((s) => s.documentCategories);
  const addDocumentCategory = useAppStore((s) => s.addDocumentCategory);
  const addDocument = useAppStore((s) => s.addDocument);
  const removeDocument = useAppStore((s) => s.removeDocument);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [newCatOpen, setNewCatOpen] = useState(false);

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

      <div className="-mx-1 flex flex-wrap gap-2 pb-1">
        <button
          type="button"
          onClick={() => setCat("all")}
          className={`h-11 shrink-0 rounded-full px-4 text-sm font-medium ${
            cat === "all" ? "bg-primary text-primary-foreground" : "bg-muted"
          }`}
        >
          Tutti
        </button>
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCat(c)}
            className={`h-11 shrink-0 rounded-full px-4 text-sm font-medium ${
              cat === c ? "bg-primary text-primary-foreground" : "bg-muted"
            }`}
          >
            {c}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setNewCatOpen(true)}
          className="flex h-11 shrink-0 items-center gap-1 rounded-full border border-dashed border-input px-4 text-sm font-medium text-muted-foreground"
        >
          <Plus className="size-4" /> Nuova categoria
        </button>
      </div>

      {filtered.length === 0 && (
        <p className="rounded-xl bg-card px-5 py-10 text-center text-muted-foreground shadow-card">
          Nessun documento in questa vista.
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {filtered.map((d) => (
          <article key={d.id} className="rounded-xl bg-card p-5 shadow-card">
            <Badge variant="muted">{d.category}</Badge>
            <h3 className="mt-2 font-display text-xl font-medium">{d.title}</h3>
            <p className="text-sm text-muted-foreground">
              {formatLongDate(d.date)}
              {d.facility ? ` · ${d.facility}` : ""}
            </p>
            {d.doctor && <p className="text-sm text-muted-foreground">{d.doctor}</p>}
            {d.notes && <p className="mt-2 text-sm">{d.notes}</p>}

            {d.files.length > 0 && (
              <div className="mt-3 space-y-1.5">
                {d.files.map((f, i) => (
                  <a
                    key={i}
                    href={f.dataUrl}
                    download={f.name}
                    className="flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm text-foreground hover:bg-muted/70"
                  >
                    {f.kind === "image" ? (
                      <ImageIcon className="size-4 shrink-0 text-muted-foreground" />
                    ) : (
                      <FileText className="size-4 shrink-0 text-muted-foreground" />
                    )}
                    <span className="min-w-0 flex-1 truncate">{f.name}</span>
                    <Download className="size-4 shrink-0 text-muted-foreground" />
                  </a>
                ))}
                {d.files.some((f) => f.kind === "image") && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-1 w-full"
                    onClick={() => downloadImagesAsPdf(d)}
                  >
                    Scarica pagine come PDF
                  </Button>
                )}
              </div>
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
            categories={categories}
            onAddCategory={addDocumentCategory}
            onCancel={() => setOpen(false)}
            onSave={(draft) => {
              addDocument({ ...draft, profileId });
              setOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={newCatOpen} onOpenChange={setNewCatOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuova categoria</DialogTitle>
          </DialogHeader>
          <NewCategoryForm
            onCancel={() => setNewCatOpen(false)}
            onSave={(name) => {
              addDocumentCategory(name);
              setCat(name);
              setNewCatOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function NewCategoryForm({
  onSave,
  onCancel,
}: {
  onSave: (name: string) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim()) return;
        onSave(name.trim());
      }}
    >
      <div className="grid gap-1.5">
        <Label>Nome della visita o categoria</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="es. Psichiatra, Intolleranza al glutine, Fisiatra"
          autoFocus
          required
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Annulla
        </Button>
        <Button type="submit">Aggiungi categoria</Button>
      </div>
    </form>
  );
}

function DocForm({
  categories,
  onAddCategory,
  onSave,
  onCancel,
}: {
  categories: string[];
  onAddCategory: (name: string) => void;
  onSave: (d: Omit<ClinicalDocument, "id" | "profileId">) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>(categories[0] ?? "Altro");
  const [date, setDate] = useState(toLocalDate(new Date()));
  const [facility, setFacility] = useState("");
  const [doctor, setDoctor] = useState("");
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState<DocFile[]>([]);
  const [err, setErr] = useState("");
  const [addingCat, setAddingCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setErr("");
    const picked = Array.from(fileList).slice(0, MAX_FILES_PER_DOC - files.length);
    const next: DocFile[] = [];
    for (const file of picked) {
      if (file.size > MAX_FILE_BYTES) {
        setErr(
          `"${file.name}" è troppo grande (max ~1,2 MB per pagina). Prova a fare una foto più leggera o comprimere il PDF.`,
        );
        continue;
      }
      try {
        const dataUrl = await readAsDataUrl(file);
        next.push({ name: file.name, dataUrl, kind: fileKind(file) });
      } catch {
        setErr(`Non è stato possibile leggere "${file.name}".`);
      }
    }
    setFiles((prev) => [...prev, ...next]);
  }

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
          files,
        });
      }}
    >
      <div className="grid gap-1.5">
        <Label>Titolo</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div className="grid gap-1.5">
        <Label>Categoria</Label>
        {!addingCat ? (
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`h-10 rounded-full px-3.5 text-sm font-medium ${
                  category === c ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                {c}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setAddingCat(true)}
              className="flex h-10 items-center gap-1 rounded-full border border-dashed border-input px-3.5 text-sm text-muted-foreground"
            >
              <Plus className="size-4" /> Nuova
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input
              autoFocus
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="es. Psichiatra"
            />
            <Button
              type="button"
              onClick={() => {
                if (!newCatName.trim()) return;
                onAddCategory(newCatName.trim());
                setCategory(newCatName.trim());
                setNewCatName("");
                setAddingCat(false);
              }}
            >
              Aggiungi
            </Button>
            <Button type="button" variant="ghost" onClick={() => setAddingCat(false)}>
              Annulla
            </Button>
          </div>
        )}
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
        <Label>Foto o file del referto (anche più pagine)</Label>
        <Input
          type="file"
          accept="image/*,.pdf"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
        />
        <p className="text-xs text-muted-foreground">
          Puoi aggiungere più foto per un referto di più pagine: verranno unite in un unico PDF
          scaricabile dall'app. Max {MAX_FILES_PER_DOC} file, circa 1,2 MB ciascuno.
        </p>
        {files.length > 0 && (
          <ul className="mt-1 space-y-1.5">
            {files.map((f, i) => (
              <li
                key={i}
                className="flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm"
              >
                {f.kind === "image" ? (
                  <ImageIcon className="size-4 shrink-0 text-muted-foreground" />
                ) : (
                  <FileText className="size-4 shrink-0 text-muted-foreground" />
                )}
                <span className="min-w-0 flex-1 truncate">{f.name}</span>
                <button
                  type="button"
                  onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                  className="shrink-0 text-muted-foreground hover:text-foreground"
                  aria-label="Rimuovi file"
                >
                  <X className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
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
