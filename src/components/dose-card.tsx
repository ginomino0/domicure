import { useState } from "react";
import { Clock, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { DoseSlot } from "@/lib/schedule";
import { describeSchedule, stockDaysLeft } from "@/lib/schedule";
import { FORM_LABEL, SKIP_REASONS } from "@/lib/types";
import { formatTime } from "@/lib/format";
import { useAppStore } from "@/lib/store";
import { ProfileAvatar } from "./profile-avatar";
import { cn } from "@/lib/utils";

export function DoseCard({ slot, compact }: { slot: DoseSlot; compact?: boolean }) {
  const takeDose = useAppStore((s) => s.takeDose);
  const skipDose = useAppStore((s) => s.skipDose);
  const postponeDose = useAppStore((s) => s.postponeDose);
  const [skipOpen, setSkipOpen] = useState(false);
  const days = stockDaysLeft(slot.medication);
  const low = days <= slot.medication.lowThresholdDays;
  const open = slot.state === "pending" || slot.state === "overdue" || slot.state === "postponed";

  const payload = {
    medicationId: slot.medication.id,
    profileId: slot.profile.id,
    scheduledAt: slot.scheduledAt,
    dueAt: slot.dueAt,
  };

  return (
    <article
      className={cn(
        "rounded-xl bg-card p-5 shadow-card",
        slot.state === "overdue" && "ring-2 ring-destructive/40",
        slot.state === "taken" && "opacity-80",
      )}
    >
      <div className="flex items-start gap-3">
        <ProfileAvatar profile={slot.profile} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium tabular-nums">{formatTime(slot.dueAt)}</p>
            {slot.state === "overdue" && <Badge variant="danger">In ritardo</Badge>}
            {slot.state === "postponed" && <Badge variant="warning">Posticipata</Badge>}
            {slot.state === "taken" && <Badge>Assunta</Badge>}
            {slot.state === "skipped" && <Badge variant="muted">Saltata</Badge>}
          </div>
          <p className="text-sm text-muted-foreground">{slot.profile.name}</p>
          <h3 className="mt-1 font-display text-xl font-medium tracking-tight">
            {slot.medication.name}{" "}
            <span className="text-base font-sans font-normal text-muted-foreground">
              {slot.medication.doseAmount} {slot.medication.doseUnit}
            </span>
          </h3>
          {!compact && (
            <>
              <p className="mt-1 text-sm text-muted-foreground">
                {slot.medication.perDose} {FORM_LABEL[slot.medication.form].toLowerCase()}
                {slot.medication.instructions ? ` · ${slot.medication.instructions}` : ""}
              </p>
              <p className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Clock className="size-3.5" /> {describeSchedule(slot.medication)}
                </span>
                <span className={cn("inline-flex items-center gap-1", low && "text-warning")}>
                  <Package className="size-3.5" />
                  {Number.isFinite(days) ? `${days} giorni di scorta` : "Scorta n.d."}
                </span>
              </p>
            </>
          )}
          {slot.log?.skipReason && (
            <p className="mt-2 text-sm text-muted-foreground">Motivo: {slot.log.skipReason}</p>
          )}
        </div>
      </div>

      {open && (
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <Button className="sm:col-span-1" size="lg" onClick={() => takeDose(payload)}>
            Assunto
          </Button>
          <Button variant="outline" size="lg" onClick={() => postponeDose(payload, 15)}>
            Tra 15 min
          </Button>
          <Button variant="ghost" size="lg" onClick={() => setSkipOpen(true)}>
            Salta
          </Button>
        </div>
      )}

      <Dialog open={skipOpen} onOpenChange={setSkipOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Perché saltare?</DialogTitle>
            <DialogDescription>
              Il motivo resta nel diario e compare nel report per il medico.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            {SKIP_REASONS.map((reason) => (
              <Button
                key={reason}
                variant="outline"
                className="justify-start"
                onClick={() => {
                  skipDose(payload, reason);
                  setSkipOpen(false);
                }}
              >
                {reason}
              </Button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setSkipOpen(false)}>
              Annulla
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </article>
  );
}
