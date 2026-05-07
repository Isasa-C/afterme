import { cn } from "../lib/utils";

type Variant = "hugging-heart" | "waving" | "celebrating" | "thinking";

export function Mascot({ variant, className }: { variant: Variant; className?: string }) {
  const isHeart = variant === "hugging-heart";
  const isWave = variant === "waving";
  const isCelebrate = variant === "celebrating";
  return (
    <svg viewBox="0 0 180 160" className={cn("h-36 w-40", className)} role="img" aria-label="AfterMe mascot">
      {/* TODO: replace with final mascot illustration assets. */}
      <defs>
        <linearGradient id={`blob-${variant}`} x1="0" x2="1" y1="0" y2="1">
          <stop stopColor="rgba(109, 40, 217, 0.22)" />
          <stop offset="1" stopColor="#6D28D9" />
        </linearGradient>
      </defs>
      {isCelebrate ? <path d="M38 118 C70 78 105 68 143 38" fill="none" stroke="#6D28D9" strokeWidth="10" strokeLinecap="round" /> : null}
      {isCelebrate ? <path d="M128 43 L150 28 L146 55" fill="none" stroke="#4C1D95" strokeWidth="9" strokeLinecap="round" /> : null}
      <path d="M58 138 C35 105 48 47 89 32 C132 17 154 62 149 138 Z" fill={`url(#blob-${variant})`} />
      {isWave ? <path d="M125 72 C148 39 156 32 164 20" stroke="#8B5CF6" strokeWidth="18" strokeLinecap="round" fill="none" /> : null}
      {isHeart ? <path d="M77 92 C55 71 72 50 91 66 C110 50 127 71 105 92 L91 106 Z" fill="#ff8fa3" /> : null}
      {variant === "thinking" ? <circle cx="126" cy="45" r="15" fill="#ffd36d" /> : null}
      {isCelebrate ? <rect x="130" y="62" width="12" height="54" rx="6" fill="rgba(109, 40, 217, 0.22)" /> : null}
      <circle cx="82" cy="76" r="4" fill="#07103c" />
      <circle cx="111" cy="76" r="4" fill="#07103c" />
      <path d="M88 94 C94 102 103 102 110 94" fill="none" stroke="#07103c" strokeWidth="4" strokeLinecap="round" />
      {isHeart ? <path d="M55 99 C65 110 76 108 88 98" fill="none" stroke="#EFF7FF" strokeWidth="5" strokeLinecap="round" /> : null}
      {isHeart ? <path d="M124 97 C116 108 105 107 94 98" fill="none" stroke="#EFF7FF" strokeWidth="5" strokeLinecap="round" /> : null}
      {isWave ? <path d="M159 14 L167 4 M169 33 L179 31" stroke="#6D28D9" strokeWidth="4" strokeLinecap="round" /> : null}
      {isCelebrate ? <path d="M76 23 L82 10 M48 44 L36 35" stroke="#ffc84d" strokeWidth="4" strokeLinecap="round" /> : null}
    </svg>
  );
}
