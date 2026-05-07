import { type FormEvent, useState } from "react";
import { Chrome, Mail, Sparkles } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { signInWithEmail } from "../lib/auth";

export function Auth() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");

  const submit = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    if (!email.trim()) return;
    signInWithEmail(email);
    queryClient.clear();
    navigate("/profile");
  };

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 text-white"
      style={{
        backgroundImage: "url('/reference/reach-out.png'), linear-gradient(160deg, #2A3140 0%, #3D4252 45%, #2D2A2F 100%)",
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.24)_0%,rgba(0,0,0,0.52)_58%,rgba(0,0,0,0.74)_100%)]" />
      <main className="relative w-full max-w-md">
        <div className="text-center">
          <div className="mx-auto inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-white backdrop-blur-[10px]">
            <Sparkles className="h-3.5 w-3.5" />
            Keep your own progress
          </div>
          <h1 className="mt-5 text-[48px] italic leading-none text-white" style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 400, textShadow: "0 1px 12px rgba(0,0,0,0.3)" }}>
            AfterMe
          </h1>
          <p className="mx-auto mt-4 max-w-xs text-[14px] leading-relaxed text-white/78">Sign in so your routines, calendar, and reflections stay separate.</p>
        </div>

        <form
          className="mt-8 rounded-[18px] border px-4 py-[18px] text-[#1A1A1C] shadow-[0_12px_32px_rgba(0,0,0,0.18)]"
          style={{
            background: "rgba(255,255,255,0.72)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            borderColor: "rgba(255,255,255,0.45)",
            borderWidth: "0.5px",
          }}
          onSubmit={submit}
        >
          <label className="text-sm font-bold text-[#2A3140]" htmlFor="email">Email</label>
          <div className="mt-2 flex items-center gap-2 rounded-2xl border border-white/60 bg-white/55 px-4 py-3">
            <Mail className="h-5 w-5 text-[#9D5BFF]" />
            <input id="email" value={email} onChange={(event) => setEmail(event.target.value)} className="min-w-0 flex-1 bg-transparent text-[15px] font-semibold outline-none placeholder:text-[#5A6175]/65" placeholder="you@example.com" type="email" />
          </div>
          <button type="submit" disabled={!email.trim()} className="mt-4 w-full rounded-full bg-[#9D5BFF] p-[13px] text-[14px] font-medium text-white disabled:opacity-45">
            Sign in
          </button>
          <button
            type="button"
            onClick={() => {
              signInWithEmail("demo@afterme.app");
              queryClient.clear();
              navigate("/profile");
            }}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-white/60 bg-white/45 p-[13px] text-[14px] font-semibold text-[#1A1A1C]"
          >
            <Chrome className="h-5 w-5" />
            Use demo account
          </button>
        </form>
      </main>
    </div>
  );
}
