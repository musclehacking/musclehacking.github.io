export const site = {
  origin: 'https://www.musclehacking.com',
  name: 'Muscle Hacking',
  authorDisplayName: 'Jay',
  contactEmail: 'jay@musclehacking.com',
  defaultTitle: 'Muscle Hacking: Gain Muscle And Lose Fat (Without The BS)',
  defaultDescription:
    'An evidence-based approach to fitness and nutrition. I’m not here to sell you a dream. I’m here to get you shredded. Let’s get started.',
  defaultImage: '/img/musclehacking.png',
  social: {
    twitter: 'https://twitter.com/musclehacking',
    instagram: 'https://www.instagram.com/musclehacking/',
    reddit: 'https://www.reddit.com/user/musclehacking/',
    substack: 'https://musclehacking.substack.com/',
  },
  crawlerPolicy: {
    blockedAgents: ['archive.org_bot', 'ia_archiver'],
  },
} as const;

export const absoluteUrl = (path: string) => new URL(path, site.origin).href;
