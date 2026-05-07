import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ActivityIcon } from "../components/ActivityIcon";
import { AppShell } from "../components/AppShell";
import { Mascot } from "../components/Mascot";
import { OutcomePill } from "../components/OutcomePill";
import { Card } from "../components/ui";
import { useMonthHistory, useOverallStats } from "../hooks/useAfterMeData";
import type { ActivityKey, MonthHistoryCommitment, MonthHistoryDay, ReflectionOutcome } from "../lib/types";
import { cn, timeLabel } from "../lib/utils";

const accent = "#6D28D9";
const inkMuted = "#6D3DF2";

const weekdayLabels = ["M", "T", "W", "T", "F", "S", "S"];
const outcomeValue: Record<ReflectionOutcome, number> = {
  better: 1,
  same: 0.5,
  worse: 0,
};

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function monthLabel(year: number, month: number) {
  return new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(new Date(year, month, 1));
}

function fullDateLabel(date: string) {
  return new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric" }).format(new Date(`${date}T12:00:00`));
}

function activityKeyForName(name: string): ActivityKey {
  const lower = name.toLowerCase();
  if (lower.includes("gym")) return "gym";
  if (lower.includes("focused")) return "focus";
  if (lower.includes("outside")) return "outside";
  if (lower.includes("reach")) return "social";
  return "custom";
}

function getCalendarDays(year: number, month: number) {
  const first = new Date(year, month, 1);
  const mondayIndex = (first.getDay() + 6) % 7;
  const start = new Date(year, month, 1 - mondayIndex);
  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return day;
  });
}

function dayEvidence(commitments: MonthHistoryCommitment[]) {
  if (!commitments.length) return { kind: "empty" as const, score: null };
  if (commitments.some((commitment) => !commitment.reflection?.outcome)) return { kind: "unreflected" as const, score: null };
  const score = commitments.reduce((sum, commitment) => sum + outcomeValue[commitment.reflection!.outcome!], 0) / commitments.length;
  if (score >= 0.66) return { kind: "better" as const, score };
  if (score >= 0.34) return { kind: "same" as const, score };
  return { kind: "worse" as const, score };
}

function evidenceStyle(kind: ReturnType<typeof dayEvidence>["kind"]) {
  if (kind === "better") return { backgroundColor: "rgba(109, 40, 217, 0.58)" };
  if (kind === "same") return { backgroundColor: "rgba(109, 40, 217, 0.24)" };
  if (kind === "worse") return { backgroundColor: "#FFE8E8" };
  return {};
}

export function HistoryPage() {
  const navigate = useNavigate();
  const today = new Date();
  const [visibleMonth, setVisibleMonth] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [selectedDay, setSelectedDay] = useState<MonthHistoryDay | null>(null);
  const [emptyTooltip, setEmptyTooltip] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const { data: overall } = useOverallStats();
  const { data: history } = useMonthHistory(visibleMonth.year, visibleMonth.month);
  const dayMap = useMemo(() => new Map((history?.days ?? []).map((day) => [day.date, day])), [history]);
  const calendarDays = useMemo(() => getCalendarDays(visibleMonth.year, visibleMonth.month), [visibleMonth]);
  const isCurrentMonth = visibleMonth.year === today.getFullYear() && visibleMonth.month === today.getMonth();
  const hasAnyCommitments = (overall?.totalCommitments ?? 0) > 0;
  const hasMonthCommitments = (history?.summary.showedUpDays ?? 0) > 0;

  const selectEmpty = (key: string) => {
    setEmptyTooltip(key);
    window.setTimeout(() => setEmptyTooltip(null), 1500);
  };

  const goMonth = (delta: number) => {
    const next = new Date(visibleMonth.year, visibleMonth.month + delta, 1);
    setVisibleMonth({ year: next.getFullYear(), month: next.getMonth() });
    setSelectedDay(null);
  };

  const monthOptions = Array.from({ length: 36 }, (_, index) => new Date(today.getFullYear(), today.getMonth() - index, 1));

  return (
    <AppShell>
      <header className="relative mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-white drop-shadow-[0_1px_12px_rgba(0,0,0,0.3)]">History</h1>
          <p className="mt-2 text-[15px] leading-relaxed text-white/75">{overall?.totalCommitments ?? 0} times you showed up.</p>
        </div>
        <Mascot variant={hasMonthCommitments ? "waving" : "thinking"} className="absolute right-12 top-0 h-auto w-16" />
        <button
          onClick={() => setPickerOpen(true)}
          className="relative z-10 mt-1 grid h-11 w-11 place-items-center rounded-full border border-white/35 bg-white/20 text-white shadow-sm backdrop-blur-[18px]"
          aria-label="Choose month"
        >
          <CalendarDays className="h-5 w-5" />
        </button>
      </header>

      {!hasAnyCommitments ? (
        <section className="grid min-h-[52vh] place-items-center text-center">
          <div>
            <Mascot variant="thinking" className="mx-auto mb-4 h-auto w-24" />
            <h2 className="text-2xl font-semibold text-white">Your evidence starts here.</h2>
            <p className="mx-auto mt-4 max-w-xs text-[15px] leading-relaxed text-white/72">
              Once you show up, the days fill in. Nothing here yet — that's fine.
            </p>
            <button onClick={() => navigate("/today")} className="mt-8 rounded-full border border-white/55 bg-white/85 px-5 py-3 text-[15px] font-semibold text-ink shadow-sm backdrop-blur-[18px]">
              Go to Today →
            </button>
          </div>
        </section>
      ) : (
        <>
          <nav className="mb-5 flex items-center justify-center gap-6">
            <button onClick={() => goMonth(-1)} aria-label="Previous month" className="text-white/72 transition-colors hover:text-white">
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button onClick={() => setPickerOpen(true)} className="min-w-36 text-center text-[22px] font-bold leading-tight text-white drop-shadow-[0_1px_10px_rgba(0,0,0,0.3)]">
              {monthLabel(visibleMonth.year, visibleMonth.month)}
            </button>
            <button disabled={isCurrentMonth} onClick={() => goMonth(1)} aria-label="Next month" className="text-white/72 transition-colors hover:text-white disabled:opacity-30">
              <ChevronRight className="h-6 w-6" />
            </button>
          </nav>

          <Card padding="p-4" className="border-white/45 bg-white/72">
            <div className="grid grid-cols-7">
              {weekdayLabels.map((label, index) => (
                <div key={`${label}-${index}`} className="sticky top-0 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                  {label}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 transition-opacity duration-[250ms] ease-out">
              {calendarDays.map((date) => {
                const key = dateKey(date);
                const inMonth = date.getMonth() === visibleMonth.month;
                const future = date > new Date(today.getFullYear(), today.getMonth(), today.getDate()) && inMonth;
                const day = dayMap.get(key) ?? { date: key, commitments: [] };
                const evidence = inMonth ? dayEvidence(day.commitments) : { kind: "empty" as const, score: null };
                const isToday = key === dateKey(today);
                const selected = selectedDay?.date === key;
                const tappable = !future;

                return (
                  <button
                    key={key}
                    disabled={!tappable}
                    onClick={() => {
                      if (!inMonth) {
                        setVisibleMonth({ year: date.getFullYear(), month: date.getMonth() });
                        return;
                      }
                      if (day.commitments.length) setSelectedDay(day);
                      else selectEmpty(key);
                    }}
                    className={cn(
                      "relative aspect-square min-h-12 rounded-lg p-2 text-left transition-colors",
                      future && "cursor-default",
                      selected && "ring-2 ring-brand-500",
                      !inMonth && "bg-transparent",
                      inMonth && evidence.kind === "empty" && "bg-white/45",
                      evidence.kind === "unreflected" && "ring-2 ring-brand-500",
                    )}
                    style={{
                      ...evidenceStyle(evidence.kind),
                    }}
                  >
                    <span
                      className="text-xs font-medium leading-none"
                      style={{
                        color: evidence.kind === "better" ? "#fff" : evidence.kind === "unreflected" ? accent : inkMuted,
                        opacity: inMonth ? 1 : 0.4,
                      }}
                    >
                      {date.getDate()}
                    </span>

                    {inMonth && day.commitments.length > 0 && evidence.kind !== "unreflected" ? (
                      <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-0.5">
                        {evidence.kind === "better" ? (
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.65)]" aria-hidden="true" />
                        ) : null}
                        {day.commitments.slice(0, 4).map((commitment) => (
                          <span
                            key={commitment.id}
                            className="h-1 w-1 rounded-full"
                            style={{ backgroundColor: commitment.reflection?.outcome === "better" ? accent : commitment.reflection?.outcome === "same" ? "rgba(109, 40, 217, 0.70)" : inkMuted }}
                          />
                        ))}
                        {day.commitments.length > 4 ? <span className="ml-0.5 text-[9px] text-slate-500">+{day.commitments.length - 4}</span> : null}
                      </div>
                    ) : null}

                    {isToday ? <span className="absolute bottom-1 right-1 h-[5px] w-[5px] rounded-full" style={{ backgroundColor: accent }} /> : null}
                    {emptyTooltip === key ? (
                      <span className="absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink px-3 py-1 text-[11px] font-semibold text-white">
                        Nothing logged.
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
            <p className="mt-5 text-center text-[15px] leading-relaxed text-slate-600">
              {history?.summary.showedUpDays ?? 0} of {history?.summary.daysElapsed ?? 0} days this month — keep showing up for yourself.
            </p>
          </Card>

          {!hasMonthCommitments && history?.previousMonthWithActivity ? (
            <button
              onClick={() => setVisibleMonth(history.previousMonthWithActivity!)}
              className="mt-3 w-full text-center text-[13px] font-semibold leading-[1.4] text-white/72 underline-offset-4 hover:underline"
            >
              Nothing this month. Try {monthLabel(history.previousMonthWithActivity.year, history.previousMonthWithActivity.month)} →
            </button>
          ) : null}
        </>
      )}

      {selectedDay ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm" onClick={() => setSelectedDay(null)}>
          <section
            className="h-[70vh] w-full max-w-md translate-y-0 rounded-t-[28px] border border-white/45 bg-white/78 p-5 shadow-2xl backdrop-blur-[18px] transition-transform duration-[350ms] ease-out"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto mb-6 h-1.5 w-12 rounded-full bg-brand-100" />
            <div className="mb-6 flex items-start justify-between gap-4">
              <h2 className="text-2xl font-semibold text-ink">{fullDateLabel(selectedDay.date)}</h2>
              <button onClick={() => setSelectedDay(null)} aria-label="Close"><X className="h-5 w-5 text-slate-500" /></button>
            </div>

            <div className="max-h-[calc(70vh-150px)] overflow-y-auto">
              {selectedDay.commitments.map((commitment) => (
                <article key={commitment.id} className="border-b border-brand-100 py-4 last:border-b-0">
                  <div className="flex items-start gap-3">
                    <ActivityIcon activityKey={activityKeyForName(commitment.activityName)} className="h-12 w-12 rounded-xl" />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-bold leading-tight text-ink">{commitment.activityName}</h3>
                      <p className="mt-1 text-[13px] font-medium leading-[1.4] tracking-[0.01em] text-slate-500">
                        {timeLabel(commitment.startedAt)} · {commitment.durationMin} min
                      </p>
                    </div>
                    {commitment.reflection?.outcome ? <OutcomePill outcome={commitment.reflection.outcome} /> : <span className="text-[13px] font-semibold text-brand-600">Needs reflection</span>}
                  </div>
                  {commitment.reflection?.note ? (
                    <p className="mt-3 pl-[60px] text-[15px] italic leading-relaxed text-slate-500">💜 “{commitment.reflection.note}”</p>
                  ) : null}
                </article>
              ))}
              {selectedDay.commitments.some((commitment) => !commitment.reflection?.outcome) ? (
                <button
                  onClick={() => {
                    const commitment = selectedDay.commitments.find((item) => !item.reflection?.outcome);
                    if (commitment) navigate(`/reflect/${commitment.id}`);
                  }}
                  className="mt-5 text-[15px] font-semibold text-brand-600"
                >
                  Reflect on this →
                </button>
              ) : null}
            </div>
          </section>
        </div>
      ) : null}

      {pickerOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-5 backdrop-blur-sm" onClick={() => setPickerOpen(false)}>
          <section className="max-h-[70vh] w-full max-w-sm overflow-y-auto rounded-2xl border border-white/45 bg-white/78 p-4 shadow-soft backdrop-blur-[18px]" onClick={(event) => event.stopPropagation()}>
            {monthOptions.map((date) => (
              <button
                key={date.toISOString()}
                onClick={() => {
                  setVisibleMonth({ year: date.getFullYear(), month: date.getMonth() });
                  setPickerOpen(false);
                }}
                className="w-full border-b border-brand-100 px-2 py-4 text-left text-xl font-bold leading-tight text-ink last:border-b-0"
              >
                {monthLabel(date.getFullYear(), date.getMonth())}
              </button>
            ))}
          </section>
        </div>
      ) : null}
    </AppShell>
  );
}
