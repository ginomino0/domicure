import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { ProfileAvatar } from "@/components/profile-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { RELATIONSHIP_LABEL, type Profile, type Relationship } from "@/lib/types";
import { ageYears } from "@/lib/format";
import { buildDayPlan, stockDaysLeft } from "@/lib/schedule";

export const Route = createFileRoute("/famiglia")({ component: Famiglia });

function Famiglia() {
  const profiles = useAppStore((s) => s.profiles);
  const medications = useAppStore((s) => s.medications);
  const doseLogs = useAppStore((s) => s.doseLogs);
  const appointments = useAppStore((s) => s.appointments);
  const addProfile = useAppStore((s) => s.addProfile);
  const [open, setOpen] = useState(false);

  return (
    <div className="stagger-in space-y-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
            Profili
          </p>
          <h1 className="mt-1 font-display text-4xl font-medium tracking-tight">Famiglia</h1>
          <p className="mt-2 text-muted-foreground">
            Ogni scheda è indipendente: terapie, parametri e visite restano sul dispositivo.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="size-5" />
          Aggiungi
        </Button>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {profiles.map((p) => {
          const meds = medications.filter((m) => m.profileId === p.id && m.active);
          const plan = buildDayPlan({
            date: new Date(),
            profiles: [p],
            medications: meds,
            doseLogs,
            profileId: p.id,
          });
          const pending = plan.filter((s) => s.state !== "taken" && s.state !== "skipped").length;
          const low = meds.filter((m) => stockDaysLeft(m) <= m.lowThresholdDays).length;
          const next = appointments
            .filter((a) => a.profileId === p.id && a.status === "upcoming")
            .sort((a, b) => a.datetime.localeCompare(b.datetime))[0];
          return (
            <Link
              key={p.id}
              to="/p/$profileId"
              params={{ profileId: p.id }}
              className="rounded-xl bg-card p-5 shadow-card transition-transform duration-150 hover:-translate-y-0.5"
            >
              <div className="flex items-start gap-4">
                <ProfileAvatar profile={p} size="lg" />
                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground">
                    {RELATIONSHIP_LABEL[p.relationship]} · {ageYears(p.birthDate)} anni
                    {p.bloodType ? ` · ${p.bloodType}` : ""}
                  </p>
                  <h2 className="font-display text-2xl font-medium tracking-tight">{p.name}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {meds.length} {meds.length === 1 ? "terapia attiva" : "terapie attive"}
                    {pending ? ` · ${pending} da confermare oggi` : ""}
                    {low ? ` · ${low} scorte basse` : ""}
                  </p>
                  {next && (
                    <p className="mt-1 text-sm text-foreground/80">
                      Prossima: {next.title}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuovo profilo</DialogTitle>
          </DialogHeader>
          <ProfileForm
            onCancel={() => setOpen(false)}
            onSave={(p) => {
              addProfile(p);
              setOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProfileForm({
  onSave,
  onCancel,
}: {
  onSave: (p: Omit<Profile, "id">) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState<Relationship>("other");
  const [birthDate, setBirthDate] = useState("1970-01-01");
  const [sex, setSex] = useState<Profile["sex"]>("X");
  const [bloodType, setBloodType] = useState("");
  const tones: Profile["tone"][] = ["forest", "ink", "clay", "slate"];

  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim()) return;
        onSave({
          name: name.trim(),
          relationship,
          birthDate,
          sex,
          bloodType: bloodType || undefined,
          tone: tones[Math.floor(Math.random() * tones.length)] ?? "forest",
        });
      }}
    >
      <div className="grid gap-1.5">
        <Label>Nome</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <Label>Legame</Label>
          <Select value={relationship} onValueChange={(v) => setRelationship(v as Relationship)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(RELATIONSHIP_LABEL) as Relationship[]).map((r) => (
                <SelectItem key={r} value={r}>
                  {RELATIONSHIP_LABEL[r]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5">
          <Label>Nascita</Label>
          <Input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <Label>Sesso</Label>
          <Select value={sex} onValueChange={(v) => setSex(v as Profile["sex"])}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="F">F</SelectItem>
              <SelectItem value="M">M</SelectItem>
              <SelectItem value="X">Non specificato</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5">
          <Label>Gruppo sanguigno</Label>
          <Input value={bloodType} onChange={(e) => setBloodType(e.target.value)} placeholder="es. A+" />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Annulla
        </Button>
        <Button type="submit">Crea scheda</Button>
      </div>
    </form>
  );
}
