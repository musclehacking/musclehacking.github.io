import {
  ACTIVITY_OPTIONS,
  FEMALE_BODY_FAT_OPTIONS,
  MALE_BODY_FAT_OPTIONS,
  MUSCLE_MASS_OPTIONS,
} from "./constants";
import type {
  CalculatorField,
  CalculatorInput,
  ValidationErrors,
} from "./types";

export const CALCULATOR_BOUNDS = {
  age: { min: 13, max: 100 },
  weightKg: { min: 30, max: 300 },
  weightLb: { min: 66.1, max: 661.4 },
  heightCm: { min: 120, max: 250 },
  heightIn: { min: 47.2, max: 98.4 },
  standardGoalPercent: { min: -50, max: 50 },
  fatCaloriePercent: { min: 0, max: 100 },
  dailySteps: { min: 0, max: 25_000 },
  leangainsProteinPercent: { min: 30, max: 80 },
  ketoProteinPerPound: { min: 0.6, max: 1.6 },
  ketoCarbGrams: { min: 0, max: 100 },
} as const;

function addRangeError(
  errors: ValidationErrors,
  field: CalculatorField,
  value: number,
  min: number,
  max: number,
  unit = "",
): void {
  const suffix = unit ? ` ${unit}` : "";

  if (!Number.isFinite(value)) {
    errors[field] = `Enter a number from ${min} to ${max}${suffix}.`;
  } else if (value < min || value > max) {
    errors[field] = `Enter a value from ${min} to ${max}${suffix}.`;
  }
}

function isAllowed(value: number, options: ReadonlyArray<{ value: number }>): boolean {
  return options.some((option) => option.value === value);
}

export function validateCalculatorInput(input: CalculatorInput): ValidationErrors {
  const errors: ValidationErrors = {};
  const weightBounds =
    input.units === "metric"
      ? CALCULATOR_BOUNDS.weightKg
      : CALCULATOR_BOUNDS.weightLb;
  const heightBounds =
    input.units === "metric"
      ? CALCULATOR_BOUNDS.heightCm
      : CALCULATOR_BOUNDS.heightIn;

  addRangeError(
    errors,
    "age",
    input.age,
    CALCULATOR_BOUNDS.age.min,
    CALCULATOR_BOUNDS.age.max,
    "years",
  );
  addRangeError(
    errors,
    "weight",
    input.weight,
    weightBounds.min,
    weightBounds.max,
    input.units === "metric" ? "kg" : "lb",
  );
  addRangeError(
    errors,
    "height",
    input.height,
    heightBounds.min,
    heightBounds.max,
    input.units === "metric" ? "cm" : "in",
  );

  if (input.mode === "standard" || input.mode === "keto") {
    if (!isAllowed(input.activityMultiplier, ACTIVITY_OPTIONS)) {
      errors.activityMultiplier = "Select a listed activity level.";
    }

    addRangeError(
      errors,
      "standardGoalPercent",
      input.standardGoalPercent,
      CALCULATOR_BOUNDS.standardGoalPercent.min,
      CALCULATOR_BOUNDS.standardGoalPercent.max,
      "%",
    );
  }

  if (input.mode === "standard") {
    addRangeError(
      errors,
      "standardProteinPerPound",
      input.standardProteinPerPound,
      CALCULATOR_BOUNDS.ketoProteinPerPound.min,
      CALCULATOR_BOUNDS.ketoProteinPerPound.max,
      "g per lb",
    );
  }

  if (input.mode !== "keto") {
    addRangeError(
      errors,
      "fatCaloriePercent",
      input.fatCaloriePercent,
      CALCULATOR_BOUNDS.fatCaloriePercent.min,
      CALCULATOR_BOUNDS.fatCaloriePercent.max,
      "%",
    );
  }

  if (input.mode === "leangains") {
    const bodyFatOptions =
      input.gender === "male"
        ? MALE_BODY_FAT_OPTIONS
        : FEMALE_BODY_FAT_OPTIONS;

    if (!isAllowed(input.bodyFatModifier, bodyFatOptions)) {
      errors.bodyFatModifier = "Select a listed body-fat range.";
    }
    if (!isAllowed(input.muscleMassModifier, MUSCLE_MASS_OPTIONS)) {
      errors.muscleMassModifier = "Select a listed muscle-mass level.";
    }
    addRangeError(
      errors,
      "dailySteps",
      input.dailySteps,
      CALCULATOR_BOUNDS.dailySteps.min,
      CALCULATOR_BOUNDS.dailySteps.max,
      "steps",
    );
    addRangeError(
      errors,
      "leangainsProteinPercent",
      input.leangainsProteinPercent,
      CALCULATOR_BOUNDS.leangainsProteinPercent.min,
      CALCULATOR_BOUNDS.leangainsProteinPercent.max,
      "%",
    );
  }

  if (input.mode === "keto") {
    addRangeError(
      errors,
      "ketoProteinPerPound",
      input.ketoProteinPerPound,
      CALCULATOR_BOUNDS.ketoProteinPerPound.min,
      CALCULATOR_BOUNDS.ketoProteinPerPound.max,
      "g per lb",
    );
    addRangeError(
      errors,
      "ketoCarbGrams",
      input.ketoCarbGrams,
      CALCULATOR_BOUNDS.ketoCarbGrams.min,
      CALCULATOR_BOUNDS.ketoCarbGrams.max,
      "g",
    );
  }

  return errors;
}
