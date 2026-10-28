/** Reviewed TinyPNG copies. Unlisted sources keep their original bytes and URL. */
const compressedImages: Readonly<Record<string, string>> = {
  '/img/australian-health-star-has-to-go.jpg': '/img/australian-health-star-has-to-go-tinypng.jpg',
  '/img/best-protein-powder-muscle-gain.jpg': '/img/best-protein-powder-muscle-gain-tinypng.jpg',
  '/img/breakup-energy.png': '/img/breakup-energy-tinypng.png',
  '/img/calorie-calculator.jpg': '/img/calorie-calculator-tinypng.jpg',
  '/img/change.png': '/img/change-tinypng.png',
  '/img/fitness-books-worth-reading.png': '/img/fitness-books-worth-reading-tinypng.png',
  '/img/idols.png': '/img/idols-tinypng.png',
  '/img/lose-fat-gain-mucle-beginner.png': '/img/lose-fat-gain-mucle-beginner-tinypng.png',
  '/img/muscle-building-supplement-stack.png': '/img/muscle-building-supplement-stack-tinypng.png',
  '/img/naturally-flavoured.jpg': '/img/naturally-flavoured-tinypng.jpg',
  '/img/no-breakfast.jpg': '/img/no-breakfast-tinypng.jpg',
  '/img/normal.png': '/img/normal-tinypng.png',
  '/img/reject-modernity-embrace-masculinity.png': '/img/reject-modernity-embrace-masculinity-tinypng.png',
  '/img/weak.png': '/img/weak-tinypng.png',
};

/** Resolve at build time so listings and article figures reuse the same reviewed copy. */
export function imageSource(src: string): string {
  return compressedImages[src] ?? src;
}
