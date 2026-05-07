import type { ActivityKey } from "../lib/types";

export const packCopy: Record<ActivityKey, { headline: string; subline: string; outHeadline: string }> = {
  gym: {
    headline: "Going to the gym.",
    subline: "Grab these. Then go.",
    outHeadline: "You're out.",
  },
  outside: {
    headline: "Going outside.",
    subline: "Grab these. Then step out.",
    outHeadline: "You're out.",
  },
  social: {
    headline: "Reaching out.",
    subline: "Just these four steps.",
    outHeadline: "It's sent.",
  },
  focus: {
    headline: "Focused work.",
    subline: "Set the table. Then sit down.",
    outHeadline: "You started.",
  },
  custom: {
    headline: "Starting.",
    subline: "Just these steps.",
    outHeadline: "You're there.",
  },
};
