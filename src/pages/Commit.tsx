import { CalendarCheck2, ChevronRight, Clock3, Flame, History, Pause, Play } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ActivityIcon } from "../components/ActivityIcon";
import { AppShell } from "../components/AppShell";
import { Mascot } from "../components/Mascot";
import { Card, IconButton } from "../components/ui";
import { useActivities, useActiveCommitment, useCompleteCommitment, useCreateReflection, useCurrentStreak, useStartCommitment } from "../hooks/useAfterMeData";
import type { Commitment, ReflectionOutcome } from "../lib/types";

function TimerCard({ active, onDone }: { active: Commitment; onDone: () => void }) {
  const { data: activities } = useActivities();
  const activity = activities?.find((item) => item.id === active.activity_id);
  const [paused, setPaused] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (paused) return;
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [paused]);

  const elapsed = Math.max(0, Math.floor((now - +new Date(active.started_at)) / 1000));
  const total = active.duration_minutes * 60;
  const remaining = Math.max(0, total - elapsed);
  const progress = Math.min(100, Math.round((elapsed / total) * 100));
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  return (
    <Card className="mb-8 border-brand-100" padding="p-6">
      <div className="mb-6 flex items-center gap-4">
        {activity ? <ActivityIcon activityKey={activity.key} /> : null}
        <div>
          <h2 className="text-2xl font-semibold text-ink">{activity?.name}</h2>
          <p className="text-slate-500">You already started. That counts.</p>
        </div>
      </div>
      <div className="mx-auto grid h-56 w-56 place-items-center rounded-full border-[14px] border-brand-100 bg-brand-50/70 shadow-inner">
        <div className="text-center">
          <div className="text-5xl font-semibold text-brand-700">
            {mins}:{String(secs).padStart(2, "0")}
          </div>
          <div className="mt-2 font-bold text-brand-500">{progress}% done</div>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <button onClick={() => setPaused((value) => !value)} className="flex items-center justify-center gap-2 rounded-2xl border border-brand-200 px-4 py-3 font-bold text-brand-700">
          {paused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
          {paused ? "Resume" : "Pause"}
        </button>
        <button onClick={onDone} className="rounded-2xl bg-brand-600 px-4 py-3 font-semibold text-white">
          I'm done
        </button>
      </div>
    </Card>
  );
}

export function Commit() {
  const navigate = useNavigate();
  const { data: activities = [] } = useActivities();
  const { data: active } = useActiveCommitment();
  const { data: streak } = useCurrentStreak();
  const startCommitment = useStartCommitment();
  const completeCommitment = useCompleteCommitment();
  const createReflection = useCreateReflection();
  const [sheetCommitment, setSheetCommitment] = useState<Commitment | null>(null);
  const [score, setScore] = useState(8);
  const [note, setNote] = useState("");
  const featured = activities[0];
  const popular = activities.slice(1);

  const start = (activityId: string, duration: number) => startCommitment.mutate({ activityId, durationMin: duration });
  const done = async () => {
    if (!active) return;
    const completed = await completeCommitment.mutateAsync(active.id);
    setSheetCommitment(completed);
  };
  const submit = async (outcome: ReflectionOutcome) => {
    if (!sheetCommitment) return;
    await createReflection.mutateAsync({ commitmentId: sheetCommitment.id, outcome, feelingScore: score, note });
    setSheetCommitment(null);
    setNote("");
  };

  const activeActivity = useMemo(() => activities.find((activity) => activity.id === active?.activity_id), [active, activities]);

  return (
    <AppShell>
      <header className="mb-6 flex items-center justify-between">
        <div className="flex h-12 items-center gap-2 rounded-2xl border border-[#E6DCFF] bg-white px-4 font-semibold text-[#6D3DF2] shadow-sm">
          <Flame className="h-6 w-6" /> {streak ?? 0}
        </div>
        <h1 className="text-3xl font-semibold text-ink">Commit</h1>
        <IconButton aria-label="History" onClick={() => navigate("/history")}>
          <Clock3 className="h-7 w-7 text-brand-600" />
        </IconButton>
      </header>

      <section className="mb-8 text-center">
        <h2 className="text-3xl font-semibold text-brand-600">Small start, big difference.</h2>
        <p className="mt-4 text-xl leading-relaxed text-slate-700">You don't have to feel ready.<br />You just have to start.</p>
      </section>

      {active ? (
        <TimerCard active={active} onDone={done} />
      ) : (
        <>
          <Card className="relative mb-8 overflow-hidden" padding="p-5">
            <h2 className="text-2xl font-semibold text-ink">Start a commitment</h2>
            <p className="mt-4 max-w-[64%] text-lg leading-relaxed text-slate-600">Pick something you don't feel like doing, and start now.</p>
            <Mascot variant="waving" className="absolute right-3 top-6 h-36 w-36" />
            {featured ? (
              <div className="relative mt-6 flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                <ActivityIcon activityKey={featured.key} />
                <div className="min-w-0 flex-1">
                  <div className="text-xl font-semibold text-ink">{featured.name}</div>
                  <div className="text-slate-500">Just {featured.default_duration_min} minutes</div>
                </div>
                <button onClick={() => start(featured.id, featured.default_duration_min)} className="rounded-2xl bg-brand-600 px-8 py-4 text-lg font-semibold text-white">
                  Start
                </button>
              </div>
            ) : null}
          </Card>

          <h2 className="mb-4 text-2xl font-semibold text-ink">Popular commitments</h2>
          <div className="mb-8 overflow-hidden rounded-card border border-slate-100 bg-white shadow-soft">
            {popular.map((activity) => (
              <button key={activity.id} onClick={() => start(activity.id, activity.default_duration_min)} className="flex w-full items-center gap-4 border-b border-slate-100 p-4 text-left last:border-b-0">
                <ActivityIcon activityKey={activity.key} />
                <div className="flex-1">
                  <div className="text-xl font-bold text-ink">{activity.name}</div>
                  <div className="text-slate-500">Just {activity.default_duration_min} minutes</div>
                </div>
                <ChevronRight className="h-7 w-7 text-slate-500" />
              </button>
            ))}
          </div>

          <Card className="mb-8 lavender-panel border-brand-100">
            <div className="flex items-center gap-4">
              <span className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-100 text-brand-600"><CalendarCheck2 className="h-9 w-9" /></span>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-ink">No active commitment</h2>
                <p className="mt-1 text-slate-600">Start a commitment and focus on showing up for yourself.</p>
              </div>
              <button onClick={() => navigate("/history")} className="rounded-2xl border border-brand-300 px-5 py-3 font-bold text-brand-600">History</button>
            </div>
          </Card>
        </>
      )}

      <Card className="bg-[#F1ECFF]/70">
        <div className="flex items-center gap-4">
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-white text-[#6D3DF2]">★</span>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-ink">Remember</h2>
            <p className="mt-1 text-lg text-slate-700">You don't need motivation.<br />You need a decision.</p>
          </div>
        </div>
      </Card>

      {sheetCommitment ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30 px-4 pb-4">
          <div className="w-full max-w-md rounded-t-[28px] bg-white p-6 shadow-2xl">
            <h2 className="text-center text-3xl font-semibold text-ink">How do you feel?</h2>
            <div className="mt-6 grid grid-cols-3 gap-3">
              {(["better", "same", "worse"] as ReflectionOutcome[]).map((outcome) => (
                <button key={outcome} onClick={() => submit(outcome)} className="rounded-2xl border border-slate-200 p-4 text-lg font-semibold capitalize text-ink">
                  {outcome === "better" ? "😊" : outcome === "same" ? "😐" : "😞"}<br />{outcome}
                </button>
              ))}
            </div>
            <label className="mt-6 block font-bold text-ink">Feeling score: {score}</label>
            <input className="mt-2 w-full accent-brand-600" type="range" min="1" max="10" value={score} onChange={(event) => setScore(Number(event.target.value))} />
            <textarea className="mt-4 min-h-24 w-full rounded-2xl border border-slate-200 p-4" placeholder="Anything to remember?" value={note} onChange={(event) => setNote(event.target.value)} />
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
