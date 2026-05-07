import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { useActivities, useCommitment } from "../hooks/useAfterMeData";

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

function formatClock(seconds: number) {
  const minutes = Math.floor(Math.abs(seconds) / 60);
  const secs = Math.abs(seconds) % 60;
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

export function Committed() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: commitment } = useCommitment(id);
  const { data: activities = [] } = useActivities();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const elapsed = useMemo(() => {
    const start = commitment?.started_at;
    return start ? Math.max(0, Math.floor((now - +new Date(start)) / 1000)) : 0;
  }, [commitment, now]);
  const minimumSeconds = (commitment?.minimum_minutes ?? 10) * 60;
  const remaining = Math.max(0, minimumSeconds - elapsed);
  const kept = remaining <= 0;
  const bonus = Math.max(0, elapsed - minimumSeconds);
  const timerRadius = 78;
  const timerCircumference = 2 * Math.PI * timerRadius;
  const timerProgress = Math.min(elapsed / minimumSeconds, 1);
  const activity = activities.find((item) => item.id === commitment?.activity_id);
  const backgroundImage = activityBackgrounds[activity?.id ?? ""] ?? "/reference/quick.png";
  const accentColor = activityAccents[activity?.id ?? ""] ?? "#9D5BFF";

  return (
    <div
      className="relative min-h-screen overflow-hidden px-5 py-7 text-white"
      style={{
        backgroundImage: `url('${backgroundImage}'), linear-gradient(160deg, #2A3140 0%, #3D4252 45%, #2D2A2F 100%)`,
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.24)_0%,rgba(0,0,0,0.52)_58%,rgba(0,0,0,0.74)_100%)]" />
      <main className="relative mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-md flex-col text-center">
        <nav className="flex items-center justify-between">
          <button onClick={() => navigate("/today")} className="text-[28px] italic leading-none text-white" style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 400 }}>
            AfterMe
          </button>
          <span className="rounded-full border border-white/25 bg-white/15 px-3 py-1.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-white backdrop-blur-[10px]">
            Out the door
          </span>
        </nav>

        <section className="mt-16 text-center">
          <div className="mx-auto mb-5 inline-flex items-center gap-1.5 rounded-full border border-white/60 bg-white/45 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: accentColor }}>
            <Sparkles className="h-3.5 w-3.5" />
            {activity?.name ?? "Future you"} is moving
          </div>
        </section>

        <section className="my-auto grid place-items-center">
          <div className="relative grid h-48 w-48 place-items-center rounded-full bg-white/15 shadow-[0_18px_42px_rgba(0,0,0,0.25)] backdrop-blur-[18px]">
            <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 180 180" aria-hidden="true">
              <circle cx="90" cy="90" r={timerRadius} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="10" />
              <circle
                cx="90"
                cy="90"
                r={timerRadius}
                fill="none"
                stroke={accentColor}
                strokeLinecap="round"
                strokeWidth="10"
                strokeDasharray={timerCircumference}
                strokeDashoffset={timerCircumference * (1 - timerProgress)}
                style={{ transition: "stroke-dashoffset 0.4s ease, stroke 0.3s ease" }}
              />
            </svg>
            <div className="relative text-center text-white">
              <div className="text-[42px] font-semibold leading-none tracking-[-0.02em]">{kept ? formatClock(bonus) : formatClock(remaining)}</div>
              <div className="mt-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/68">{kept ? "bonus" : "left"}</div>
            </div>
          </div>
        </section>

        <button
          onClick={() => navigate(`/reflect/${id}`)}
          className="mb-3 flex h-12 w-full items-center justify-center gap-2 rounded-full px-5 font-semibold text-white shadow-[0_18px_36px_-12px_rgba(0,0,0,0.32)]"
          style={{ background: accentColor }}
          aria-label="Continue to reflection"
        >
          Time to reflect
          <ArrowRight className="h-4 w-4" />
        </button>
      </main>
    </div>
  );
}
