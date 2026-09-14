import { useEffect, useState } from "react";
import { Download, FileText, Minus, Plus, RotateCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { DocFile } from "@/lib/types";

/**
 * Full-screen viewer for an attached photo or PDF, with zoom controls for
 * images and a separate, explicit download button — so looking at a file
 * doesn't require downloading it first.
 */
export function FileViewerDialog({
  file,
  onOpenChange,
}: {
  file: DocFile | null;
  onOpenChange: (open: boolean) => void;
}) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    setZoom(1);
    setRotation(0);
  }, [file]);

  return (
    <Dialog open={!!file} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[94dvh] max-w-4xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="p-4 pr-14 border-b border-border">
          <DialogTitle className="truncate text-lg">{file?.name}</DialogTitle>
        </DialogHeader>

        {file?.kind === "image" && (
          <>
            <div className="flex items-center justify-center gap-2 border-b border-border bg-muted/40 px-4 py-2">
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={() => setZoom((z) => Math.max(0.5, Math.round((z - 0.25) * 100) / 100))}
                aria-label="Riduci zoom"
              >
                <Minus className="size-4" />
              </Button>
              <span className="w-14 text-center text-sm tabular-nums text-muted-foreground">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={() => setZoom((z) => Math.min(4, Math.round((z + 0.25) * 100) / 100))}
                aria-label="Aumenta zoom"
              >
                <Plus className="size-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={() => setRotation((r) => (r + 90) % 360)}
                aria-label="Ruota"
              >
                <RotateCw className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setZoom(1);
                  setRotation(0);
                }}
              >
                Reimposta
              </Button>
              <a
                href={file.dataUrl}
                download={file.name}
                className="ml-auto inline-flex h-10 items-center gap-2 rounded-md bg-primary px-3.5 text-sm font-medium text-primary-foreground"
              >
                <Download className="size-4" />
                Scarica
              </a>
            </div>
            <div className="flex-1 overflow-auto bg-ink/5 p-4">
              <div className="flex min-h-full items-center justify-center">
                <img
                  src={file.dataUrl}
                  alt={file.name}
                  className="max-w-none select-none"
                  style={{
                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                    transition: "transform 150ms ease",
                  }}
                  draggable={false}
                />
              </div>
            </div>
          </>
        )}

        {file?.kind === "pdf" && (
          <>
            <div className="flex items-center justify-end gap-2 border-b border-border bg-muted/40 px-4 py-2">
              <a
                href={file.dataUrl}
                download={file.name}
                className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-3.5 text-sm font-medium text-primary-foreground"
              >
                <Download className="size-4" />
                Scarica
              </a>
            </div>
            <iframe
              src={file.dataUrl}
              title={file.name}
              className="h-[75dvh] w-full flex-1 border-0 bg-white"
            />
          </>
        )}

        {file && file.kind === "other" && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-10 text-center">
            <FileText className="size-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Anteprima non disponibile per questo tipo di file.
            </p>
            <a
              href={file.dataUrl}
              download={file.name}
              className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
            >
              <Download className="size-4" />
              Scarica {file.name}
            </a>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/** A row of attachment chips: click to view in the lightbox, or use the small download icon. */
export function AttachmentList({ files }: { files: DocFile[] }) {
  const [viewing, setViewing] = useState<DocFile | null>(null);

  if (files.length === 0) return null;

  return (
    <div className="space-y-1.5">
      {files.map((f, i) => (
        <div
          key={i}
          className="flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm text-foreground"
        >
          <button
            type="button"
            onClick={() => setViewing(f)}
            className="flex min-w-0 flex-1 items-center gap-2 text-left hover:underline"
          >
            <span className="min-w-0 flex-1 truncate">{f.name}</span>
          </button>
          <a
            href={f.dataUrl}
            download={f.name}
            className="shrink-0 rounded p-1.5 text-muted-foreground hover:bg-card hover:text-foreground"
            aria-label={`Scarica ${f.name}`}
            title="Scarica"
          >
            <Download className="size-4" />
          </a>
        </div>
      ))}
      <FileViewerDialog file={viewing} onOpenChange={(v) => !v && setViewing(null)} />
    </div>
  );
}
