import type {
  CalculatorInput,
  DietMode,
  Gender,
  LeangainsGoal,
  MeasurementSystem,
} from "./types";

export const KILOGRAMS_TO_POUNDS = 2.20462;
export const KILOGRAMS_TO_POUNDS_LEANGAINS = 2.205;
export const CENTIMETRES_TO_INCHES = 0.393701;

export const DIET_OPTIONS: ReadonlyArray<{ label: string; value: DietMode }> = [
  { label: "Standard", value: "standard" },
  { label: "Leangains", value: "leangains" },
  { label: "Keto", value: "keto" },
];

export const UNIT_OPTIONS: ReadonlyArray<{
  label: string;
  value: MeasurementSystem;
}> = [
  { label: "Metric (kg, cm)", value: "metric" },
  { label: "Imperial (lb, in)", value: "imperial" },
];

export const GENDER_OPTIONS: ReadonlyArray<{ label: string; value: Gender }> = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
];

export const ACTIVITY_OPTIONS = [
  { label: "Sedentary", value: 1.2 },
  { label: "Lightly Active", value: 1.375 },
  { label: "Moderately Active", value: 1.55 },
  { label: "Very Active", value: 1.725 },
  { label: "Extremely Active", value: 1.9 },
] as const;

export const STANDARD_GOAL_OPTIONS = [
  { label: "Lose Weight (–20%)", value: -20 },
  { label: "Slowly Lose Weight (–10%)", value: -10 },
  { label: "Maintain Weight (0%)", value: 0 },
  { label: "Slowly Gain Weight (+10%)", value: 10 },
  { label: "Gain Weight (+20%)", value: 20 },
] as const;

export const STANDARD_PROTEIN_OPTIONS = [
  { label: "1g per pound (standard)", value: 1 },
  { label: "0.82g per pound (acceptable)", value: 0.82 },
  { label: "1.5g per pound (RIP hunger)", value: 1.5 },
] as const;

export const LEANGAINS_GOAL_OPTIONS: ReadonlyArray<{
  label: string;
  value: LeangainsGoal;
}> = [
  { label: "Lose Weight", value: "lose" },
  { label: "Maintain Weight", value: "maintain" },
  { label: "Gain Weight", value: "gain" },
];

export const MUSCLE_MASS_OPTIONS = [
  { label: "Standard", value: 0 },
  { label: "Muscular", value: 0.5 },
  { label: "Very Muscular", value: 1 },
] as const;

export const MALE_BODY_FAT_OPTIONS = [
  { label: "<10%", value: 0.5 },
  { label: "11-19%", value: 0 },
  { label: "20-24%", value: -0.5 },
  { label: "25-29%", value: -1.5 },
  { label: "30-34%", value: -2.5 },
] as const;

export const FEMALE_BODY_FAT_OPTIONS = [
  { label: "<18%", value: 0.5 },
  { label: "19-27%", value: 0 },
  { label: "28-32%", value: -0.5 },
  { label: "33-37%", value: -1.5 },
  { label: "38-42%", value: -2.5 },
] as const;

export const DEFAULT_CALCULATOR_INPUT: Readonly<CalculatorInput> = {
  mode: "standard",
  units: "metric",
  gender: "male",
  age: 25,
  weight: 80,
  height: 180,
  activityMultiplier: 1.2,
  standardGoalPercent: -20,
  standardProteinPerPound: 1,
  fatCaloriePercent: 50,
  bodyFatModifier: 0,
  muscleMassModifier: 0,
  dailySteps: 5_000,
  leangainsGoal: "lose",
  leangainsProteinPercent: 50,
  ketoProteinPerPound: 1,
  ketoCarbGrams: 20,
};
