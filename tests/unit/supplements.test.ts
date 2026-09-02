import { describe, expect, it } from "vitest";

import { selectSupplementHeadings } from "../../src/features/supplements/selector";

const headingLabels = (filterId: string): string[] =>
  selectSupplementHeadings(filterId).map((heading) => heading.label);

describe("legacy supplement filter order", () => {
  it("preserves the Muscle Growth evidence ranking and tie order", () => {
    expect(headingLabels("muscle-growth")).toEqual([
      "Creatine",
      "Whey Protein",
      "Beta-Alanine",
      "Alpha GPC",
      "Ashwagandha",
      "Melatonin",
      "Fish Oil",
      "Spirulina",
      "What is this?",
      "References",
    ]);
  });

  it("preserves the Sleep evidence ranking and tie order", () => {
    expect(headingLabels("sleep")).toEqual([
      "Melatonin",
      "Ashwagandha",
      "L-Theanine",
      "What is this?",
      "References",
    ]);
  });

  it("preserves the complete Show All source order", () => {
    expect(headingLabels("show-all")).toEqual([
      "Creatine",
      "Beta-Alanine",
      "Whey Protein",
      "Alpha GPC",
      "Ashwagandha",
      "Melatonin",
      "L-Theanine",
      "Fish Oil",
      "Spirulina",
      "Ceylon Cinnamon",
      "Curcumin",
      "Collagen",
      "Garlic",
      "Mulberry Leaf Extract",
      "Vitamin D",
      "Magnesium",
      "Zinc",
      "Probiotic",
      "Glucosamine",
      "What is this?",
      "References",
    ]);
  });
});
