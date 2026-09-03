# Content editing

Blog posts live in `src/content/blog/`. Long-form pages live in `src/content/pages/`. Use `.md` for Markdown-only bodies and `.mdx` when a body uses a component from `src/components/content/`.

## Copy-ready post

This five-field template is the minimum valid blog post. Put the referenced image in `public/img/` first.

```md
---
title: "Post title"
description: "One sentence used for search and sharing."
published: "2026-09-03"
image: "/img/post-image.jpg"
imageAlt: "A concise description of the image"
imageWidth: 1200
imageHeight: 720
---

Write the introduction in Markdown.
```

The five author decisions are `title`, `description`, `published`, `image`, and `imageAlt`. Stable `/img/` URLs also require measured `imageWidth` and `imageHeight`. A relative image imported through Astro supplies its own dimensions.

## Frontmatter reference

| Field | Required | Purpose |
| --- | --- | --- |
| `title` | Yes | Visible article heading and default SEO title |
| `description` | Yes | Search, feed, card, and social summary |
| `published` | Yes | Publication date and chronological order |
| `image`, `imageAlt` | Yes | Hero source and alternative text |
| `imageWidth`, `imageHeight` | For `/img/` sources | Stable intrinsic image size |
| `seoTitle` | No | SEO title override before site-name composition |
| `updated`, `byline` | No | Updated date or complete byline override |
| `draft` | No | Excludes the entry from routes, listings, feed, sitemap, and `llms.txt`; defaults to `false` |
| `imageCaption` | No | Hero caption |
| `shortTitle`, `linkTitle` | No | Derived navigation and link text overrides |
| `card` | No | Listing `title`, `description`, `image`, `imageAlt`, or `ratio` overrides |
| `navigation` | No | `previous`, `next`, or `wrapTitles` overrides; use `false` to remove one side |
| `ending` | No | `floatingShare`, `disclaimer`, and `headingLinks` controls |
| `notice` | No | Header callout with `variant`, `label`, and approved `html` |
| `canonicalOverride` | No | Reviewed absolute canonical exception |

Pages use the same fields plus required `path`, which must exist in `src/config/routes.ts`, and optional `listed`, which defaults to `true`.

Future-dated entries follow the same exclusion rules as drafts. Publishing uses UTC and begins when `published` is not later than the build time.

## Body components

Use ordinary Markdown for paragraphs, headings, lists, links, emphasis, and blockquotes. Import nothing in the entry. MDX maps these component names automatically:

```mdx
<Figure src="/img/example.jpg" alt="Example" width={1200} height={720} ratio="5x3">
  Optional caption.
</Figure>

<Callout variant="note" label="Note">
  Callout content.
</Callout>

<YouTube id="video-id" title="Video title" />

<TableOfContents items={[{ href: '#section', label: 'Section' }]} />

<References>
1. [Source](https://example.com)
</References>

<AffiliateLink href="https://example.com">Book title</AffiliateLink>
```

Raw HTML is restricted to the authoring lint allowlist: `a`, `br`, `div`, `em`, `h2`, `h3`, `h4`, `h5`, `img`, `li`, `ol`, `picture`, `span`, `strong`, `sub`, `sup`, `table`, `tbody`, `td`, `th`, `thead`, `tr`, and `ul`. A raw `div` is allowed only for the existing `table-responsive` wrapper. Do not add raw paragraph, iframe, or callout markup.

Use `/img/...` only when the public URL must remain stable. Supply real dimensions and meaningful alternative text. Use an empty alternative only for a truly decorative image. Never edit `dist/`.

## Validate a change

```bash
pnpm check
pnpm test
pnpm build
pnpm verify:dist
```

The pre-command slug sync updates `src/config/blog-slugs.generated.ts`. Commit that generated file when a published slug changes. Run the full Playwright and accessibility commands in `README.md` for layout, component, or shared-content changes.

The calculator guide at `src/content/pages/calculator-guide.html` remains generated from the audited legacy calculator page. Check it with `node scripts/migrate-calculator-guide.mjs --check`; do not use it as a template for authored entries.
