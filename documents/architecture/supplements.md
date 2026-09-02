# Supplement Explorer

## Purpose

`src/features/supplements/` owns the supplement explorer's typed records, category evidence, filter rules, deterministic ordering, and optional browser enhancement. The feature preserves the observable contract in `supplements/index.html` at audited baseline commit `9bf25d0` without carrying forward jQuery, Bootstrap JavaScript, Popper, or Tippy.

## Source of truth

`data.ts` is the application source of truth for filtering and order. Each `SupplementRecord` contains:

- the legacy heading ID and visible name;
- its zero-based position in the legacy document;
- the normalised visible text from its `Summary` section;
- every category and efficacy pair from its legacy `data-category` JSON;
- its recommended supplement URL, when present; and
- its references anchor, when the legacy page has a supplement-specific references section.

The audited `supplements/index.html` document remains the source of truth for the complete supplement copy, term explanations, inline citations, and reference lists. `content.ts` extracts those sections at build time and removes the legacy interaction attributes. Astro then prerenders the extracted content. The old scripts and browser libraries are not included in the generated page or client bundle.

The legacy document contains **19 supplement records**, from `Creatine` through `Glucosamine`. The migration plan says Show All contains 18 supplements, but the audited HTML contains 19 `.category` elements before the information section and the legacy `showAll()` function displays all 19. The typed data and regression test preserve the verified HTML behaviour.

`What is this?` and `References` are two headings in one legacy support section. They are not supplement records. `selectSupplementHeadings()` appends both headings after every selected supplement so table-of-contents and order tests match the visible contract.

## Filtering and ordering

`selector.ts` contains the pure selection rules:

1. Match a supplement when any evidence entry belongs to an active filter category.
2. Use the highest matching evidence level when a filter combines categories.
3. Sort matches by `high`, `medium`, then `low` evidence.
4. Resolve equal evidence by `sourceOrder`.
5. For Show All, ignore evidence rank and restore `sourceOrder`.

Muscle Growth combines `muscle` and `power-output`. Insulin Sensitivity combines `insulin-sensitivity` and `glucose-control`. Other visible filters map to one category.

Filter notices are part of the typed filter state. Muscle Growth and Insulin Sensitivity show their legacy category explanations, while Testosterone shows its legacy deficiency warning. Filters without a notice hide the notice container. After each filter change, the first selected supplement receives `category-top`; information-only mode assigns it to the information section.

Below 540 pixels, the supplement page and filter group fit the available viewport so every goal remains directly clickable without horizontal panning.

## Rendering contract

The Astro page or isolated component should render all content before JavaScript runs. Use these attributes to connect the semantic HTML to `enhanceSupplementExplorer()`:

- `data-supplement-filter="<filter-id>"` on native filter buttons;
- `data-supplement-sections` on the supplement section container;
- `data-supplement-id="<record-id>"` on each supplement section;
- `data-supplement-evidence` on the optional visible evidence label;
- `data-supplement-support` on the always-available information and references section;
- `data-supplement-category-note` on the contextual filter notice; and
- `data-supplement-toc` on the ordered or unordered table-of-contents list.

Evidence badges start empty and hidden in server-rendered HTML because evidence belongs to a selected goal, while no filter is selected before enhancement. `enhanceSupplementExplorer()` supplies the matching level and reveals the badge only after it establishes a goal context. The supplement copy, citations, information, and references remain visible without JavaScript.

Every inline citation must resolve to an ID in the rendered References section. Each stored `referencesAnchor` must also resolve to its supplement-specific reference heading. Do not replace the full content with summaries or placeholder reference copy.

The information-only button uses `data-supplement-filter="information"`. Filter buttons must use `aria-pressed`; the enhancement keeps that state in sync. Render supporting explanations with native `<details>` and `<summary>` where possible. If a button-controlled disclosure is required, use `data-supplement-popover`, `aria-controls`, and a panel that starts with `hidden`; the enhancement maintains `aria-expanded` and closes the open panel on Escape.

The module uses native pointer, focus, click, and keyboard events. A touchscreen tap leaves its controlled evidence popover open; tapping outside dismisses it. It adds no animation timing, `prefers-reduced-motion` branch, or `requestAnimationFrame` wrapper. If JavaScript fails, all supplement sections, links, information, and references remain in the server-rendered document.

## Editing and verification

When changing a supplement, compare the intended content with the named legacy section or an approved replacement source. Keep `sourceOrder` unique and contiguous. Add every category to `SupplementCategoryId` and `supplementCategories` before using it in a record.

Run the focused parity suite with:

```sh
pnpm vitest run tests/unit/supplements.test.ts
pnpm exec playwright test tests/e2e/supplement-content.spec.ts --project=chromium
```

The focused suites fix the exact Muscle Growth, Sleep, and Show All heading sequences and verify that detailed copy, citations, and research targets survive prerendering. A changed membership, evidence rank, source order, or missing citation target must fail until the change is reviewed and the fixture is deliberately updated.
