import { beforeEach, describe, expect, it, vi } from 'vitest';

const content = vi.hoisted(() => ({ getCollection: vi.fn() }));
vi.mock('astro:content', () => content);

import { getListing } from '../../src/lib/content/collections';

const entry = (id: string, published: string, title: string, overrides: Record<string, unknown> = {}) => ({
  id,
  collection: 'blog',
  data: {
    title,
    description: `${title} description`,
    published: new Date(`${published}T00:00:00Z`),
    draft: false,
    image: `/img/${id}.png`,
    imageAlt: `${title} alt`,
    card: {},
    navigation: {},
    ending: { floatingShare: true, disclaimer: false, headingLinks: true },
    ...overrides,
  },
});

const posts = [
  entry('breakup-energy', '2025-09-05', 'Breakup Energy', { card: { description: 'A new fundamental force has been discovered.', imageAlt: 'Breakup Energy' } }),
  entry('idols', '2024-06-01', 'First, They Kill Your Idols'),
  entry('weak', '2024-04-01', 'How To Stay Weak'),
  entry('change', '2024-03-01', 'You Don’t Want To Change.', { shortTitle: 'You Don’t Want To Change', card: { title: 'You Don’t Want To Change' } }),
  entry('normal', '2023-06-01', 'On Being Normal', { card: { ratio: '100 / 51.57142857' } }),
  entry('reject-modernity-embrace-masculinity', '2022-10-01', 'Reject Modernity, Embrace Masculinity: The Meaning Behind The Meme', { shortTitle: 'Reject Modernity, Embrace Masculinity' }),
  entry('best-protein-powder-for-building-muscle', '2018-10-01', 'Best Protein Powder for Muscle Gain: An Evidence-Based Approach'),
  entry('healthy-low-calorie-foods', '2018-08-01', 'The Golden Zone: Healthy, Low Calorie Foods', { shortTitle: 'The Golden Zone: Healthy Low Calorie Foods' }),
  entry('australian-health-star-rating', '2018-06-01', 'Australian Health Star Ratings: A Failed Experiment'),
  entry('healthy-organic-post', '2018-05-01', 'A Healthy, Organic, Naturally Flavoured Post'),
  entry('what-is-intermittent-fasting', '2018-04-01', 'What is Intermittent Fasting?'),
  entry('calorie-calculator-how-to', '2018-03-01', 'How To Use The Calorie Calculator'),
];

const pages = [
  { ...entry('guide', '2024-09-01', 'How to Lose Fat And Gain Muscle (As A Beginner)', { path: '/lose-fat-gain-muscle/', listed: true, shortTitle: 'How To Lose Fat And Gain Muscle (As A Beginner)', card: { title: 'Getting Started: How To Lose Fat And Gain Muscle' } }), collection: 'pages' },
  { ...entry('books', '2023-12-01', 'Fitness & Health Books Worth Reading', { path: '/books/', listed: true, shortTitle: 'Gym & Fitness Books Worth Reading', card: { title: 'Gym & Fitness Books Worth Reading' } }), collection: 'pages' },
];

describe('getListing', () => {
  beforeEach(() => {
    content.getCollection.mockImplementation(async (name: string) => name === 'blog' ? posts : pages);
  });

  it('merges posts, listed pages, and the pinned supplement in published order', async () => {
    const listing = await getListing(new Date('2026-09-03T00:00:00Z'));
    expect(listing).toHaveLength(15);
    expect(listing.map((item) => item.href)).toEqual([
      '/blog/breakup-energy', '/lose-fat-gain-muscle/', '/blog/idols', '/blog/weak', '/blog/change', '/books/', '/supplements/', '/blog/normal',
      '/blog/reject-modernity-embrace-masculinity', '/blog/best-protein-powder-for-building-muscle', '/blog/healthy-low-calorie-foods',
      '/blog/australian-health-star-rating', '/blog/healthy-organic-post', '/blog/what-is-intermittent-fasting', '/blog/calorie-calculator-how-to',
    ]);
    expect(listing[0]).toMatchObject({ title: 'Breakup Energy', description: 'A new fundamental force has been discovered.', imageAlt: 'Breakup Energy', date: 'September 2025', ratio: '5 / 3' });
    expect(listing[6]).toMatchObject({ title: 'The Best Muscle Building Supplement Stack (Based on Research)', sidebarTitle: 'Muscle Building Supplement Stack (Based on Research)' });
    expect(listing[7]?.ratio).toBe('100 / 51.57142857');
  });

  it('excludes draft and future posts', async () => {
    content.getCollection.mockImplementation(async (name: string) => name === 'blog' ? [
      ...posts,
      entry('draft', '2026-01-01', 'Draft', { draft: true }),
      entry('future', '2027-01-01', 'Future'),
    ] : pages);
    const listing = await getListing(new Date('2026-09-03T00:00:00Z'));
    expect(listing.map((item) => item.href)).not.toContain('/blog/draft');
    expect(listing.map((item) => item.href)).not.toContain('/blog/future');
  });
});
