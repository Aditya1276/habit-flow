const QUOTES = [
  "Small steps every day lead to big success.",
  "Consistency is the key to greatness.",
  "Your future is created by what you do today.",
  "Discipline beats motivation.",
  "Progress, not perfection.",
  "The secret of getting ahead is getting started.",
  "Don't count the days, make the days count.",
  "Success is the sum of small efforts repeated daily.",
  "You don't have to be extreme, just consistent.",
  "Every day is a chance to get better.",
];

export function getMotivationalQuote(): string {
  return QUOTES[Math.floor(Math.random() * QUOTES.length)];
}

export function getStreakMessage(streak: number): string {
  if (streak >= 30) return "🏆 Legendary! 30+ day streak — you're unstoppable!";
  if (streak >= 14) return "🔥 Two weeks strong! You're building something great!";
  if (streak >= 7) return "⚡ One week streak! Amazing consistency!";
  if (streak >= 3) return "💪 3-day streak! Keep the momentum going!";
  if (streak >= 1) return "✨ Great start! Come back tomorrow to keep it up!";
  return "🌱 Start today. Every streak begins with day one.";
}

export function getCompletionMessage(rate: number): string {
  if (rate >= 90) return "🎯 Outstanding! You're crushing your goals!";
  if (rate >= 70) return "💫 Great consistency! Keep pushing forward!";
  if (rate >= 50) return "👍 Good progress! Room to grow even more!";
  if (rate >= 25) return "🌤 Building momentum. Stay focused!";
  return "🚀 Every completed habit counts. You've got this!";
}

export function getMissedMessage(): string {
  return "Don't give up. Tomorrow is a fresh start. 🌅";
}
