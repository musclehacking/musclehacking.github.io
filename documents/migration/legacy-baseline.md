# Legacy Baseline Contract

This document freezes the public Muscle Hacking contract before the Astro and Cloudflare migration. The authoritative source is Git commit `9bf25d0`. Live HTTP and public DNS observations were recorded on 31 August 2026 in Australia/Perth, without submitting a form or changing any external system.

The reduced machine-readable contract is in `tests/fixtures/legacy/`. Full page copy, link targets, markup, scripts and owned assets remain tied to the source files at commit `9bf25d0`; the fixtures intentionally avoid copying those large artefacts.

## Sources and extraction rules

| Contract area | Authoritative input | Reduction |
| --- | --- | --- |
| Routes and metadata | The 20 HTML files at `9bf25d0` plus read-only live GET requests | `routes.json` retains exact paths, statuses, redirects, canonicals and robots policy. `pages.json` retains titles, descriptions, H1 text and link/form counts. |
| Shared UI and network | All baseline HTML, CSS and JavaScript | `runtime-contract.json` retains shared regions and origins that load executable, style, embed or form resources. Ordinary outbound editorial links are excluded from the runtime list. |
| Calculator | `js/one.js` and the observable calculator | `calculator-goldens.json` retains defaults, exact displayed results, unit behaviour and source slider bounds. The opaque Vue implementation is not copied. |
| Supplements | `supplements/index.html` filter data and sorting code | `supplement-filters.json` retains every exposed filter's exact visible order and the required interaction states. Full descriptions and citations stay in the source file. |
| Newsletter | `js/humans-only.js`, public forms and a safe GET to the public handler | `newsletter-contract.json` retains field names and browser outcomes, but no visitor data, token, campaign value, credential or secret. |
| Visuals | Live production render corresponding to the baseline source | 46 PNG viewport captures are stored outside Git at the path in `runtime-contract.json`. |

## Route, status, canonical and indexability matrix

The mixed trailing-slash contract is intentional legacy behaviour. Section routes redirect from no slash to slash. Article routes return `200` without a slash and `404` with a slash.

| Public route | Legacy status | Non-canonical variant | Legacy canonical | Legacy indexability |
| --- | ---: | --- | --- | --- |
| `/` | 200 | None | `https://www.musclehacking.com/` | index, follow |
| `/blog/` | 200 | `/blog` -> 301 to `/blog/` | `undefined` | noindex, nofollow |
| `/books/` | 200 | `/books` -> 301 to `/books/` | `https://www.musclehacking.com/books/` | index, follow |
| `/calorie-calculator/` | 200 | `/calorie-calculator` -> 301 to slash | `https://www.musclehacking.com/calorie-calculator/` | index, follow |
| `/join/` | 200 | `/join` -> 301 to `/join/` | `https://www.musclehacking.com/one-last-step/` | noindex, follow |
| `/lose-fat-gain-muscle/` | 200 | `/lose-fat-gain-muscle` -> 301 to slash | `https://www.musclehacking.com/lose-fat-gain-muscle/` | index, follow |
| `/one-last-step/` | 200 | `/one-last-step` -> 301 to slash | `https://www.musclehacking.com/one-last-step/` | noindex, follow |
| `/supplements/` | 200 | `/supplements` -> 301 to slash | `https://www.musclehacking.com/supplements/` | index, follow |
| `/blog/australian-health-star-rating` | 200 | slash variant -> 404 | self | index, follow |
| `/blog/best-protein-powder-for-building-muscle` | 200 | slash variant -> 404 | self | index, follow |
| `/blog/breakup-energy` | 200 | slash variant -> 404 | self | index, follow |
| `/blog/calorie-calculator-how-to` | 200 | slash variant -> 404 | `https://www.musclehacking.com/calorie-calculator/` | index, follow through a non-self canonical |
| `/blog/change` | 200 | slash variant -> 404 | self | index, follow |
| `/blog/healthy-low-calorie-foods` | 200 | slash variant -> 404 | self | index, follow |
| `/blog/healthy-organic-post` | 200 | slash variant -> 404 | self | index, follow |
| `/blog/idols` | 200 | slash variant -> 404 | self | index, follow |
| `/blog/normal` | 200 | slash variant -> 404 | self | index, follow |
| `/blog/reject-modernity-embrace-masculinity` | 200 | slash variant -> 404 | self | index, follow |
| `/blog/weak` | 200 | slash variant -> 404 | self | index, follow |
| `/blog/what-is-intermittent-fasting` | 200 | slash variant -> 404 | self | index, follow |

An unknown path returns a generic GitHub Pages HTML body with status `404`. `feed.xml`, `robots.txt` and `sitemap.xml` return `200`; their observed content types are recorded in `routes.json`.

The migration's approved default is to preserve the route and status shapes while fixing metadata defects. That means a self-canonical, indexable `/blog/`; a self-canonical but noindex `/join/`; and a self-canonical calculator-how-to article unless the human approves a different canonical matrix.

## Page and shared UI contract

Every page's exact title, description, complete H1 text and link/form count is recorded in `pages.json`. Full visible copy remains authoritative in its named source file.

The common visual shell contains:

- a fixed blue gradient header with shield logo, wordmark, desktop navigation, a mobile Newsletter link and a collapsible mobile menu;
- one main listing or article region, with a page title and local imagery;
- a desktop sidebar on applicable content routes, containing a newsletter form, About copy and social links;
- table-of-contents navigation on long-form pages where present;
- footer, social/share, email and back-to-top controls where present; and
- progressive enhancements for navigation collapse, anchor navigation, share links, tooltips, popovers and email prompts.

The baseline uses local WOFF fonts and owned images. Core article copy and links remain visible without JavaScript, but the calculator output, supplement filtering, menu enhancements, tooltips, popovers and reCAPTCHA-backed submission rely on JavaScript.

## Runtime network contract

The legacy pages load code, style, embeds or form services from these third-party or separate origins:

| Origin | Observable use |
| --- | --- |
| `maxcdn.bootstrapcdn.com` | Bootstrap CSS and JavaScript |
| `code.jquery.com` | jQuery |
| `cdn.jsdelivr.net` | Popper and Tippy packages |
| `cdnjs.cloudflare.com` | Page-specific legacy JavaScript packages |
| `unpkg.com` | Page-specific legacy CSS and JavaScript packages |
| `www.google.com` | reCAPTCHA browser script |
| `www.googletagmanager.com` | retired Universal Analytics loader for `UA-120945323-1` |
| `dev.musclehacking.com` | newsletter form handler |
| `www.youtube-nocookie.com` | embedded video on one article |

Editorial outbound links, affiliate links and social profile links are content dependencies rather than render-time network dependencies. They remain in the baseline source and are not duplicated in the reduced fixture.

## Response headers

A representative live GET to `https://www.musclehacking.com/` returned:

- `200`, `Server: GitHub.com` and `Content-Type: text/html; charset=utf-8`;
- `Access-Control-Allow-Origin: *`;
- `Cache-Control: max-age=600`;
- `Vary: Accept-Encoding`; and
- GitHub Pages and Fastly diagnostic/cache headers.

The response did not contain a project-owned Content Security Policy, `X-Content-Type-Options`, Referrer Policy, Permissions Policy, frame restriction or HSTS header. Volatile request IDs, cache ages, dates and edge identifiers are evidence only and are not regression values.

A safe apex request to `https://musclehacking.com/blog/change?baseline=1` returned one `301` to `https://www.musclehacking.com/blog/change?baseline=1`, preserving the path and query.

## Public DNS observations

Public DNS showed:

- the apex on the four GitHub Pages A records `185.199.108.153`, `185.199.109.153`, `185.199.110.153` and `185.199.111.153`;
- `www.musclehacking.com` as a CNAME to `musclehacking.github.io`;
- `dev.musclehacking.com` resolving to Cloudflare anycast addresses;
- Google Workspace MX records; and
- SPF plus two Google site-verification TXT records.

The mail and verification records are unrelated and must remain unchanged. This public view is not the complete authoritative Cloudflare before-state. Before any future DNS write, the cutover runbook must capture all returned Cloudflare fields for every affected record. No DNS or Cloudflare mutation occurred during this baseline work.

## Known legacy defects

The following defects are verified by source inspection or live observation and may be fixed without treating the correction as a parity failure:

- all six feed item links contain `/blog/[object Object]`;
- `/blog/` emits `undefined` for both canonical and description and sets `noindex, nofollow`;
- `/join/` uses the `/one-last-step/` title and canonical;
- `/blog/calorie-calculator-how-to` canonicals to the calculator rather than itself, pending the human canonical decision;
- the home page has invalid H1 markup: it opens a second H1 where the first should close;
- the sitemap has 16 URLs and excludes `/blog/` and `/blog/calorie-calculator-how-to`;
- unknown routes use the generic GitHub Pages 404 rather than a project-owned recovery page;
- there is no `llms.txt`;
- Universal Analytics property `UA-120945323-1` is retired but still loaded; and
- the site depends on multiple legacy CDN packages and an undocumented PHP newsletter service.

The existing crawler policy allows ordinary crawling and blocks `archive.org_bot` and `ia_archiver`. Preserve it until the human approves a crawler-policy change.

## Calculator goldens

All three modes use the default male, age 25, 80 kg, 180 cm inputs. Standard and keto use sedentary activity, a 20 percent deficit and one gram of protein per pound. Standard uses a 50 percent fat calorie split. Keto fixes carbohydrates at 20 g. LeanGains uses the 11-19 percent body-fat band, standard muscle mass, 5,000 steps, a 500 kcal deficit and 50 percent protein calories.

| Mode | BMR | TDEE | Target | Protein | Fat | Carbs | Estimated change |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Standard | 1805 | 2166 | 1733 kcal | 176 g | 57 g | 129 g | -0.39 kg/week |
| LeanGains | Not displayed | 2240 | 1740 kcal | 218 g | 48 g | 109 g | -0.45 kg/week |
| Keto | 1805 | 2166 | 1733 kcal | 176 g | 105 g | 20 g | -0.39 kg/week |

Switching the default inputs to imperial displays 176.4 lb and 70.9 in while retaining the same result through the bundle's unrounded internal conversions. Source slider bounds are in `calculator-goldens.json`. The legacy number inputs do not provide a complete safe boundary contract; the migration must add explicit finite and range validation without changing valid golden results.

## Supplement filter order

The default Muscle Growth filter combines `muscle` and `power-output`. Sleep uses `sleep`. Results sort by efficacy high, medium, low, then source order for ties.

- Muscle Growth: Creatine, Whey Protein, Beta-Alanine, Alpha GPC, Ashwagandha, Melatonin, Fish Oil, Spirulina.
- Sleep: Melatonin, Ashwagandha, L-Theanine.
- Show All: Creatine, Beta-Alanine, Whey Protein, Alpha GPC, Ashwagandha, Melatonin, L-Theanine, Fish Oil, Spirulina, Ceylon Cinnamon, Curcumin, Collagen, Garlic, Mulberry Leaf Extract, Vitamin D, Magnesium, Zinc, Probiotic, Glucosamine.

The exact order for every other exposed category is in `supplement-filters.json`. Later tests must also assert the active button, efficacy label, `category-top` marker, rebuilt table of contents, fragment-triggered Show All behaviour and accessible popover content.

## Newsletter public contract and blocker

The browser posts `FormData` to `https://dev.musclehacking.com/subscription-handler.php`. Public forms expose these field names: `email`, `campaign_token`, `start_day`, `custom_signup_url`, `thankyou_url` and `g-recaptcha-response`. The browser obtains a reCAPTCHA token, appends it, expects JSON, and navigates to `data.thankYouUrl` when `data.success` is truthy. It shows one alert for provider rejection and another for network or JSON failure. Without JavaScript, the native form posts directly to the PHP endpoint.

A read-only GET to the handler returned `403`. No POST was sent.

Newsletter cutover is explicitly blocked. The repository does not contain the PHP source, downstream provider, subscriber destination, server-side reCAPTCHA policy, provider request mapping, duplicate handling, timeout behaviour or safe error mapping. The missing authority is read access to the dev host application source or its deployment configuration and the existing provider configuration. No secret should be added to this document or a fixture.

## Visual artefacts and limitations

Large images are intentionally outside Git:

`/Users/sacino/Documents/codex/web-development/musclehacking/legacy-baseline-9bf25d0/screenshots/`

The folder contains 46 PNGs captured with Google Chrome 151 headless:

- all 20 routes at 1440 x 1000 desktop and 390 x 844 mobile viewports;
- LeanGains and keto calculator states at both viewports; and
- supplement Show All state at both viewports.

The committed supplement fixture records the Sleep state exactly, but no Sleep screenshot was retained because the available headless browser did not provide reliable scripted interaction. These captures are settled viewport images, not full-page images. They complement, but do not replace, the complete source at `9bf25d0`, live route checks and reduced semantic fixtures. A later Playwright suite must create full-page, interactive and deterministic visual baselines before enforcing a pixel threshold.

## Baseline completion boundary

This artefact freezes the contract without changing `master`, GitHub, Cloudflare, DNS or production. It does not authorise a route-policy change, provider substitution, analytics replacement, canonical exception, content rewrite or cutover.
