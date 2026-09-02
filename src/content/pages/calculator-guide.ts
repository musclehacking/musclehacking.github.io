import calculatorGuideSource from './calculator-guide.html?raw';

/**
 * The calculator page guide is its own public surface, extracted from the
 * audited legacy `calorie-calculator/index.html` by
 * `scripts/migrate-calculator-guide.mjs`. It is deliberately not shared with
 * the standalone `/blog/calorie-calculator-how-to` article, whose copy,
 * headings, and section IDs differ.
 */
export const calculatorGuideRemainderHtml = calculatorGuideSource.trim();

if (!calculatorGuideRemainderHtml.startsWith('<h3 id="diet">')) {
  throw new Error('Calculator guide content must begin at the legacy Diet heading.');
}
