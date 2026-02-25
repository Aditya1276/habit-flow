import { useMemo } from "react";
import { useHabits, todayStr, getStreak } from "@/hooks/useHabits";
import { getCompletionMessage } from "@/lib/motivational";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { TrendingUp, Calendar, Target, Award } from "lucide-react";

export default function AnalyticsPage() {
  const { habits } = useHabits();
  const today = todayStr();

  const analytics = useMemo(() => {
    const totalLogs = habits.reduce((s, h) => s + h.logs.length, 0);
    const streaks = habits.map((h) => ({ ...h, streak: getStreak(h.logs) }));
    const bestStreakHabit = streaks.sort((a, b) => b.streak.longest - a.streak.longest)[0];
    const totalDays = habits.reduce((s, h) => {
      const days = Math.max(1, Math.ceil((Date.now() - new Date(h.createdAt).getTime()) / 86400000));
      return s + days;
    }, 0);
    const overallRate = totalDays > 0 ? Math.round((totalLogs / totalDays) * 100) : 0;

    // Last 7 days chart data
    const last7: { day: string; completed: number; total: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const dateStr = d.toISOString().split("T")[0];
      const dayLabel = d.toLocaleDateString("en", { weekday: "short" });
      const completed = habits.filter((h) => h.logs.includes(dateStr)).length;
      last7.push({ day: dayLabel, completed, total: habits.length });
    }

    // Per-habit completion data
    const perHabit = habits.map((h) => {
      const days = Math.max(1, Math.ceil((Date.now() - new Date(h.createdAt).getTime()) / 86400000));
      const rate = Math.round((h.logs.length / days) * 100);
      return { name: h.name.length > 12 ? h.name.slice(0, 12) + "…" : h.name, rate, logs: h.logs.length };
    });

    return { totalLogs, overallRate, bestStreakHabit, last7, perHabit };
  }, [habits]);

  const statCards = [
    { label: "Total Completions", value: analytics.totalLogs, icon: Target, gradient: "gradient-primary" },
    { label: "Overall Rate", value: `${analytics.overallRate}%`, icon: TrendingUp, gradient: "gradient-warm" },
    { label: "Best Streak", value: analytics.bestStreakHabit ? `${analytics.bestStreakHabit.streak.longest}d` : "0d", icon: Award, gradient: "gradient-purple" },
    { label: "Active Habits", value: habits.length, icon: Calendar, gradient: "bg-gradient-to-r from-emerald-500 to-teal-400" },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-1">{getCompletionMessage(analytics.overallRate)}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((c) => (
          <div key={c.label} className="glass-card rounded-xl p-4 animate-in-up">
            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${c.gradient}`}>
              <c.icon className="h-5 w-5 text-primary-foreground" />
            </div>
            <p className="mt-3 text-2xl font-bold">{c.value}</p>
            <p className="text-xs text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </div>

      {habits.length === 0 ? (
        <div className="glass-card rounded-xl p-8 text-center text-muted-foreground">Add some habits to see analytics!</div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Line chart */}
          <div className="glass-card rounded-xl p-5">
            <h3 className="font-semibold mb-4">Last 7 Days</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={analytics.last7}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="completed" stroke="hsl(250,80%,60%)" strokeWidth={2.5} dot={{ fill: "hsl(250,80%,60%)", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Bar chart */}
          <div className="glass-card rounded-xl p-5">
            <h3 className="font-semibold mb-4">Completion Rate by Habit</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={analytics.perHabit}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} unit="%" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="rate" fill="hsl(195,90%,50%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
