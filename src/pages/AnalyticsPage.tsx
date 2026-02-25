import { useMemo, useState } from "react";
import { useHabits, todayStr, getStreak } from "@/hooks/useHabits";
import { getCompletionMessage } from "@/lib/motivational";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Area, AreaChart,
} from "recharts";
import { TrendingUp, Calendar, Target, Award, Flame, ChevronLeft, ChevronRight, Star, AlertCircle } from "lucide-react";

function getMonthlyMotivation(rate: number): string {
  if (rate >= 90) return "🏆 Outstanding consistency! You're a habit master!";
  if (rate >= 70) return "🔥 Great job, keep pushing!";
  if (rate >= 50) return "💪 Good effort, stay consistent!";
  return "🌱 You can do better, don't give up!";
}

export default function AnalyticsPage() {
  const { habits } = useHabits();
  const [monthOffset, setMonthOffset] = useState(0);

  const monthly = useMemo(() => {
    const now = new Date();
    const target = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
    const year = target.getFullYear();
    const month = target.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthLabel = target.toLocaleDateString("en", { month: "long", year: "numeric" });
    const todayDate = new Date();
    const isCurrentMonth = year === todayDate.getFullYear() && month === todayDate.getMonth();
    const effectiveDays = isCurrentMonth ? todayDate.getDate() : daysInMonth;

    // Per-day completion data
    const dailyData: { day: number; label: string; completed: number; total: number; rate: number }[] = [];
    let totalCompletions = 0;

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const completed = habits.filter((h) => h.logs.includes(dateStr)).length;
      totalCompletions += completed;
      dailyData.push({
        day: d,
        label: `${d}`,
        completed,
        total: habits.length,
        rate: habits.length > 0 ? Math.round((completed / habits.length) * 100) : 0,
      });
    }

    // Monthly completion %
    const possibleCompletions = habits.length * effectiveDays;
    const completionsUpToToday = dailyData.slice(0, effectiveDays).reduce((s, d) => s + d.completed, 0);
    const monthlyRate = possibleCompletions > 0 ? Math.round((completionsUpToToday / possibleCompletions) * 100) : 0;

    // Per-habit monthly stats
    const perHabit = habits.map((h) => {
      const monthLogs = h.logs.filter((l) => {
        const d = new Date(l);
        return d.getFullYear() === year && d.getMonth() === month;
      });
      const rate = effectiveDays > 0 ? Math.round((monthLogs.length / effectiveDays) * 100) : 0;
      return { id: h.id, name: h.name, category: h.category, completions: monthLogs.length, rate, streak: getStreak(h.logs) };
    });

    const sorted = [...perHabit].sort((a, b) => b.rate - a.rate);
    const mostConsistent = sorted[0] || null;
    const leastConsistent = sorted.length > 1 ? sorted[sorted.length - 1] : null;

    // Cumulative trend
    let cumulative = 0;
    const trendData = dailyData.slice(0, effectiveDays).map((d) => {
      cumulative += d.completed;
      const possible = d.day * habits.length;
      return {
        day: d.day,
        label: d.label,
        cumulative,
        cumulativeRate: possible > 0 ? Math.round((cumulative / possible) * 100) : 0,
      };
    });

    return {
      year, month, daysInMonth, monthLabel, isCurrentMonth, effectiveDays,
      dailyData, totalCompletions: completionsUpToToday, monthlyRate,
      perHabit, mostConsistent, leastConsistent, trendData,
    };
  }, [habits, monthOffset]);

  const overallStreaks = useMemo(() => {
    const streaks = habits.map((h) => getStreak(h.logs));
    const currentMax = Math.max(0, ...streaks.map((s) => s.current));
    const longestMax = Math.max(0, ...streaks.map((s) => s.longest));
    return { currentMax, longestMax };
  }, [habits]);

  const statCards = [
    { label: "Total Habits", value: habits.length, icon: Target, gradient: "gradient-primary" },
    { label: "Completions This Month", value: monthly.totalCompletions, icon: Calendar, gradient: "bg-gradient-to-r from-emerald-500 to-teal-400" },
    { label: "Monthly Rate", value: `${monthly.monthlyRate}%`, icon: TrendingUp, gradient: "gradient-warm" },
    { label: "Current Streak", value: `${overallStreaks.currentMax}d`, icon: Flame, gradient: "gradient-purple" },
    { label: "Longest Streak", value: `${overallStreaks.longestMax}d`, icon: Award, gradient: "gradient-primary" },
    {
      label: "Most Consistent",
      value: monthly.mostConsistent ? monthly.mostConsistent.name : "—",
      icon: Star,
      gradient: "bg-gradient-to-r from-emerald-500 to-teal-400",
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-1">Deep dive into your habit performance</p>
      </div>

      {/* Month selector */}
      <div className="flex items-center gap-3">
        <button onClick={() => setMonthOffset((o) => o - 1)} className="p-2 rounded-lg hover:bg-muted transition-colors">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="font-semibold text-sm">{monthly.monthLabel}</span>
        <button
          onClick={() => setMonthOffset((o) => o + 1)}
          disabled={monthOffset >= 0}
          className="p-2 rounded-lg hover:bg-muted transition-colors disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Monthly progress bar */}
      <div className="glass-card rounded-xl p-5 animate-in-up">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm">Monthly Progress</h3>
          <span className="text-sm font-bold gradient-text">{monthly.monthlyRate}% completed this month</span>
        </div>
        <div className="h-3 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full gradient-primary transition-all duration-700 ease-out"
            style={{ width: `${monthly.monthlyRate}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{getMonthlyMotivation(monthly.monthlyRate)}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((c) => (
          <div key={c.label} className="glass-card rounded-xl p-4 animate-in-up">
            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${c.gradient}`}>
              <c.icon className="h-5 w-5 text-primary-foreground" />
            </div>
            <p className="mt-3 text-xl font-bold truncate">{c.value}</p>
            <p className="text-xs text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Least consistent callout */}
      {monthly.leastConsistent && monthly.leastConsistent.rate < 50 && (
        <div className="glass-card rounded-xl p-4 border-warning/30 flex items-start gap-3 animate-in-up">
          <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium">Least consistent: <span className="font-bold">{monthly.leastConsistent.name}</span></p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Only {monthly.leastConsistent.rate}% this month — try setting a reminder!
            </p>
          </div>
        </div>
      )}

      {habits.length === 0 ? (
        <div className="glass-card rounded-xl p-8 text-center text-muted-foreground">Add some habits to see analytics!</div>
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Daily bar chart */}
            <div className="glass-card rounded-xl p-5">
              <h3 className="font-semibold mb-4">Habits Completed Per Day</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={monthly.dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    interval={Math.max(0, Math.floor(monthly.daysInMonth / 10) - 1)}
                  />
                  <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                    formatter={(value: number) => [`${value} habits`, "Completed"]}
                    labelFormatter={(label) => `Day ${label}`}
                  />
                  <Bar dataKey="completed" fill="hsl(195,90%,50%)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Completion trend line chart */}
            <div className="glass-card rounded-xl p-5">
              <h3 className="font-semibold mb-4">Completion Trend</h3>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={monthly.trendData}>
                  <defs>
                    <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(250,80%,60%)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(250,80%,60%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    interval={Math.max(0, Math.floor(monthly.effectiveDays / 10) - 1)}
                  />
                  <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} unit="%" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                    formatter={(value: number) => [`${value}%`, "Cumulative Rate"]}
                    labelFormatter={(label) => `Day ${label}`}
                  />
                  <Area type="monotone" dataKey="cumulativeRate" stroke="hsl(250,80%,60%)" strokeWidth={2.5} fill="url(#trendGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Per-habit monthly breakdown */}
          <div className="glass-card rounded-xl p-5">
            <h3 className="font-semibold mb-4">Habit Consistency This Month</h3>
            <div className="space-y-3">
              {monthly.perHabit
                .sort((a, b) => b.rate - a.rate)
                .map((h) => (
                  <div key={h.id}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm font-medium truncate">{h.name}</span>
                        <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground flex-shrink-0">{h.category}</span>
                      </div>
                      <span className="text-xs font-semibold ml-2 flex-shrink-0">
                        {h.completions}/{monthly.effectiveDays} · {h.rate}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ease-out ${
                          h.rate >= 70 ? "gradient-primary" : h.rate >= 40 ? "gradient-warm" : "bg-muted-foreground/40"
                        }`}
                        style={{ width: `${h.rate}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Daily completion rate chart */}
          <div className="glass-card rounded-xl p-5">
            <h3 className="font-semibold mb-4">Daily Completion Rate</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={monthly.dailyData.slice(0, monthly.effectiveDays)}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  interval={Math.max(0, Math.floor(monthly.effectiveDays / 10) - 1)}
                />
                <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} unit="%" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                  formatter={(value: number) => [`${value}%`, "Completion Rate"]}
                  labelFormatter={(label) => `Day ${label}`}
                />
                <Line type="monotone" dataKey="rate" stroke="hsl(195,90%,50%)" strokeWidth={2} dot={{ fill: "hsl(195,90%,50%)", r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
