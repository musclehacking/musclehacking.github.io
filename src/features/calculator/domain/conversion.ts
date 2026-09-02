import {
  CENTIMETRES_TO_INCHES,
  KILOGRAMS_TO_POUNDS,
} from "./constants";

/** Matches the decimal rounding helper embedded in the legacy Vue bundle. */
export function roundTo(value: number, decimalPlaces: number): number {
  const [coefficient, exponent] = String(value).split("e");
  const shifted = Number(
    `${coefficient}e${exponent ? Number(exponent) + decimalPlaces : decimalPlaces}`,
  );
  const rounded = Math.round(shifted);
  const [roundedCoefficient, roundedExponent] = String(rounded).split("e");

  return Number(
    `${roundedCoefficient}e${
      roundedExponent
        ? Number(roundedExponent) - decimalPlaces
        : -decimalPlaces
    }`,
  );
}

export function kilogramsToPounds(kilograms: number): number {
  return kilograms * KILOGRAMS_TO_POUNDS;
}

export function poundsToKilograms(pounds: number): number {
  return pounds / KILOGRAMS_TO_POUNDS;
}

export function centimetresToInches(centimetres: number): number {
  return centimetres * CENTIMETRES_TO_INCHES;
}

export function inchesToCentimetres(inches: number): number {
  return inches / CENTIMETRES_TO_INCHES;
}

export function convertWeightForDisplay(
  weight: number,
  direction: "metric-to-imperial" | "imperial-to-metric",
): number {
  return roundTo(
    direction === "metric-to-imperial"
      ? kilogramsToPounds(weight)
      : poundsToKilograms(weight),
    1,
  );
}

export function convertHeightForDisplay(
  height: number,
  direction: "metric-to-imperial" | "imperial-to-metric",
): number {
  return roundTo(
    direction === "metric-to-imperial"
      ? centimetresToInches(height)
      : inchesToCentimetres(height),
    1,
  );
}
