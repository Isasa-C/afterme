import { useMemo, useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { ActivityIcon } from "../components/ActivityIcon";
import { TopNav } from "../components/BottomNav";
import { ItemIcon } from "../components/ItemIcon";
import { useActivities, useActivityItems } from "../hooks/useAfterMeData";

function formatClock(seconds: number) {
  const minutes = Math.floor(Math.abs(seconds) / 60);
  const secs = Math.abs(seconds) % 60;
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

export function WebDashboard() {
  const { data: activities = [] } = useActivities();
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const selectedActivity = useMemo(
    () => activities.find((activity) => activity.id === selectedActivityId) ?? activities[0] ?? null,
    [activities, selectedActivityId],
  );
  const { data: items = [] } = useActivityItems(selectedActivity?.id);

  const total = 10 * 60;
  const remaining = 6 * 60 + 24;
  const progress = Math.max(0, Math.min(1, (total - remaining) / total));
  const radius = 98;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#91A7EA] via-[#C8D2EE] to-[#A4ADF0] text-[#5B4FCF]">
      <TopNav />
      <div className="mx-auto grid w-full max-w-[1380px] grid-cols-1 gap-6 p-6 md:p-10 xl:grid-cols-[320px_minmax(540px,1fr)_320px]">
        <aside className="glass-card rounded-[30px] p-5">
          <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-[#6D5BE1]">Activities</h2>
          <div className="mt-4 space-y-3">
            {activities.map((activity) => {
              const active = activity.id === selectedActivity?.id;
              return (
                <button
                  key={activity.id}
                  onClick={() => setSelectedActivityId(activity.id)}
                  className={`glass-card flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${active ? "ring-2 ring-white/40" : "opacity-90 hover:opacity-100"}`}
                >
                  <ActivityIcon activityKey={activity.key} iconKey={activity.icon_key} colorKey={activity.color_key} className="h-12 w-12" />
                  <div>
                    <div className="text-base font-semibold text-[#4E3FC0]">{activity.name}</div>
                    <div className="text-xs font-semibold text-[#7568D8]">{activity.minimum_minutes} min minimum</div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <main className="glass-card relative overflow-hidden rounded-[34px] p-7 md:p-10">
          <div className="absolute -left-24 top-16 h-52 w-52 rounded-full bg-[#a5b9ff]/50 blur-3xl" />
          <div className="absolute -right-28 bottom-10 h-60 w-60 rounded-full bg-[#c5b2ff]/45 blur-3xl" />

          <p className="text-center text-[50px] font-semibold tracking-[-0.02em] text-[#5D4BD2]">Finished!</p>
          <p className="mt-1 text-center text-sm font-semibold text-[#7568D8]">{selectedActivity?.name ?? "Activity"} complete</p>

          <div className="relative z-10 mx-auto mt-8 grid w-full max-w-[540px] place-items-center">
            <svg viewBox="0 0 240 240" className="h-[260px] w-[260px]">
              <circle cx="120" cy="120" r={radius} className="fill-none stroke-white/20" strokeWidth="18" />
              <circle
                cx="120"
                cy="120"
                r={radius}
                className="fill-none stroke-[#21e3b0]"
                strokeWidth="18"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                transform="rotate(-90 120 120)"
              />
            </svg>
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <div className="text-center">
                <div className="text-[44px] font-semibold leading-none text-[#4E3FC0]">{formatClock(remaining)}</div>
                <div className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#7568D8]">Round timer</div>
              </div>
            </div>
          </div>

          <div className="relative z-10 mx-auto mt-4 w-full max-w-[450px] rounded-[30px] bg-white/45 px-7 py-6 text-center shadow-[0_18px_45px_rgba(83,88,167,0.24)]">
            <div className="text-[34px] font-semibold leading-none text-[#4E3FC0]">{selectedActivity?.name ?? "Action"}</div>
            <div className="mt-2 text-sm font-semibold text-[#7568D8]">Ready when you are</div>
          </div>

          <div className="relative z-10 mt-7 flex items-center justify-center gap-3 text-[#1ce5ad]">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-[#18dca5] text-white shadow-[0_10px_24px_rgba(17,173,131,0.45)]">
              <Check className="h-8 w-8" strokeWidth={3} />
            </span>
            <Sparkles className="h-4 w-4" />
            <Sparkles className="h-6 w-6" />
          </div>
        </main>

        <aside className="glass-card rounded-[30px] p-5">
          <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-[#6D5BE1]">Things To Grab</h2>
          <p className="mt-1 text-xs font-semibold text-[#7568D8]">{selectedActivity?.name ?? "Select an activity"}</p>
          <div className="mt-4 space-y-3">
            {items.map((item) => (
              <div key={item.id} className="glass-card flex items-center gap-3 rounded-2xl px-4 py-3">
                <ItemIcon iconKey={item.icon_key} />
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-[#4E3FC0]">{item.label}</div>
                  <div className="truncate text-xs font-semibold text-[#7568D8]">{item.hint ?? item.priority}</div>
                </div>
              </div>
            ))}
            {items.length === 0 ? <div className="text-sm font-semibold text-[#7568D8]">No items yet.</div> : null}
          </div>
        </aside>
      </div>
    </div>
  );
}
