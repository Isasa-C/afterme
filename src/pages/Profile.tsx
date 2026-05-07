import { Camera, ChevronRight, LogOut, Sparkles, Settings, UserRound } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ActivityIcon } from "../components/ActivityIcon";
import { AppShell } from "../components/AppShell";
import { useActivities, useUserProfile } from "../hooks/useAfterMeData";
import { useUser } from "../hooks/useUser";
import { signOut } from "../lib/auth";

const profileAccent = "#9D5BFF";

export function Profile() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useUser();
  const { data: profile } = useUserProfile();
  const { data: activities = [] } = useActivities();

  if (!user) {
    return (
      <AppShell>
        <section className="mx-auto mt-16 max-w-md text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-white/25 bg-white/15 text-white backdrop-blur-[18px]">
            <UserRound className="h-8 w-8" />
          </div>
          <h1 className="mt-5 text-[38px] leading-[1.05] text-white" style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 400, textShadow: "0 1px 12px rgba(0,0,0,0.3)" }}>
            Sign in to keep your progress.
          </h1>
          <p className="mx-auto mt-4 max-w-xs text-[14px] leading-relaxed text-white/75">
            Your routines, calendar, and reflections stay separate from everyone else.
          </p>
          <button onClick={() => navigate("/auth")} className="mt-8 w-full rounded-full bg-[#9D5BFF] p-[13px] text-[14px] font-medium text-white">
            Sign in or create account
          </button>
        </section>
      </AppShell>
    );
  }

  const handleSignOut = () => {
    signOut();
    queryClient.clear();
    navigate("/today");
  };

  return (
    <AppShell>
      <header className="mb-6 flex flex-row items-center gap-3 rounded-[22px] border border-white/25 bg-white/15 px-4 py-4 shadow-[0_12px_32px_rgba(0,0,0,0.18)] backdrop-blur-[18px]">
        <div className="relative grid h-16 w-16 shrink-0 place-items-center rounded-full bg-white/20">
          <div className="text-3xl">🙂</div>
          <button className="absolute bottom-0 -right-1 grid h-6 w-6 place-items-center rounded-full bg-white text-[#9D5BFF] ring-2 ring-white/80" aria-label="Upload avatar">
            <Camera className="h-3 w-3" />
          </button>
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[21px] font-bold leading-tight text-white drop-shadow-[0_1px_10px_rgba(0,0,0,0.28)]">{profile?.display_name ?? "Isa"}</h1>
          <p className="mt-0.5 truncate text-[14px] leading-relaxed text-white/72">{user.email}</p>
        </div>
        <button
          aria-label="Sign out"
          onClick={handleSignOut}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/25 bg-white/15 text-white transition hover:bg-white/20"
        >
          <LogOut className="h-5 w-5" />
        </button>
        <button
          aria-label="Settings"
          onClick={() => navigate("/settings")}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/60 bg-white/50 transition hover:bg-white/80"
          style={{ color: profileAccent, transition: "background 0.3s ease, color 0.3s ease" }}
        >
          <Settings className="h-5 w-5" />
        </button>
      </header>

      <section className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[18px] font-semibold leading-tight text-white drop-shadow-[0_1px_10px_rgba(0,0,0,0.3)]">Routines</h2>
          <button
            onClick={() => navigate("/profile/activities")}
            className="rounded-full border px-4 py-[7px] text-[13px] font-semibold"
            style={{
              background: "rgba(255,255,255,0.88)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              borderColor: "rgba(255,255,255,0.6)",
              borderWidth: "0.5px",
              color: profileAccent,
            }}
          >
            Edit routines
          </button>
        </div>
        <div className="space-y-2">
          {activities.map((activity) => (
            <button key={activity.id} onClick={() => navigate(`/profile/activities/${activity.id}`)} className="flex w-full items-center gap-3 rounded-2xl border border-white/25 bg-white/15 px-3 py-3 text-left shadow-[0_10px_28px_rgba(0,0,0,0.12)] backdrop-blur-[18px] transition hover:bg-white/20">
              <ActivityIcon activityKey={activity.key} iconKey={activity.icon_key} colorKey={activity.color_key} tone="transparent" className="h-11 w-11" />
              <span className="flex-1 text-[15px] font-semibold text-white">{activity.name}</span>
              <ChevronRight className="h-5 w-5 text-white/60" />
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-[18px] font-semibold leading-tight text-white drop-shadow-[0_1px_10px_rgba(0,0,0,0.3)]">Your motivations</h2>
        <button onClick={() => navigate("/profile/motivations")} className="flex w-full items-center gap-3 rounded-2xl border border-white/25 bg-white/15 px-3 py-3 text-left shadow-[0_10px_28px_rgba(0,0,0,0.12)] backdrop-blur-[18px] transition hover:bg-white/20">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/20" style={{ color: profileAccent }}>
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="flex-1 text-[15px] font-semibold text-white">Reasons future you remembers</span>
          <ChevronRight className="h-5 w-5 text-white/60" />
        </button>
      </section>
    </AppShell>
  );
}
