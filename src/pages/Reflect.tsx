import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useCreateReflection } from "../hooks/useAfterMeData";
import type { ReflectionOutcome } from "../lib/types";

const accentColor = "#9D5BFF";

export function Reflect() {
  const { commitmentId } = useParams();
  const navigate = useNavigate();
  const createReflection = useCreateReflection();
  const [outcome, setOutcome] = useState<ReflectionOutcome | null>(null);
  const [score, setScore] = useState(8);
  const [note, setNote] = useState("");

  const submit = async () => {
    if (!commitmentId || !outcome) return;
    await createReflection.mutateAsync({ commitmentId, outcome, feelingScore: score, note });
    navigate("/today?logged=1");
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden px-5 py-7 text-white"
      style={{
        backgroundImage: "url('/reference/quick.png'), linear-gradient(160deg, #2A3140 0%, #3D4252 45%, #2D2A2F 100%)",
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.24)_0%,rgba(0,0,0,0.52)_58%,rgba(0,0,0,0.74)_100%)]" />
      <main className="relative mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-md flex-col">
        <nav className="flex items-center justify-between">
          <button onClick={() => navigate("/today")} className="text-[28px] italic leading-none text-white" style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 400 }}>
            AfterMe
          </button>
          <span className="rounded-full border border-white/25 bg-white/15 px-3 py-1.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-white backdrop-blur-[10px]">
            Reflect
          </span>
        </nav>

        <section className="mt-16 text-center">
          <div className="mx-auto inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-white backdrop-blur-[10px]">
            <Sparkles className="h-3.5 w-3.5" />
            How was it?
          </div>
          <h1 className="mx-auto mt-5 max-w-[300px] text-[38px] leading-[1.05] text-white" style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 400, textShadow: "0 1px 12px rgba(0,0,0,0.3)" }}>
            How do you <em style={{ color: accentColor, fontStyle: "italic", fontWeight: 600 }}>feel</em>?
          </h1>
        </section>

        <section
          className="mt-8 rounded-[18px] border px-4 py-[18px] text-[#1A1A1C] shadow-[0_12px_32px_rgba(0,0,0,0.18)]"
          style={{
            background: "rgba(255,255,255,0.72)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            borderColor: "rgba(255,255,255,0.45)",
            borderWidth: "0.5px",
          }}
        >
          <div className="grid grid-cols-3 gap-2">
            {(["better", "same", "worse"] as ReflectionOutcome[]).map((item) => {
              const active = outcome === item;
              return (
                <button
                  key={item}
                  onClick={() => setOutcome(item)}
                  className="rounded-[14px] border p-4 text-[15px] font-semibold capitalize transition"
                  style={{
                    background: active ? accentColor : "rgba(255,255,255,0.6)",
                    borderColor: active ? accentColor : "rgba(42,49,64,0.15)",
                    borderWidth: "0.5px",
                    color: active ? "white" : "#2A3140",
                    transition: "background 0.3s ease, color 0.3s ease, border-color 0.3s ease",
                  }}
                >
                  {item}
                </button>
              );
            })}
          </div>

          <label className="mt-6 block text-sm font-bold text-[#2A3140]">Feeling score: {score}</label>
          <input className="mt-2 w-full" style={{ accentColor }} type="range" min="1" max="10" value={score} onChange={(event) => setScore(Number(event.target.value))} />
          <textarea
            className="mt-5 min-h-32 w-full rounded-2xl border border-white/60 bg-white/55 p-4 text-[#1A1A1C] outline-none placeholder:text-[#5A6175]/65"
            placeholder="Anything to remember?"
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
          <button
            onClick={submit}
            disabled={!outcome}
            className="mt-5 h-14 w-full rounded-full px-5 font-semibold text-white shadow-[0_18px_36px_-12px_rgba(0,0,0,0.32)] transition disabled:opacity-40"
            style={{ background: accentColor }}
          >
            Log it
          </button>
        </section>
      </main>
    </div>
  );
}
