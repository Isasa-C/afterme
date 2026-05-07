import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { ActivityIcon } from "../components/ActivityIcon";
import { AppShell } from "../components/AppShell";
import { OutcomePill } from "../components/OutcomePill";
import { ProgressBar } from "../components/ProgressBar";
import { Card } from "../components/ui";
import { useActivities, useRecentEntries, useStatsByActivity } from "../hooks/useAfterMeData";
import { timeLabel } from "../lib/utils";

export function ActivityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: activities = [] } = useActivities();
  const { data: stats = [] } = useStatsByActivity();
  const { data: entries = [] } = useRecentEntries(100);
  const activity = activities.find((item) => item.id === id);
  const itemStats = stats.find((item) => item.activityId === id);
  const activityEntries = entries.filter((entry) => entry.activity_id === id);

  return (
    <AppShell>
      <header className="mb-6 flex items-center gap-4">
        <button onClick={() => navigate(-1)} aria-label="Go back"><ArrowLeft className="h-8 w-8" /></button>
        <h1 className="text-3xl font-semibold text-ink">{activity?.name ?? "Activity"}</h1>
      </header>
      {activity ? (
        <>
          <Card className="mb-8">
            <div className="flex items-center gap-4">
              <ActivityIcon activityKey={activity.key} />
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-ink">{itemStats?.feltBetterPct ?? 0}% felt better</h2>
                <p className="text-slate-500">{itemStats?.betterCount ?? 0} / {itemStats?.reflectedCount ?? 0} reflections</p>
              </div>
            </div>
            <ProgressBar value={itemStats?.feltBetterPct ?? 0} colorKey={activity.key} className="mt-6" />
          </Card>
          <Card padding="p-4">
            {activityEntries.map((entry) => (
              <div key={entry.id} className="flex items-center gap-4 border-b border-slate-100 py-4 last:border-b-0">
                <div className="flex-1">
                  <div className="font-bold text-ink">{new Intl.DateTimeFormat("en", { weekday: "short", month: "short", day: "numeric" }).format(new Date(entry.started_at))}</div>
                  <div className="text-slate-500">{timeLabel(entry.started_at)} • {entry.duration_minutes} min</div>
                </div>
                {entry.reflection ? <OutcomePill outcome={entry.reflection.outcome} /> : null}
              </div>
            ))}
          </Card>
        </>
      ) : null}
    </AppShell>
  );
}
