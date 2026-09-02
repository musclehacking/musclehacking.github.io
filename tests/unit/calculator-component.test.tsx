import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import Calculator from "../../src/features/calculator/Calculator";

describe("Calculator server output", () => {
  it("renders meaningful Standard defaults and results before hydration", () => {
    const html = renderToStaticMarkup(<Calculator />);

    expect(html).toContain("Calorie And Macro Calculator");
    expect(html).toContain('id="calculator-age"');
    expect(html).toContain("1805 cal");
    expect(html).toContain("2166 cal");
    expect(html).toContain("1733");
    expect(html).toContain(">176</td>");
    expect(html).toContain("-0.39 kg per week");
  });

  it("can render the LeanGains default without a BMR row", () => {
    const html = renderToStaticMarkup(<Calculator initialMode="leangains" />);

    expect(html).not.toContain("Your BMR is");
    expect(html).toContain("2240 cal");
    expect(html).toContain("1740");
    expect(html).toContain(">218</td>");
    expect(html).toContain("-0.45 kg per week");
  });
});
