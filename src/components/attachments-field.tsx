import { useState } from "react";
import { FileText, Image as ImageIcon, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { DocFile } from "@/lib/types";

export const MAX_ATTACHMENT_BYTES = 1_200_000; // ~1.2 MB per file, kept small for localStorage
export const MAX_ATTACHMENTS = 12;

export function fileKind(file: File): DocFile["kind"] {
  if (file.type === "application/pdf") return "pdf";
  if (file.type.startsWith("image/")) return "image";
  return "other";
}

export function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/** Reusable multi-file picker (photos or PDFs) with thumbnails and per-file remove. */
export function AttachmentsField({
  label = "Foto o file (anche più pagine)",
  hint = "Puoi aggiungere più foto, ad esempio le pagine di un documento fotografate con il telefono.",
  files,
  onChange,
}: {
  label?: string;
  hint?: string;
  files: DocFile[];
  onChange: (files: DocFile[]) => void;
}) {
  const [err, setErr] = useState("");

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setErr("");
    const picked = Array.from(fileList).slice(0, MAX_ATTACHMENTS - files.length);
    const next: DocFile[] = [];
    for (const file of picked) {
      if (file.size > MAX_ATTACHMENT_BYTES) {
        setErr(
          `"${file.name}" è troppo grande (max ~1,2 MB per file). Prova una foto più leggera o un PDF più compresso.`,
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
    onChange([...files, ...next]);
  }

  return (
    <div className="grid gap-1.5">
      <Label>{label}</Label>
      <Input type="file" accept="image/*,.pdf" multiple onChange={(e) => handleFiles(e.target.files)} />
      <p className="text-xs text-muted-foreground">
        {hint} Max {MAX_ATTACHMENTS} file, circa 1,2 MB ciascuno.
      </p>
      {files.length > 0 && (
        <ul className="mt-1 space-y-1.5">
          {files.map((f, i) => (
            <li key={i} className="flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm">
              {f.kind === "image" ? (
                <ImageIcon className="size-4 shrink-0 text-muted-foreground" />
              ) : (
                <FileText className="size-4 shrink-0 text-muted-foreground" />
              )}
              <span className="min-w-0 flex-1 truncate">{f.name}</span>
              <button
                type="button"
                onClick={() => onChange(files.filter((_, idx) => idx !== i))}
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
  );
}
