import { ArrowLeft, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { ActivityIcon } from "../components/ActivityIcon";
import { AppShell } from "../components/AppShell";
import { OutcomePill } from "../components/OutcomePill";
import { Card } from "../components/ui";
import { useEntry } from "../hooks/useAfterMeData";
import { timeLabel } from "../lib/utils";

export function EntryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: entry } = useEntry(id);

  return (
    <AppShell>
      <header className="mb-6 flex items-center gap-4">
        <button onClick={() => navigate(-1)} aria-label="Go back"><ArrowLeft className="h-8 w-8" /></button>
        <h1 className="text-3xl font-semibold text-ink">Entry</h1>
      </header>
      {entry ? (
        <Card>
          <div className="flex items-center gap-4">
            <ActivityIcon activityKey={entry.activity.key} />
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-ink">{entry.activity.name}</h2>
              <p className="text-slate-500">{timeLabel(entry.started_at)} • {entry.duration_minutes} min</p>
            </div>
            {entry.reflection ? <OutcomePill outcome={entry.reflection.outcome} /> : null}
          </div>
          <div className="mt-6 rounded-2xl bg-lavender p-4">
            <div className="font-bold text-ink">Note</div>
            <p className="mt-2 text-slate-700">{entry.reflection?.note ?? "Nothing written this time. Showing up still counts."}</p>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button className="rounded-2xl bg-brand-600 py-3 font-bold text-white">Edit</button>
            <button className="flex items-center justify-center gap-2 rounded-2xl border border-red-100 py-3 font-bold text-red-500"><Trash2 className="h-5 w-5" /> Delete</button>
          </div>
        </Card>
      ) : null}
    </AppShell>
  );
}
