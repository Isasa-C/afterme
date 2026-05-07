export type Activity = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  durationMinutes: number;
  checklist: string[];
  completedSessions: number;
};

export const activities: Activity[] = [
  {
    id: "gym",
    title: "Go to the gym",
    subtitle: "Pack and move",
    icon: "dumbbell",
    durationMinutes: 45,
    checklist: ["Shoes", "Water bottle", "Headphones", "Towel"],
    completedSessions: 0,
  },
  {
    id: "focused-work",
    title: "Do focused work",
    subtitle: "Calm focus sprint",
    icon: "laptop",
    durationMinutes: 25,
    checklist: ["Laptop", "Water", "Phone away", "One clear task"],
    completedSessions: 0,
  },
  {
    id: "outside",
    title: "Go outside",
    subtitle: "Fresh air reset",
    icon: "walk",
    durationMinutes: 20,
    checklist: ["Shoes", "Keys", "Jacket", "Headphones"],
    completedSessions: 0,
  },
  {
    id: "reach-out",
    title: "Reach out to someone",
    subtitle: "Tiny social step",
    icon: "message-text-outline",
    durationMinutes: 5,
    checklist: ["Pick the person", "Type \"hey\"", "One sentence", "Send it"],
    completedSessions: 0,
  },
];
