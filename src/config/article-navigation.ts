export interface ArticleNavigationLink {
  href: string;
  label: string;
  title: string;
  displayTitle?: string;
}

export interface ArticleNavigation {
  previous?: ArticleNavigationLink;
  next?: ArticleNavigationLink;
}

/**
 * Server-rendered replacement for the navigation embedded in the imported
 * legacy Markdown. Display titles preserve the shorter text shown by the
 * source site while title attributes retain the complete article names.
 */
export const articleNavigation: Record<string, ArticleNavigation> = {
  'australian-health-star-rating': {
    previous: { href: 'healthy-organic-post', label: 'Previous Post', title: 'A Healthy, Organic, Naturally Flavoured Post' },
    next: { href: 'healthy-low-calorie-foods', label: 'Next Post', title: 'The Golden Zone: Healthy Low Calorie Foods' },
  },
  'best-protein-powder-for-building-muscle': {
    previous: { href: 'healthy-low-calorie-foods', label: 'Previous Post', title: 'The Golden Zone: Healthy Low Calorie Foods' },
    next: { href: 'reject-modernity-embrace-masculinity', label: 'Next Post', title: 'Reject Modernity, Embrace Masculinity: The Meaning Behind The Meme', displayTitle: 'Reject Modernity, Embrace Masculinity' },
  },
  'breakup-energy': {
    previous: { href: '/lose-fat-gain-muscle/', label: 'Start Here', title: 'How to Lose Fat And Gain Muscle', displayTitle: 'How to Lose Fat And Gain Muscle (As A Beginner)' },
    next: { href: '/blog/best-protein-powder-for-building-muscle', label: 'Nutrition Related', title: 'Best Protein Powder for Muscle Gain: An Evidence-Based Approach', displayTitle: 'Best Protein Powder for Muscle Gain' },
  },
  'calorie-calculator-how-to': {
    next: { href: 'what-is-intermittent-fasting', label: 'Next Post', title: 'What is Intermittent Fasting?' },
  },
  change: {
    previous: { href: '/blog/best-protein-powder-for-building-muscle', label: 'Nutrition Related', title: 'Best Protein Powder for Muscle Gain: An Evidence-Based Approach' },
    next: { href: '/blog/reject-modernity-embrace-masculinity', label: 'Society Related', title: 'Reject Modernity, Embrace Masculinity: The Meaning Behind The Meme' },
  },
  'healthy-low-calorie-foods': {
    previous: { href: 'australian-health-star-rating', label: 'Previous Post', title: 'Australian Health Star Ratings: A Failed Experiment' },
    next: { href: 'best-protein-powder-for-building-muscle', label: 'Next Post', title: 'Best Protein Powder for Muscle Gain: An Evidence-Based Approach' },
  },
  'healthy-organic-post': {
    previous: { href: 'what-is-intermittent-fasting', label: 'Previous Post', title: 'What is Intermittent Fasting?' },
    next: { href: 'australian-health-star-rating', label: 'Next Post', title: 'Australian Health Star Ratings: A Failed Experiment' },
  },
  idols: {
    previous: { href: '/blog/best-protein-powder-for-building-muscle', label: 'Nutrition Related', title: 'Best Protein Powder for Muscle Gain: An Evidence-Based Approach' },
    next: { href: '/blog/reject-modernity-embrace-masculinity', label: 'Society Related', title: 'Reject Modernity, Embrace Masculinity: The Meaning Behind The Meme' },
  },
  normal: {
    previous: { href: 'reject-modernity-embrace-masculinity', label: 'Previous Post', title: 'Reject Modernity, Embrace Masculinity: The Meaning Behind The Meme', displayTitle: 'Reject Modernity, Embrace Masculinity' },
    next: { href: '/supplements/', label: 'Next Post', title: 'Muscle Building Supplement Stack (Based on Research)' },
  },
  'reject-modernity-embrace-masculinity': {
    previous: { href: 'best-protein-powder-for-building-muscle', label: 'Previous Post', title: 'Best Protein Powder for Muscle Gain: An Evidence-Based Approach' },
    next: { href: 'normal', label: 'Next Post', title: 'On Normalcy' },
  },
  weak: {
    previous: { href: '/blog/best-protein-powder-for-building-muscle', label: 'Nutrition Related', title: 'Best Protein Powder for Muscle Gain: An Evidence-Based Approach' },
    next: { href: '/blog/reject-modernity-embrace-masculinity', label: 'Society Related', title: 'Reject Modernity, Embrace Masculinity: The Meaning Behind The Meme' },
  },
  'what-is-intermittent-fasting': {
    previous: { href: 'calorie-calculator-how-to', label: 'Previous Post', title: 'How To Use The Calorie Calculator' },
    next: { href: 'healthy-organic-post', label: 'Next Post', title: 'A Healthy, Organic, Naturally Flavoured Post' },
  },
};
