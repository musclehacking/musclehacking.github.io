export type DietMode = "standard" | "leangains" | "keto";

export type MeasurementSystem = "metric" | "imperial";

export type Gender = "male" | "female";

export type LeangainsGoal = "lose" | "maintain" | "gain";

export interface CalculatorInput {
  mode: DietMode;
  units: MeasurementSystem;
  gender: Gender;
  age: number;
  weight: number;
  height: number;
  activityMultiplier: number;
  standardGoalPercent: number;
  standardProteinPerPound: number;
  fatCaloriePercent: number;
  bodyFatModifier: number;
  muscleMassModifier: number;
  dailySteps: number;
  leangainsGoal: LeangainsGoal;
  leangainsProteinPercent: number;
  ketoProteinPerPound: number;
  ketoCarbGrams: number;
}

export type CalculatorField = keyof CalculatorInput | "macroAllocation";

export type ValidationErrors = Partial<Record<CalculatorField, string>>;

export interface CalculatorResult {
  bmr: number | null;
  tdee: number;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  weeklyChange: number;
  weeklyChangeUnit: "kg" | "lb";
}

export type CalculationOutcome =
  | { ok: true; value: CalculatorResult }
  | { ok: false; errors: ValidationErrors };
