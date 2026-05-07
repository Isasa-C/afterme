import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mascot } from "../components/Mascot";
import { Card } from "../components/ui";

export function Onboarding() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const titles = [
    "What do you avoid even though it helps you?",
    "When do you usually struggle most?",
    "Set a daily nudge",
  ];
  const options = step === 0 ? ["Gym", "Focused work", "Going outside", "Reaching out", "Meditating", "Sleeping early"] : step === 1 ? ["Morning", "Afternoon", "Evening", "Late night"] : ["7:00 PM", "Skip for now"];

  return (
    <div className="phone-shell min-h-screen px-5 py-12">
      <main className="mx-auto max-w-md">
        <Mascot variant={step === 2 ? "celebrating" : "thinking"} className="mx-auto" />
        <Card>
          <div className="mb-4 text-sm font-bold text-brand-600">Step {step + 1} of 3</div>
          <h1 className="text-3xl font-semibold text-ink">{titles[step]}</h1>
          <div className="mt-6 flex flex-wrap gap-3">
            {options.map((option) => (
              <button key={option} className="rounded-pill border border-brand-100 bg-brand-50 px-4 py-3 font-bold text-brand-700">{option}</button>
            ))}
          </div>
          <button onClick={() => (step === 2 ? navigate("/") : setStep((value) => value + 1))} className="mt-8 w-full rounded-2xl bg-brand-600 py-4 font-semibold text-white">
            {step === 2 ? "You're set. Future you says thanks." : "Continue"}
          </button>
        </Card>
      </main>
    </div>
  );
}
