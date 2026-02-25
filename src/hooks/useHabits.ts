import { useState, useEffect, useCallback } from "react";
import type { Habit, HabitCategory } from "@/types/habit";

const STORAGE_KEY = "habit-tracker-data";

function loadHabits(): Habit[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveHabits(habits: Habit[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
}

export function todayStr() {
  return new Date().toISOString().split("T")[0];
}

export function getStreak(logs: string[]): { current: number; longest: number } {
  if (!logs.length) return { current: 0, longest: 0 };
  const sorted = [...logs].sort().reverse();
  const today = todayStr();
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  let current = 0;
  let startCheck = sorted[0] === today || sorted[0] === yesterday;
  if (startCheck) {
    let checkDate = sorted[0] === today ? new Date() : new Date(Date.now() - 86400000);
    for (const log of sorted) {
      const expected = checkDate.toISOString().split("T")[0];
      if (log === expected) {
        current++;
        checkDate = new Date(checkDate.getTime() - 86400000);
      } else if (log < expected) {
        break;
      }
    }
  }

  // longest streak
  const asc = [...logs].sort();
  let longest = 1;
  let streak = 1;
  for (let i = 1; i < asc.length; i++) {
    const prev = new Date(asc[i - 1]);
    const curr = new Date(asc[i]);
    const diff = (curr.getTime() - prev.getTime()) / 86400000;
    if (diff === 1) {
      streak++;
      longest = Math.max(longest, streak);
    } else if (diff > 1) {
      streak = 1;
    }
  }
  if (logs.length === 1) longest = 1;

  return { current, longest };
}

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>(loadHabits);

  useEffect(() => {
    saveHabits(habits);
  }, [habits]);

  const addHabit = useCallback((data: { name: string; category: HabitCategory; description?: string; notes?: string }) => {
    const habit: Habit = {
      id: crypto.randomUUID(),
      name: data.name,
      category: data.category,
      description: data.description || "",
      notes: data.notes || "",
      createdAt: new Date().toISOString(),
      logs: [],
    };
    setHabits((prev) => [...prev, habit]);
    return habit;
  }, []);

  const editHabit = useCallback((id: string, data: Partial<Omit<Habit, "id" | "createdAt" | "logs">>) => {
    setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, ...data } : h)));
  }, []);

  const deleteHabit = useCallback((id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  }, []);

  const toggleToday = useCallback((id: string) => {
    const today = todayStr();
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== id) return h;
        const hasToday = h.logs.includes(today);
        return { ...h, logs: hasToday ? h.logs.filter((d) => d !== today) : [...h.logs, today] };
      })
    );
  }, []);

  const resetAll = useCallback(() => {
    setHabits([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const exportData = useCallback(() => {
    const blob = new Blob([JSON.stringify({ habits }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "habit-tracker-export.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [habits]);

  return { habits, addHabit, editHabit, deleteHabit, toggleToday, resetAll, exportData };
}
