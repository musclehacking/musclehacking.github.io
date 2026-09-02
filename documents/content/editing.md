# Content editing

Edit article frontmatter and Markdown in `src/content/blog/`. The schema in `src/content.config.ts` requires the title, description, publication date, image path, alternative text, and intrinsic image dimensions.

Edit route paths, indexability, sitemap inclusion, and navigation labels only in `src/config/routes.ts`. Edit canonical origin, contact data, social links, and crawler policy only in `src/config/site.ts` after factual approval.

Run the full verification commands in `README.md`. Do not edit `dist/`; it is generated. Do not add a canonical override, analytics, legal statement, identity claim, remote font, or third-party browser script without documented approval.

The calculator page guide (`src/content/pages/calculator-guide.html`) is generated from the audited legacy `calorie-calculator/index.html` by `node scripts/migrate-calculator-guide.mjs`; `--check` verifies it is current. Its introduction, callouts, image, and table of contents live in `src/components/CalculatorGuideIntro.astro`. It is a different public surface from the standalone `/blog/calorie-calculator-how-to` article and must not be sourced from it.
