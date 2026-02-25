export interface Habit {
  id: string;
  name: string;
  category: HabitCategory;
  description: string;
  notes: string;
  createdAt: string;
  logs: string[]; // ISO date strings "YYYY-MM-DD"
}

export type HabitCategory = "Health" | "Study" | "Coding" | "Fitness" | "Personal";

export const CATEGORIES: HabitCategory[] = ["Health", "Study", "Coding", "Fitness", "Personal"];

export const CATEGORY_COLORS: Record<HabitCategory, string> = {
  Health: "from-emerald-500 to-teal-400",
  Study: "from-blue-500 to-indigo-400",
  Coding: "from-violet-500 to-purple-400",
  Fitness: "from-orange-500 to-amber-400",
  Personal: "from-pink-500 to-rose-400",
};
