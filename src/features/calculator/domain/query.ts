import type { DietMode } from "./types";

/** Preserves the legacy exact query modes while ignoring unrelated parameters. */
export function calculatorModeFromSearch(search: string): DietMode {
  if (search === "?leangains") return "leangains";
  if (search === "?keto") return "keto";
  return "standard";
}
