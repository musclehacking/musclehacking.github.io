import { blogSlugs } from './blog-slugs.generated.ts';

export type SlashMode = 'slash' | 'no-slash';

export interface PublicRoute {
  path: string;
  slashMode: SlashMode;
  owner: 'page' | 'blog';
  title: string;
  titleMode?: 'composed' | 'prefixed' | 'absolute';
  description: string;
  indexable: boolean;
  sitemap: boolean;
  navigationLabel?: string;
}

export const routes: readonly PublicRoute[] = [
  {
    path: '/',
    slashMode: 'slash',
    owner: 'page',
    title: 'Gain Muscle And Lose Fat (Without The BS)',
    titleMode: 'prefixed',
    description: 'An evidence-based approach to fitness and nutrition. I’m not here to sell you a dream. I’m here to get you shredded. Let’s get started.',
    indexable: true,
    sitemap: true,
    navigationLabel: 'Home',
  },
  {
    path: '/blog/',
    slashMode: 'slash',
    owner: 'page',
    title: 'Muscle Hacking Blog',
    titleMode: 'absolute',
    description: 'Evidence-based articles about gaining muscle, losing fat, nutrition, and fitness.',
    indexable: true,
    sitemap: true,
    navigationLabel: 'Blog',
  },
  {
    path: '/books/',
    slashMode: 'slash',
    owner: 'page',
    title: 'Fitness & Health Books Worth Reading',
    description: 'Books about working out, nutrition & fitness that are worth more than the paper they’re written on.',
    indexable: true,
    sitemap: true,
    navigationLabel: 'Books',
  },
  {
    path: '/calorie-calculator/',
    slashMode: 'slash',
    owner: 'page',
    title: 'Calorie And Macro Calculator (Bulking, Maintenance or Cutting)',
    description: 'Calculate how many calories and macros you need while bulking, cutting, or maintaining.',
    indexable: true,
    sitemap: true,
    navigationLabel: 'Calorie Calculator',
  },
  {
    path: '/join/',
    slashMode: 'slash',
    owner: 'page',
    title: 'Join the Muscle Hacking Newsletter',
    titleMode: 'absolute',
    description: 'Subscribe to receive the latest Muscle Hacking articles.',
    indexable: false,
    sitemap: false,
    navigationLabel: 'Newsletter',
  },
  {
    path: '/lose-fat-gain-muscle/',
    slashMode: 'slash',
    owner: 'page',
    title: 'How to Lose Fat And Gain Muscle (As A Beginner)',
    description: 'How to lose fat and gain muscle as a beginner. Stop procrastinating and start getting results.',
    indexable: true,
    sitemap: true,
  },
  {
    path: '/one-last-step/',
    slashMode: 'slash',
    owner: 'page',
    title: 'One Last Step',
    description: 'Confirm your email address and I’ll send you my latest articles.',
    indexable: false,
    sitemap: false,
  },
  {
    path: '/supplements/',
    slashMode: 'slash',
    owner: 'page',
    title: 'The Best Muscle Building Supplement Stack (Based on Research)',
    description: 'Amplify your muscle growth with a curated supplement stack, distilled from 10+ years of scientific research. Gain muscle, lose the confusion.',
    indexable: true,
    sitemap: true,
    navigationLabel: 'Supplements',
  },
  ...blogSlugs.map((slug) => ({
    path: `/blog/${slug}`,
    slashMode: 'no-slash' as const,
    owner: 'blog' as const,
    title: slug,
    description: slug,
    indexable: true,
    sitemap: true,
  })),
];

export const routeByPath = new Map(routes.map((route) => [route.path, route]));
export { blogSlugs };
