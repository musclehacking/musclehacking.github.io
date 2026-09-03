import { describe, expect, it } from 'vitest';
import { deriveNavigation } from '../../src/lib/content/navigation';
import type { BlogEntry } from '../../src/lib/content/types';

const post = (id: string, title: string, navigation: Record<string, unknown> = {}, extra: Record<string, unknown> = {}) => ({
  id,
  collection: 'blog',
  data: { title, navigation, ...extra },
}) as unknown as BlogEntry;

const posts = [
  post('breakup-energy', 'Breakup Energy', {
    previous: { href: '/lose-fat-gain-muscle/', label: 'Start Here', title: 'How to Lose Fat And Gain Muscle', displayTitle: 'How to Lose Fat And Gain Muscle (As A Beginner)' },
    next: { href: '/blog/best-protein-powder-for-building-muscle', label: 'Nutrition Related', title: 'Best Protein Powder for Muscle Gain: An Evidence-Based Approach', displayTitle: 'Best Protein Powder for Muscle Gain' },
  }),
  post('idols', 'First, They Kill Your Idols'),
  post('weak', 'How To Stay Weak'),
  post('change', 'You Don’t Want To Change.', {}, { shortTitle: 'You Don’t Want To Change' }),
  post('normal', 'On Being Normal', { next: { href: '/supplements/', label: 'Next Post', title: 'Muscle Building Supplement Stack (Based on Research)' } }, { linkTitle: 'On Normalcy' }),
  post('reject-modernity-embrace-masculinity', 'Reject Modernity, Embrace Masculinity: The Meaning Behind The Meme', {}, { shortTitle: 'Reject Modernity, Embrace Masculinity' }),
  post('best-protein-powder-for-building-muscle', 'Best Protein Powder for Muscle Gain: An Evidence-Based Approach'),
  post('healthy-low-calorie-foods', 'The Golden Zone: Healthy, Low Calorie Foods', {}, { shortTitle: 'The Golden Zone: Healthy Low Calorie Foods', linkTitle: 'The Golden Zone: Healthy Low Calorie Foods' }),
  post('australian-health-star-rating', 'Australian Health Star Ratings: A Failed Experiment'),
  post('healthy-organic-post', 'A Healthy, Organic, Naturally Flavoured Post'),
  post('what-is-intermittent-fasting', 'What is Intermittent Fasting?'),
  post('calorie-calculator-how-to', 'How To Use The Calorie Calculator'),
];

describe('deriveNavigation', () => {
  it.each([
    ['australian-health-star-rating', 'healthy-organic-post', 'healthy-low-calorie-foods'],
    ['best-protein-powder-for-building-muscle', 'healthy-low-calorie-foods', 'reject-modernity-embrace-masculinity'],
    ['calorie-calculator-how-to', undefined, 'what-is-intermittent-fasting'],
    ['healthy-low-calorie-foods', 'australian-health-star-rating', 'best-protein-powder-for-building-muscle'],
    ['healthy-organic-post', 'what-is-intermittent-fasting', 'australian-health-star-rating'],
    ['reject-modernity-embrace-masculinity', 'best-protein-powder-for-building-muscle', 'normal'],
    ['what-is-intermittent-fasting', 'calorie-calculator-how-to', 'healthy-organic-post'],
  ])('derives legacy adjacency for %s', (id, previous, next) => {
    const navigation = deriveNavigation(posts.find((entry) => entry.id === id)!, posts);
    expect(navigation.previous?.href).toBe(previous);
    expect(navigation.next?.href).toBe(next);
  });

  it('omits previous for the oldest post and next for the newest post by default', () => {
    expect(deriveNavigation(posts.at(-1)!, posts).previous).toBeUndefined();
    const newest = post('newest', 'Newest');
    expect(deriveNavigation(newest, [newest, ...posts]).next).toBeUndefined();
  });

  it('passes explicit links through and derives wrapped titles', () => {
    const navigation = deriveNavigation(posts[0]!, posts);
    expect(navigation.previous).toEqual(posts[0]!.data.navigation.previous);
    expect(navigation.wrapTitles).toBe(true);
  });
});
