import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { ProfileAvatar } from "@/components/profile-avatar";
import { ProfileSubnav } from "@/components/profile-subnav";
import { useAppStore } from "@/lib/store";
import { RELATIONSHIP_LABEL } from "@/lib/types";
import { ageYears } from "@/lib/format";

export const Route = createFileRoute("/p/$profileId")({
  component: ProfileLayout,
});

function ProfileLayout() {
  const { profileId } = Route.useParams();
  const profile = useAppStore((s) => s.profiles.find((p) => p.id === profileId));
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const current =
    pathname.endsWith("/terapie")
      ? "/p/$profileId/terapie"
      : pathname.endsWith("/parametri")
        ? "/p/$profileId/parametri"
        : pathname.endsWith("/sintomi")
          ? "/p/$profileId/sintomi"
          : pathname.endsWith("/visite")
            ? "/p/$profileId/visite"
            : pathname.endsWith("/documenti")
              ? "/p/$profileId/documenti"
              : pathname.endsWith("/report")
                ? "/p/$profileId/report"
                : "/p/$profileId";

  if (!profile) {
    return (
      <div className="py-16 text-center">
        <p className="font-display text-2xl">Profilo non trovato</p>
        <Link to="/famiglia" className="mt-3 inline-block text-primary underline">
          Torna alla famiglia
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-4">
        <ProfileAvatar profile={profile} size="lg" />
        <div>
          <p className="text-sm text-muted-foreground">
            {RELATIONSHIP_LABEL[profile.relationship]} · {ageYears(profile.birthDate)} anni
            {profile.bloodType ? ` · ${profile.bloodType}` : ""}
          </p>
          <h1 className="font-display text-3xl font-medium tracking-tight md:text-4xl">
            {profile.name}
          </h1>
        </div>
      </div>
      <ProfileSubnav profileId={profileId} current={current} />
      <Outlet />
    </div>
  );
}
