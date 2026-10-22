# Shared component catalogue

Use the least specialised existing owner. A pattern rendered many times by one loop or layout is already shared; new pages supply data and genuine differences rather than copying its markup or CSS. [Design ownership](../../DESIGN.md) describes the presentation contract.

## Owners, variants and consumers

| Pattern | Authoritative owner | Current variants | Consumers |
| --- | --- | --- | --- |
| Document, head and fixed header | `BaseLayout.astro`, `head/PageMetadata.astro`, `Header.astro` | Route-dependent mobile navigation; no footer | Every document |
| Sidebar frame | `ContentLayout.astro` | Existing optional sidebar | Home and blog listing |
| Article composition | `ArticleLayout.astro`, `article/ArticleHeader.astro` | Article/longform; optional notice/caption; heading-link policy | Published blog entries, Books, beginner guide |
| Listing card and recent links | `HomeListing.astro`, `Sidebar.astro`; `lib/content/cards.ts` | Existing aspect ratios, first-image priority and sidebar titles | Home and blog listing |
| Public facts | `config/site.ts::site`, `absoluteUrl`, calculator/supplement tweet helpers | Display/protocol contact forms, profile/community destinations and legacy tweet encoding | Header, sidebar, 404, listing, bylines, metadata and sharing |
| SVG icon geometry | `lib/icons.ts::icons`; `Icon.astro` renders Astro SVGs | Exact Twitter/Facebook/Reddit inline serialisations; callout note/important/warning; header social marks | Header, Callout, SupplementExplorer, ShareLinks, SocialShareRail; calculator and supplement enhancement import only their named paths |
| Callout | `Callout.astro`; global `.project-callout` recipe | Note/important/warning; page-authored labels/classes and slotted body | Listing intro, article notices, authored content, calculator guide, supplements intro |
| Newsletter controls and bottom band | `NewsletterForm.astro`, `article/NewsletterSignup.astro` | Sidebar/article/longform/calculator/floating/modal/join placements; exact labels and IDs | Sidebar, join, article endings and calculator prompts |
| Calculator prompts | `CalculatorNewsletterPrompts.astro` | Scroll-triggered floating panel and timed native dialog | Calculator only |
| Article ending | `article/ArticleEnding.astro`, specialised by `article/SectionEnding.astro` | Article-authored inputs; calculator/supplement section defaults with page-owned headings and share-title override | ArticleLayout, calculator guide and supplements |
| Affiliate disclosure | `article/AffiliateDisclaimer.astro` | Shared prefix; generic and calculator-specific suffix | Article endings that enable disclosure |
| Share rail item and static tooltip | `article/ShareRailItem.astro`, `ProjectTip.astro` | Twitter/Facebook/LinkedIn/email/copy channels; hint and copy-feedback roles/themes | Five rail items and six static tooltips in SocialShareRail |
| Related navigation | `article/PostNavigation.astro`; `lib/content/navigation.ts::getSectionNavigation` | Previous/next, optional side, wrapped/ellipsised title | Article endings and confirmation |
| Figures and authored body components | `content/Figure.astro`, `TableOfContents.astro`, `References.astro`, `AffiliateLink.astro`, `YouTube.astro` | Existing ratio/caption/loading and authored data options | Markdown/MDX articles/pages and calculator intro |
| Supplement rendering and selection | `SupplementExplorer.astro` (including explorer CSS), `SupplementSupport.astro`, `features/supplements/` | Goal filters, evidence, support sections and no-script fallback | Supplements |
| Calculator controls and help labels | `Calculator.tsx::NumericInput`, `FieldLabel`, `InfoMark` | Existing number/range inputs, bounds, units and help placements | Calculator fields in every mode |
| Calculator rendering | `features/calculator/Calculator.tsx` and `calculator.css` | Standard/LeanGains/Keto, units and existing validated inputs | Calculator only |
| Dynamic/React tooltips | `scripts/project-tip.ts`, calculator's native React adapter; global `.project-tip-*` | Existing themes, placements and hint/status lifecycles | Heading links and calculator Copy |
| Back to top | `BackToTop.astro`; global `.back-to-top` | Existing desktop/mobile sizes and reveal threshold | Calculator and supplements |
| Typography, section rules and layout | `styles/global.css` | Existing native/article/longform/calculator/supplement roles and responsive conditions | All layouts and components |

## Implementation boundaries

`Icon.astro` emits only the original SVG/path, forwarding SVG attributes and explicit path attributes. Named geometry exports let browser adapters share the source without importing the complete server-side icon catalogue. Different legacy path serialisations remain explicit variants so built SVG attributes do not change.

Keep DOM creation in the existing browser tooltip factory and JSX in the calculator. Sharing geometry and CSS across renderers does not justify adding a hydrated icon library or moving static markup into React.

Component extraction must preserve meaningful whitespace, direct children and selector specificity. If a parent has scoped styles, forward its class and remaining Astro attributes onto the original root. Reuse the current global recipe rather than a free-form style-prop interface.

One-off page compositions, authored bodies, generated calculator/supplement content, provider code, legacy pre-Astro files and build/font/deployment settings are outside component consolidation. Existing script loading remains unchanged.

`getSectionNavigation` owns the two existing section destinations and resolves their titles from published content. SectionEnding retains Read Something Similar/Different; confirmation supplies Nutrition Related/Society Related. Chronological article navigation stays in `deriveNavigation`.

`SupplementSupport.astro` owns only the repeated native section, heading and trusted body wrapper. Information and References retain their IDs and extracted content. The dynamic category notice remains explicit in SupplementExplorer.

`config/routes.ts` owns the supplements route’s distinct title and visible heading; `config/home.ts` reuses those facts for its pinned card and sidebar. Confirmation reads its route metadata and retains its unique body.

Content IDs are slugs. `getSectionNavigation` compares their `/blog/` paths and resolves exact full link titles, without applying the separate sidebar short-title rule.

Global style ownership includes the shared article/guide frame, equal callout spacing, body ink and exact semantic colours. The supplements route retains only its distinct frame, heading, byline and intro paragraph override. Explorer mobile heading/rhythm rules live once with SupplementExplorer. Calculator result-value/caption typography is grouped in calculator.css; its distinct margins and native range-thumb adapters remain explicit.

Share-channel colours have one global token per channel for circle, tooltip and arrow. Feature-local supplement tokens own filter base/hover, high-evidence fill and the preserved subheading adjacency gap. Detail/support heading and paragraph recipes are grouped; their differing margins, overflow wrapping and mobile support adjacency stay explicit.
