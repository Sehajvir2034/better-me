// ─── WEIGHTS ─────────────────────────────────────────────
export const WEIGHTS = {
  sleep: 0.25,
  nutrition: 0.2,
  activity: 0.15,
  vitamins: 0.15,
  mindset: 0.1,
  skincare: 0.075,
  haircare: 0.075,
  water: 0.05,
} as const;

// ─── PILLAR SCORES (0 to 1) ──────────────────────────────

export function scoreWater(consumed: number, goal: number): number {
  if (goal === 0) return 0;
  return Math.min(consumed / goal, 1);
}

export function scoreNutrition(
  calories: number,
  calorieGoal: number,
  protein: number,
  proteinGoal: number = 120,
  carbs: number = 0,
  carbGoal: number = 200,
  fat: number = 0,
  fatGoal: number = 65,
): number {
  if (calorieGoal === 0) return 0;
  // Calorie accuracy (penalizes both over and under)
  const calScore =
    1 - Math.min(Math.abs(calories - calorieGoal) / calorieGoal, 1);
  // Macro adherence (average of 3 macros)
  const pScore = proteinGoal > 0 ? Math.min(protein / proteinGoal, 1) : 1;
  const cScore = carbGoal > 0 ? Math.min(carbs / carbGoal, 1) : 1;
  const fScore = fatGoal > 0 ? Math.min(fat / fatGoal, 1) : 1;
  const macroScore = (pScore + cScore + fScore) / 3;
  // 60% calorie accuracy + 40% macro adherence
  return calScore * 0.6 + macroScore * 0.4;
}

export function scoreSleep(
  hours: number | null,
  quality: number | null, // 1–5
  targetHours: number = 8,
): number {
  if (!hours) return 0;
  const hoursScore = Math.min(hours / targetHours, 1);
  // quality modifier: 1→0.8, 3→1.0, 5→1.2
  const qualityModifier = quality ? 0.8 + ((quality - 1) / 4) * 0.4 : 1.0;
  return Math.min(hoursScore * qualityModifier, 1);
}

export function scoreVitamins(taken: number, total: number): number {
  if (total === 0) return 1; // no vitamins scheduled = not penalized
  return Math.min(taken / total, 1);
}

export function scoreMindset(hasEntry: boolean): number {
  return hasEntry ? 1 : 0;
}

export function scoreRitual(done: boolean): number {
  return done ? 1 : 0;
}

// ─── CONSISTENCY FACTOR ──────────────────────────────────
// streakDays: positive = consecutive days logged, negative = missed days
export function consistencyFactor(streakDays: number): number {
  if (streakDays >= 7) return 1.1; // 7+ day streak bonus
  if (streakDays >= 3) return 1.05; // 3+ day streak bonus
  if (streakDays <= -3) return 0.9; // 3+ missed days penalty
  if (streakDays <= -1) return 0.95; // 1-2 missed days penalty
  return 1.0;
}

// ─── DECAY FACTOR ────────────────────────────────────────
export function applyDecay(score: number, daysMissed: number): number {
  const DECAY_RATE = 0.02; // -2% per missed day
  return Math.max(score * Math.pow(1 - DECAY_RATE, daysMissed), 0);
}

// ─── YEAR PROGRESS ───────────────────────────────────────
export function getYearProgress(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
  return (
    ((now.getTime() - start.getTime()) / (end.getTime() - start.getTime())) *
    100
  );
}

// ─── MAIN SCORE ──────────────────────────────────────────
export interface PillarScores {
  sleep: number; // 0–1
  nutrition: number; // 0–1
  activity: number; // 0–1
  vitamins: number; // 0–1
  mindset: number; // 0–1
  skincare: number; // 0–1
  haircare: number; // 0–1
  water: number;
}

export function calcVitalityScore(
  pillars: PillarScores,
  streakDays: number = 0,
  daysMissed: number = 0,
): number {
  const raw =
    pillars.sleep * WEIGHTS.sleep +
    pillars.nutrition * WEIGHTS.nutrition +
    pillars.activity * WEIGHTS.activity +
    pillars.vitamins * WEIGHTS.vitamins +
    pillars.mindset * WEIGHTS.mindset +
    pillars.skincare * WEIGHTS.skincare +
    pillars.haircare * WEIGHTS.haircare +
    pillars.water * WEIGHTS.water;

  const withConsistency = raw * consistencyFactor(streakDays);
  const withDecay = applyDecay(withConsistency, daysMissed);

  return Math.round(Math.min(withDecay * 100, 100));
}
