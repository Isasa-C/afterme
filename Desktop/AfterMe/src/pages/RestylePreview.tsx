import { CheckCircle2, Flame, Smile, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { ActivityIcon } from "../components/ActivityIcon";
import { Card, SectionHeader } from "../components/ui";
import { useActivities, useCurrentStreak, useOverallStats, useStatsByActivity } from "../hooks/useAfterMeData";
import type { Activity } from "../lib/types";
import { cn } from "../lib/utils";

const editorial = {
  bg: "#EFF7FF",
  card: "#FFFFFF",
  ink: "#1A2F42",
  muted: "#6D3DF2",
  rule: "#D0E5F5",
  accent: "#6D3DF2",
};

function activityShortName(activity: Activity) {
  if (activity.key === "gym") return "the gym";
  if (activity.key === "focus") return "focused work";
  if (activity.key === "outside") return "going outside";
  if (activity.key === "social") return "reaching out";
  return activity.name.toLowerCase();
}

function commitmentName(activity: Activity) {
  if (activity.key === "gym") return "gym";
  if (activity.key === "focus") return "focused work";
  if (activity.key === "outside") return "outside";
  if (activity.key === "social") return "reaching out";
  return activity.name.toLowerCase();
}

function EditorialStat({ activity }: { activity: Activity }) {
  const { data: byActivity } = useStatsByActivity();
  const selectedStats = byActivity?.find((item) => item.activityId === activity.id);
  const count = selectedStats?.reflectedCount ?? 0;
  const better = selectedStats?.betterCount ?? 0;
  const pct = selectedStats?.feltBetterPct ?? 0;

  if (count < 3) {
    return (
      <>
        <p className="font-serif text-[28px] leading-[1.15] tracking-[-0.01em]" style={{ color: editorial.accent }}>
          Showing up is the win.
        </p>
        <p className="mt-5 font-sans text-[15px] leading-[1.55]" style={{ color: editorial.muted }}>
          You have tried this {count} time{count === 1 ? "" : "s"}.
        </p>
      </>
    );
  }

  return (
    <>
      <p
        className="font-serif text-[44px] leading-[1.05] tracking-[-0.02em] [font-feature-settings:'tnum']"
        style={{ color: editorial.accent }}
      >
        {pct}%
      </p>
      <p className="mt-5 font-sans text-[15px] leading-[1.55]" style={{ color: editorial.muted }}>
        {better} of {count} times you felt better after {activityShortName(activity)}.
      </p>
    </>
  );
}

function CurrentTodayMini() {
  const { data: activities = [] } = useActivities();
  const { data: stats } = useOverallStats();
  const { data: streak } = useCurrentStreak();
  const [selectedId, setSelectedId] = useState("gym");
  const selected = useMemo(() => activities.find((activity) => activity.id === selectedId) ?? activities[0], [activities, selectedId]);

  return (
    <div className="min-h-[780px] rounded-[28px] bg-gradient-to-b from-[#FBFAF8] via-[#F6F1FF] to-[#F1ECFF] p-4 text-[#1A2F42] ring-1 ring-black/10">
      <section className="mb-4 flex items-center gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-semibold">Hey, it's okay <span className="text-brand-400">♥</span></h2>
          <p className="mt-3 text-[15px] leading-relaxed">You don't have to feel like it. You just have to start.</p>
        </div>
        <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-brand-100 text-4xl">🙂</div>
      </section>

      <div className="space-y-4">
        <Card padding="p-5">
          <h2 className="mb-5 text-2xl font-semibold leading-tight">What don't you feel like doing?</h2>
          <div className="grid grid-cols-2 gap-3">
            {activities.slice(0, 4).map((activity) => (
              <button
                key={activity.id}
                onClick={() => setSelectedId(activity.id)}
                className={cn(
                  "flex h-28 flex-col items-center justify-center gap-2 rounded-2xl border p-3 text-center text-sm font-medium leading-tight transition",
                  selected?.id === activity.id ? "border-brand-200 bg-lavender ring-2 ring-brand-500" : "border-gray-100 bg-white",
                )}
              >
                <ActivityIcon activityKey={activity.key} className="size-10 rounded-xl" />
                <span className="max-w-full truncate text-center">{activity.name}</span>
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <SectionHeader title="Your progress" />
          <div className="grid grid-cols-4 divide-x divide-slate-100">
            <div className="flex flex-col items-center gap-1 px-1 text-center text-xs"><Flame className="h-5 w-5 text-orange-500" /><strong>{streak ?? 0}</strong><span>Streak</span></div>
            <div className="flex flex-col items-center gap-1 px-1 text-center text-xs"><CheckCircle2 className="h-5 w-5 text-green-500" /><strong>{stats?.completedThisWeek ?? 0}/12</strong><span>Done</span></div>
            <div className="flex flex-col items-center gap-1 px-1 text-center text-xs"><Smile className="h-5 w-5 text-amber-500" /><strong>{stats?.avgFeeling ?? "–"}</strong><span>Feeling</span></div>
            <div className="flex flex-col items-center gap-1 px-1 text-center text-xs"><TrendingUp className="h-5 w-5 text-brand-600" /><strong>{stats?.feltBetterPct ?? 0}%</strong><span>Better</span></div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function EditorialTodayMini() {
  const { data: activities = [] } = useActivities();
  const [selectedId, setSelectedId] = useState("focus");
  const selected = useMemo(() => activities.find((activity) => activity.id === selectedId) ?? activities[1] ?? activities[0], [activities, selectedId]);

  return (
    <div className="min-h-[780px] rounded-[28px] p-8 ring-1 ring-black/10" style={{ background: editorial.bg, color: editorial.ink }}>
      <section className="pt-6">
        <h1 className="font-serif text-[28px] leading-[1.15] tracking-[-0.01em]">Hey, it's okay</h1>
        <p className="mt-4 font-sans text-[15px] leading-[1.55]" style={{ color: editorial.muted }}>
          You don't have to feel like it. You just have to start.
        </p>
      </section>

      <section className="my-12">
        <p className="mb-5 font-sans text-[11px] uppercase leading-[1.4] tracking-[0.08em]" style={{ color: editorial.muted }}>
          Today
        </p>
        <div className="grid grid-cols-2 gap-x-8">
          {activities.slice(0, 4).map((activity) => (
            <button
              key={activity.id}
              onClick={() => setSelectedId(activity.id)}
              className="border-b py-4 text-left font-serif text-[20px] leading-[1.3] transition"
              style={{
                borderColor: editorial.rule,
                color: selected?.id === activity.id ? editorial.accent : editorial.muted,
              }}
            >
              {activity.name}
            </button>
          ))}
        </div>
      </section>

      {selected ? (
        <>
          <section className="py-16">
            <p className="mb-6 font-sans text-[11px] uppercase leading-[1.4] tracking-[0.08em]" style={{ color: editorial.muted }}>
              Your past experience
            </p>
            <EditorialStat activity={selected} />
          </section>

          <section className="space-y-5">
            <button className="h-14 w-full rounded-sm font-sans text-[15px] font-medium text-white" style={{ background: editorial.accent }}>
              Begin {selected.default_duration_min} minutes
            </button>
            <button className="w-full text-center font-sans text-[15px] leading-[1.55] underline-offset-4 hover:underline" style={{ color: editorial.muted }}>
              Remind me in 15 min
            </button>
          </section>
        </>
      ) : null}
    </div>
  );
}

export function RestylePreview() {
  return (
    <main className="min-h-screen bg-[#FBFAF8] px-5 py-10 text-[#1A2F42]">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 max-w-3xl">
          <p className="font-sans text-[11px] uppercase tracking-[0.08em] text-[#6D3DF2]">Restyle preview</p>
          <h1 className="mt-3 font-serif text-[44px] leading-[1.05] tracking-[-0.02em]">Today, before and after.</h1>
          <p className="mt-4 font-sans text-[15px] leading-[1.55] text-[#6D3DF2]">
            Left is the current soft wellness direction. Right is the proposed editorial minimal direction. No other app screens have been restyled here.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-2">
          <section>
            <p className="mb-4 font-sans text-[11px] uppercase tracking-[0.08em] text-[#6D3DF2]">Current Today</p>
            <CurrentTodayMini />
          </section>
          <section>
            <p className="mb-4 font-sans text-[11px] uppercase tracking-[0.08em] text-[#6D3DF2]">Editorial Today</p>
            <EditorialTodayMini />
          </section>
        </div>
      </div>
    </main>
  );
}
