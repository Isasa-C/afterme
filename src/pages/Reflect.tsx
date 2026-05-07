import { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useActivities, useCommitment, useCreateReflection } from "../hooks/useAfterMeData";
import type { Activity, ReflectionOutcome } from "../lib/types";

const activityBackgrounds: Record<string, string> = {
  gym: "/reference/gym.png",
  focus: "/reference/study.png",
  swimming: "/reference/swimming.png",
  outside: "/reference/quick.png",
  social: "/reference/reach-out.png",
};

const activityAccents: Record<string, string> = {
  gym: "#9D5BFF",
  focus: "#E8A838",
  swimming: "#2A82C4",
  outside: "#4A9E6B",
  social: "#D4546A",
};

const moodOptions = [
  { value: 1, emoji: "😴" },
  { value: 2, emoji: "😕" },
  { value: 3, emoji: "😐" },
  { value: 4, emoji: "🙂" },
  { value: 5, emoji: "💪" },
];

function moodToOutcome(mood: number): ReflectionOutcome {
  if (mood >= 4) return "better";
  if (mood === 3) return "same";
  return "worse";
}

function formatActivityPill(activity: Activity | undefined) {
  const label = activity?.name ?? "Journal";
  const cleaned = label.replace(/^go to the\s+/i, "").replace(/^do\s+/i, "").trim();
  const suffix = cleaned.toLowerCase().includes("gym") ? "session" : "";
  return [cleaned, suffix].filter(Boolean).join(" ").toUpperCase();
}

function dateTimeLabel(date: Date) {
  const datePart = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "short" }).format(date);
  const timePart = new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(date).toLowerCase();
  return `${datePart} · ${timePart}`;
}

function placeholderFor(activity: Activity | undefined) {
  const haystack = `${activity?.id ?? ""} ${activity?.key ?? ""} ${activity?.name ?? ""}`.toLowerCase();
  if (haystack.includes("gym")) return "How did your body feel today?";
  if (haystack.includes("swim")) return "How were the waters today?";
  if (haystack.includes("grocery") || haystack.includes("errand") || haystack.includes("outside")) return "Anything on your mind?";
  if (haystack.includes("study") || haystack.includes("focus")) return "What did you learn?";
  if (haystack.includes("social") || haystack.includes("reach")) return "How was the energy?";
  return "Anything on your mind?";
}

export function Reflect() {
  const { commitmentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = location.state as { grocery?: { itemsBought?: string[] } } | null;
  const groceryItemsBought = routeState?.grocery?.itemsBought ?? [];
  const { data: commitment } = useCommitment(commitmentId);
  const { data: activities = [] } = useActivities();
  const createReflection = useCreateReflection();
  const [mood, setMood] = useState<number | null>(null);
  const [text, setText] = useState("");
  const savedAt = useMemo(() => new Date(), []);
  const activity = activities.find((item) => item.id === commitment?.activity_id);
  const accentColor = activity?.color ?? activityAccents[activity?.id ?? ""] ?? activityAccents[activity?.key ?? "gym"] ?? activityAccents.gym;
  const backgroundImage = activityBackgrounds[activity?.id ?? ""] ?? activityBackgrounds[activity?.key ?? ""] ?? activityBackgrounds.outside;
  const activityLabel = formatActivityPill(activity);

  const save = async () => {
    if (!commitmentId || !mood) return;
    const entry = {
      activity: activity?.name ?? "Activity",
      date: savedAt.toISOString(),
      mood,
      text: text.trim(),
      itemsBought: groceryItemsBought,
    };
    await createReflection.mutateAsync({
      commitmentId,
      outcome: moodToOutcome(mood),
      note: entry.text,
    });
    try {
      const raw = window.localStorage.getItem("afterme.journal.entries");
      const entries = raw ? (JSON.parse(raw) as typeof entry[]) : [];
      window.localStorage.setItem("afterme.journal.entries", JSON.stringify([entry, ...entries]));
    } catch {
      // Reflection state is the source of truth; local journal cache is best effort.
    }
    navigate("/history");
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden px-4 py-6 text-white"
      style={{
        backgroundImage: `url('${backgroundImage}'), linear-gradient(160deg, #2A3140 0%, #3D4252 45%, #2D2A2F 100%)`,
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.24)_0%,rgba(0,0,0,0.52)_58%,rgba(0,0,0,0.74)_100%)]" />
      <main className="relative mx-auto flex min-h-[calc(100vh-3rem)] max-w-md flex-col justify-center">
        <section
          className="rounded-[26px] border px-4 py-5 text-[#1A1A1C] shadow-[0_18px_48px_rgba(0,0,0,0.24)]"
          style={{
            background: "rgba(255,255,255,0.78)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderColor: "rgba(255,255,255,0.45)",
            borderWidth: "0.5px",
          }}
        >
          <header>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span
                className="rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em]"
                style={{
                  borderColor: `${accentColor}55`,
                  background: `${accentColor}18`,
                  color: accentColor,
                }}
              >
                {activityLabel}
              </span>
              <span className="text-[12px] font-semibold text-black/45">{dateTimeLabel(savedAt)}</span>
            </div>
            <h1 className="mt-5 text-center text-[34px] leading-[1.05] text-[#1A1A1C]" style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 400 }}>
              How do you feel?
            </h1>
          </header>

          <div className="mt-6 flex items-center justify-between gap-2" aria-label="Energy and mood">
            {moodOptions.map((option) => {
              const selected = mood === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setMood(option.value)}
                  aria-pressed={selected}
                  className="relative grid h-12 w-12 place-items-center rounded-full text-[13px] font-bold transition active:scale-95"
                  style={{
                    background: selected ? accentColor : "rgba(255,255,255,0.55)",
                    color: selected ? "white" : "#2A3140",
                    boxShadow: selected ? `0 12px 26px -16px ${accentColor}` : "inset 0 1px 0 rgba(255,255,255,0.6)",
                  }}
                >
                  <span className="absolute -top-2 text-[17px] leading-none">{option.emoji}</span>
                  <span className="pt-3">{option.value}</span>
                </button>
              );
            })}
          </div>

          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder={placeholderFor(activity)}
            className="mt-7 min-h-[180px] w-full resize-none rounded-none bg-transparent px-1 py-1 text-[15px] leading-[1.8] text-[#1A1A1C] outline-none placeholder:text-black/35"
            style={{
              border: "none",
              fontFamily: "Georgia, 'Times New Roman', serif",
              backgroundImage: "linear-gradient(to bottom, transparent 0, transparent 26px, rgba(42,49,64,0.16) 27px)",
              backgroundSize: "100% 27px",
              backgroundAttachment: "local",
            }}
          />

          <button
            type="button"
            onClick={save}
            disabled={!mood || createReflection.isPending}
            className="mt-5 flex h-14 w-full items-center justify-center rounded-full bg-[#111111] px-5 py-3 text-[15px] font-semibold text-white shadow-[0_18px_36px_-18px_rgba(0,0,0,0.55)] transition disabled:opacity-35"
          >
            Save to journal →
          </button>
        </section>
      </main>
    </div>
  );
}
