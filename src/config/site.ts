const contactEmail = 'jay@musclehacking.com';

export const site = {
  origin: 'https://www.musclehacking.com',
  name: 'Muscle Hacking',
  titleSeparator: ' | ',
  titlePrefixSeparator: ': ',
  /** BCP 47 tag rendered into `<html lang>`. Not a locale: no territory subtag. */
  language: 'en',
  /**
   * Open Graph locale, `language_TERRITORY`, rendered into `og:locale`.
   * Deliberately separate from `language`: the audience is American, so the
   * territory is US, while `<html lang>` stays the plain `en` tag.
   * Do not collapse the pair into one value.
   */
  openGraphLocale: 'en_US',
  authorDisplayName: 'Jay',
  contact: { email: contactEmail, href: `mailto:${contactEmail}` },
  socialHandle: 'musclehacking',
  newsletter: { buttonText: 'Email Me' },
  communityUrl: 'https://www.reddit.com/r/musclehacking/',
  defaultDescription:
    'An evidence-based approach to fitness and nutrition. I’m not here to sell you a dream. I’m here to get you shredded. Let’s get started.',
  defaultImage: '/img/musclehacking.png',
  social: {
    twitter: 'https://twitter.com/musclehacking',
    instagram: 'https://www.instagram.com/musclehacking/',
    reddit: 'https://www.reddit.com/user/musclehacking/',
    substack: 'https://musclehacking.substack.com/',
  },
  /**
   * Public sitekey of the invisible Turnstile widget `musclehacking-newsletter` in the
   * zone's Cloudflare account. It covers musclehacking.com and the review Worker host,
   * so one build can be promoted from preview to production unchanged.
   */
  turnstileSiteKey: '0x4AAAAAAFAolLk0PGOQbQuA',
  crawlerPolicy: {
    blockedAgents: ['archive.org_bot', 'ia_archiver'],
  },
} as const;

export const absoluteUrl = (path: string) => new URL(path, site.origin).href;

/** Keep the legacy tweet encoding shared by the calculator and its guide ending. */
export const calculatorTwitterText = `Check+out+this+calorie+and+macro+calculator:+${absoluteUrl('/calorie-calculator/')}%20from%20@${site.socialHandle}`;
export const calculatorShareHref = `https://twitter.com/intent/tweet?text=${calculatorTwitterText}`;
export const supplementTwitterText = `Check+out+this+supplement+guide:+${absoluteUrl('/supplements/')}%20from%20@${site.socialHandle}`;
