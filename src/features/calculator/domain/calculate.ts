import {
  CENTIMETRES_TO_INCHES,
  KILOGRAMS_TO_POUNDS,
  KILOGRAMS_TO_POUNDS_LEANGAINS,
} from "./constants";
import { roundTo } from "./conversion";
import type {
  CalculationOutcome,
  CalculatorInput,
  CalculatorResult,
  ValidationErrors,
} from "./types";
import { validateCalculatorInput } from "./validation";

function calculateBmr(input: CalculatorInput): number {
  const genderConstant = input.gender === "male" ? 5 : -160;
  const weightKg =
    input.units === "metric"
      ? input.weight
      : input.weight / KILOGRAMS_TO_POUNDS;
  const heightCm =
    input.units === "metric"
      ? input.height
      : input.height / CENTIMETRES_TO_INCHES;

  return Math.round(
    10 * weightKg + 6.25 * heightCm - 5 * input.age + genderConstant,
  );
}

function leangainsAgeModifier(age: number): number {
  if (age > 45) return -0.5;
  if (age < 25) return 0.5;
  return 0;
}

function leangainsHeightModifier(input: CalculatorInput): number {
  if (input.gender === "male") {
    if (input.units === "metric") {
      if (input.height > 185) return 1;
      if (input.height < 167) return -1;
      return 0;
    }

    if (input.height > 73) return 1;
    if (input.height < 65) return -1;
    return 0;
  }

  if (input.units === "metric") {
    if (input.height > 170) return 1;
    if (input.height < 153) return -1;
    return 0;
  }

  if (input.height > 67) return 1;
  if (input.height < 60) return -1;
  return 0;
}

function leangainsStepModifier(steps: number): number {
  if (steps < 6_000) return 0;
  if (steps < 7_500) return 0.5;

  return 0.5 + 0.5 * Math.ceil((steps - 7_499) / 1_250);
}

function calculateLeangainsTdee(input: CalculatorInput): number {
  const baseValue = input.gender === "male" ? 28 : 26;
  const weightKg =
    input.units === "metric"
      ? input.weight
      : input.weight / KILOGRAMS_TO_POUNDS_LEANGAINS;
  const multiplier =
    baseValue +
    leangainsAgeModifier(input.age) +
    leangainsHeightModifier(input) +
    leangainsStepModifier(input.dailySteps) +
    input.muscleMassModifier +
    input.bodyFatModifier;

  return Math.round(weightKg * multiplier);
}

function leangainsGoalCalories(input: CalculatorInput): number {
  const amount = input.gender === "male" ? 500 : 350;

  if (input.leangainsGoal === "lose") return -amount;
  if (input.leangainsGoal === "gain") return amount;
  return 0;
}

function calculateResult(input: CalculatorInput): CalculatorResult {
  const bmr = input.mode === "leangains" ? null : calculateBmr(input);
  const tdee =
    input.mode === "leangains"
      ? calculateLeangainsTdee(input)
      : Math.round((bmr as number) * input.activityMultiplier);
  const calories =
    input.mode === "leangains"
      ? Math.round(tdee + leangainsGoalCalories(input))
      : Math.round(tdee * (1 + input.standardGoalPercent / 100));
  const weightPounds =
    input.units === "metric"
      ? input.weight * KILOGRAMS_TO_POUNDS
      : input.weight;
  const protein =
    input.mode === "leangains"
      ? Math.round((input.leangainsProteinPercent * calories) / 400)
      : Math.round(
          weightPounds *
            (input.mode === "keto"
              ? input.ketoProteinPerPound
              : input.standardProteinPerPound),
        );
  const carbs =
    input.mode === "keto"
      ? Math.round(input.ketoCarbGrams)
      : Math.round(
          ((calories - 4 * protein) * (100 - input.fatCaloriePercent)) / 400,
        );
  const fat =
    input.mode === "keto"
      ? Math.round((calories - 4 * protein - 4 * carbs) / 9)
      : Math.round(
          ((calories - 4 * protein) * input.fatCaloriePercent) / 900,
        );
  const weeklyChangePounds = (7 * (calories - tdee)) / 3_500;
  const weeklyChange = roundTo(
    input.units === "metric"
      ? weeklyChangePounds / KILOGRAMS_TO_POUNDS
      : weeklyChangePounds,
    2,
  );

  return {
    bmr,
    tdee,
    calories,
    protein,
    fat,
    carbs,
    weeklyChange,
    weeklyChangeUnit: input.units === "metric" ? "kg" : "lb",
  };
}

function hasUnsafeResult(result: CalculatorResult): boolean {
  const values = [
    result.bmr ?? 0,
    result.tdee,
    result.calories,
    result.protein,
    result.fat,
    result.carbs,
    result.weeklyChange,
  ];

  return (
    values.some((value) => !Number.isFinite(value)) ||
    result.tdee <= 0 ||
    result.calories <= 0 ||
    result.protein < 0 ||
    result.fat < 0 ||
    result.carbs < 0
  );
}

export function calculateCalories(input: CalculatorInput): CalculationOutcome {
  const errors = validateCalculatorInput(input);

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  const result = calculateResult(input);

  if (hasUnsafeResult(result)) {
    const allocationErrors: ValidationErrors = {
      macroAllocation:
        "Adjust the calorie goal or macros so protein, fat, and carbs fit within the daily calorie target.",
    };

    return { ok: false, errors: allocationErrors };
  }

  return { ok: true, value: result };
}
