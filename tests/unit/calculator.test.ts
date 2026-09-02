import { describe, expect, it } from "vitest";

import { calculateCalories } from "../../src/features/calculator/domain/calculate";
import {
  DEFAULT_CALCULATOR_INPUT,
  KILOGRAMS_TO_POUNDS,
} from "../../src/features/calculator/domain/constants";
import {
  convertHeightForDisplay,
  convertWeightForDisplay,
} from "../../src/features/calculator/domain/conversion";
import { calculatorModeFromSearch } from "../../src/features/calculator/domain/query";
import type {
  CalculatorInput,
  CalculatorResult,
  DietMode,
} from "../../src/features/calculator/domain/types";

function resultFor(overrides: Partial<CalculatorInput> = {}): CalculatorResult {
  const outcome = calculateCalories({
    ...DEFAULT_CALCULATOR_INPUT,
    ...overrides,
  });

  if (!outcome.ok) {
    throw new Error(`Expected valid calculator input: ${JSON.stringify(outcome.errors)}`);
  }

  return outcome.value;
}

describe("calculator golden defaults", () => {
  it("matches the Standard metric legacy result exactly", () => {
    expect(resultFor()).toEqual({
      bmr: 1805,
      tdee: 2166,
      calories: 1733,
      protein: 176,
      fat: 57,
      carbs: 129,
      weeklyChange: -0.39,
      weeklyChangeUnit: "kg",
    });
  });

  it("matches the LeanGains metric legacy result exactly", () => {
    expect(resultFor({ mode: "leangains" })).toEqual({
      bmr: null,
      tdee: 2240,
      calories: 1740,
      protein: 218,
      fat: 48,
      carbs: 109,
      weeklyChange: -0.45,
      weeklyChangeUnit: "kg",
    });
  });

  it("matches the keto metric legacy result exactly", () => {
    expect(resultFor({ mode: "keto" })).toEqual({
      bmr: 1805,
      tdee: 2166,
      calories: 1733,
      protein: 176,
      fat: 105,
      carbs: 20,
      weeklyChange: -0.39,
      weeklyChangeUnit: "kg",
    });
  });
});

describe("calculator conversions and thresholds", () => {
  it("keeps equivalent metric and imperial inputs on the same calorie result", () => {
    const metric = resultFor();
    const imperial = resultFor({
      units: "imperial",
      weight: 80 * KILOGRAMS_TO_POUNDS,
      height: 180 * 0.393701,
    });

    expect(imperial).toMatchObject({
      bmr: metric.bmr,
      tdee: metric.tdee,
      calories: metric.calories,
      protein: metric.protein,
      fat: metric.fat,
      carbs: metric.carbs,
      weeklyChangeUnit: "lb",
    });
    expect(imperial.weeklyChange / KILOGRAMS_TO_POUNDS).toBeCloseTo(
      metric.weeklyChange,
      2,
    );
  });

  it("matches the legacy one-decimal unit control conversion", () => {
    expect(convertWeightForDisplay(80, "metric-to-imperial")).toBe(176.4);
    expect(convertHeightForDisplay(180, "metric-to-imperial")).toBe(70.9);
    expect(convertWeightForDisplay(176.4, "imperial-to-metric")).toBe(80);
    expect(convertHeightForDisplay(70.9, "imperial-to-metric")).toBe(180.1);
  });

  it("preserves LeanGains age, height, and step threshold behaviour", () => {
    expect(resultFor({ mode: "leangains", age: 24 }).tdee).toBe(2280);
    expect(resultFor({ mode: "leangains", age: 25 }).tdee).toBe(2240);
    expect(resultFor({ mode: "leangains", height: 186 }).tdee).toBe(2320);
    expect(resultFor({ mode: "leangains", dailySteps: 5_999 }).tdee).toBe(2240);
    expect(resultFor({ mode: "leangains", dailySteps: 6_000 }).tdee).toBe(2280);
    expect(resultFor({ mode: "leangains", dailySteps: 7_500 }).tdee).toBe(2320);
  });

  it("maps only the two exact legacy query strings to alternate modes", () => {
    expect(calculatorModeFromSearch("?leangains")).toBe("leangains");
    expect(calculatorModeFromSearch("?keto")).toBe("keto");
    expect(calculatorModeFromSearch("?keto=true")).toBe("standard");
    expect(calculatorModeFromSearch("?source=keto")).toBe("standard");
  });
});

describe("calculator validation", () => {
  it.each([
    ["age", { age: 12 }],
    ["weight", { weight: 0 }],
    ["height", { height: 300 }],
    ["standardGoalPercent", { standardGoalPercent: -51 }],
    ["fatCaloriePercent", { fatCaloriePercent: 101 }],
  ] as const)("returns bounded guidance for invalid %s input", (field, override) => {
    const outcome = calculateCalories({
      ...DEFAULT_CALCULATOR_INPUT,
      ...override,
    });

    expect(outcome.ok).toBe(false);
    if (!outcome.ok) {
      expect(outcome.errors[field]).toMatch(/from/);
      expect(JSON.stringify(outcome.errors)).not.toMatch(/NaN|Infinity/);
    }
  });

  it("rejects non-finite numbers before calculation", () => {
    const outcome = calculateCalories({
      ...DEFAULT_CALCULATOR_INPUT,
      age: Number.NaN,
    });

    expect(outcome.ok).toBe(false);
    if (!outcome.ok) {
      expect(outcome.errors.age).toBe("Enter a number from 13 to 100 years.");
    }
  });

  it("rejects a keto macro allocation that would produce negative fat", () => {
    const outcome = calculateCalories({
      ...DEFAULT_CALCULATOR_INPUT,
      mode: "keto",
      weight: 30,
      standardGoalPercent: -50,
      ketoProteinPerPound: 1.6,
      ketoCarbGrams: 100,
    });

    expect(outcome).toEqual({
      ok: false,
      errors: {
        macroAllocation:
          "Adjust the calorie goal or macros so protein, fat, and carbs fit within the daily calorie target.",
      },
    });
  });

  it("keeps all preset mode and goal combinations finite and non-negative", () => {
    const modes: DietMode[] = ["standard", "leangains", "keto"];

    for (const mode of modes) {
      for (const standardGoalPercent of [-20, -10, 0, 10, 20]) {
        const outcome = calculateCalories({
          ...DEFAULT_CALCULATOR_INPUT,
          mode,
          standardGoalPercent,
        });

        expect(outcome.ok).toBe(true);
        if (outcome.ok) {
          const numericValues = Object.values(outcome.value).filter(
            (value): value is number => typeof value === "number",
          );
          expect(numericValues.every(Number.isFinite)).toBe(true);
          expect(outcome.value.protein).toBeGreaterThanOrEqual(0);
          expect(outcome.value.fat).toBeGreaterThanOrEqual(0);
          expect(outcome.value.carbs).toBeGreaterThanOrEqual(0);
        }
      }
    }
  });
});
