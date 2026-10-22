# Muscle Hacking design ownership

The current appearance is intentional. Shared components preserve native markup, exact copy, responsive rules and interaction states; they do not make unlike pages look alike.

## Foundations

`src/styles/global.css` owns the existing palette, native typography, prose/list rhythm, shared reading frames and responsive layout rules. `src/styles/legacy-content.css` retains the audited intrinsic media ratios. Font files, font declarations and delivery settings are unchanged. Exact shared colour roles use `--brand`, `--accent`, `--body-ink`, `--callout-note`, `--callout-important`, `--callout-warning`, `--newsletter-border` and `--section-rule`; distinct colours retain separate roles. Share-channel tokens keep each circle, tooltip and arrow together; explorer-only tokens remain with the explorer stylesheet.

`SupplementExplorer.astro` owns explorer-only CSS, including mobile headings and prose rhythm. The route owns its distinct frame, heading, byline and intro paragraph override. `calculator.css` owns calculator controls and result typography.

Article headings, long-form headings, supplement headings and calculator headings have deliberate differences. Keep their current selectors and breakpoints. Native headings remain native elements; do not introduce a configurable Heading component. Keep the 700px content measure distinct from its 740px padded reading frame and the calculator's wider form.

`src/config/site.ts` owns approved public facts and URL composition. `src/config/routes.ts` owns route metadata and policy. Public values belong in those owners, not copied into page markup. Content prose and provider code retain their own boundaries.

## Shared patterns

The [component catalogue](documents/architecture/components.md) names the component, variants and consumers for every shared pattern. Use it before writing a second implementation. Global style recipes and tokens remain authoritative where the pattern is native typography or layout, rather than a compound component.

Pages supply only their metadata, unique content and deliberate composition. Use small typed options for existing differences, and slots for authored inline content. New component boundaries must not add wrappers or break parent selectors, native tags, IDs, ARIA attributes or script hooks.

A blue callout is not a supplement filter or a social channel merely because both use blue. Preserve the approved callout palette, distinct active/filter/share colours and real spacing differences. When two consumers use the same semantic value, reference its existing custom property rather than adding another literal.

## Changes to shared patterns

A refactor that preserves appearance requires every affected built route, including 404 and confirmation, to compare with zero changed pixels at phone, tablet and desktop sizes. Compare relevant states and semantic HTML separately. For a global owner, the consumer set is every document, not one example per layout. Temporary captures stay ignored; the [component reuse plan](documents/todo/component_reuse_plan.md) records the current acceptance procedure.

Colour checks must resolve custom properties in their inherited context. Keep exact colour and contrast assertions; raw CSS text changes when a token replaces a literal even when the rendered colour is identical.
