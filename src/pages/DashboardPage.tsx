import { useMemo, useState, useEffect } from "react";
import { useHabits, todayStr, getStreak } from "@/hooks/useHabits";
import { getMotivationalQuote, getStreakMessage, getCompletionMessage } from "@/lib/motivational";
import { CheckCircle2, Flame, Target, TrendingUp, Sparkles, Trophy } from "lucide-react";

export default function DashboardPage() {
  const { habits, toggleToday } = useHabits();
  const today = todayStr();
  const [quote] = useState(getMotivationalQuote);
  const [celebrated, setCelebrated] = useState<string | null>(null);

  const stats = useMemo(() => {
    const totalHabits = habits.length;
    const completedToday = habits.filter((h) => h.logs.includes(today)).length;
    const streaks = habits.map((h) => getStreak(h.logs));
    const totalStreak = streaks.reduce((s, c) => s + c.current, 0);
    const completionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;
    const bestStreak = Math.max(0, ...streaks.map((s) => s.current));
    return { totalHabits, completedToday, totalStreak, completionRate, bestStreak };
  }, [habits, today]);

  const handleToggle = (id: string) => {
    const habit = habits.find((h) => h.id === id);
    if (habit && !habit.logs.includes(today)) {
      setCelebrated(id);
      setTimeout(() => setCelebrated(null), 800);
    }
    toggleToday(id);
  };

  const cards = [
    { label: "Total Habits", value: stats.totalHabits, icon: Target, gradient: "gradient-primary" },
    { label: "Completed Today", value: `${stats.completedToday}/${stats.totalHabits}`, icon: CheckCircle2, gradient: "bg-gradient-to-r from-emerald-500 to-teal-400" },
    { label: "Active Streaks", value: stats.totalStreak, icon: Flame, gradient: "gradient-warm" },
    { label: "Completion Rate", value: `${stats.completionRate}%`, icon: TrendingUp, gradient: "gradient-purple" },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Track your progress and stay consistent</p>
      </div>

      {/* Motivational quote */}
      <div className="relative overflow-hidden rounded-xl gradient-primary p-6 text-primary-foreground">
        <Sparkles className="absolute top-4 right-4 h-6 w-6 opacity-30" />
        <p className="text-lg md:text-xl font-semibold leading-relaxed">"{quote}"</p>
        <p className="mt-2 text-sm opacity-75">{getStreakMessage(stats.bestStreak)}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="glass-card rounded-xl p-4 animate-in-up">
            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${c.gradient}`}>
              <c.icon className="h-5 w-5 text-primary-foreground" />
            </div>
            <p className="mt-3 text-2xl font-bold">{c.value}</p>
            <p className="text-xs text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Today's habits */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Today's Habits</h2>
        {habits.length === 0 ? (
          <div className="glass-card rounded-xl p-8 text-center">
            <p className="text-muted-foreground">No habits yet. Head to the Habits page to add your first one!</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {habits.map((habit) => {
              const done = habit.logs.includes(today);
              const streak = getStreak(habit.logs);
              return (
                <div
                  key={habit.id}
                  className={`glass-card rounded-xl p-4 transition-all duration-300 ${
                    celebrated === habit.id ? "animate-celebrate" : ""
                  } ${done ? "ring-2 ring-success/50" : ""}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{habit.name}</p>
                      <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        {habit.category}
                      </span>
                    </div>
                    <button
                      onClick={() => handleToggle(habit.id)}
                      className={`flex-shrink-0 ml-2 h-9 w-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                        done
                          ? "bg-success text-success-foreground shadow-lg"
                          : "border-2 border-border hover:border-primary hover:bg-primary/10"
                      }`}
                    >
                      {done && <CheckCircle2 className="h-5 w-5" />}
                    </button>
                  </div>
                  {streak.current > 0 && (
                    <div className="mt-3 flex items-center gap-1.5 text-xs font-medium">
                      <Flame className="h-3.5 w-3.5 text-warning" />
                      <span>{streak.current} day streak</span>
                      {streak.current === streak.longest && streak.current > 2 && (
                        <Trophy className="h-3.5 w-3.5 text-warning ml-1" />
                      )}
                    </div>
                  )}
                  {done && celebrated === habit.id && (
                    <p className="mt-2 text-xs text-success font-medium">{getCompletionMessage(100)}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
