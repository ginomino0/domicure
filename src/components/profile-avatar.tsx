import { cn } from "@/lib/utils";
import type { Profile } from "@/lib/types";

const TONE: Record<Profile["tone"], string> = {
  forest: "bg-primary text-primary-foreground",
  ink: "bg-ink text-primary-foreground",
  clay: "bg-clay text-primary-foreground",
  slate: "bg-slate text-primary-foreground",
};

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function ProfileAvatar({
  profile,
  size = "md",
  className,
}: {
  profile: Pick<Profile, "name" | "tone">;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const dim = size === "sm" ? "size-9 text-xs" : size === "lg" ? "size-16 text-xl" : "size-12 text-sm";
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-display font-medium tracking-tight",
        TONE[profile.tone],
        dim,
        className,
      )}
      aria-hidden
    >
      {initials(profile.name)}
    </span>
  );
}
