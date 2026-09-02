export interface HomeFeature {
  readonly href: string;
  readonly image: string;
  readonly imageAlt: string;
  readonly title: string;
  readonly date: string;
  readonly description: string;
  /** Legacy `.intrinsic--*` figure ratio as an `aspect-ratio` value; `.intrinsic--head` is 5 / 3. */
  readonly ratio: string;
}

// The home page is a curated reading order, not a date-sorted projection of the
// blog collection. Section routes are intentionally included in the same list.
export const homeFeatures = [
  ['/blog/breakup-energy', '/img/breakup-energy.png', 'Breakup Energy', 'Breakup Energy', 'September 2025', 'A new fundamental force has been discovered.'],
  ['/lose-fat-gain-muscle/', '/img/lose-fat-gain-mucle-beginner.png', 'How to Lose Fat And Gain Muscle (As A Beginner)', 'Getting Started: How To Lose Fat And Gain Muscle', 'September 2024', 'A guide for beginners.'],
  ['/blog/idols', '/img/idols.png', 'First, They Kill Your Idols.', 'First, They Kill Your Idols', 'June 2024', 'Crabs in a bucket.'],
  ['/blog/weak', '/img/weak.png', 'How To Stay Weak.', 'How To Stay Weak', 'April 2024', 'A step-by-step guide on how to minimize muscle gain.'],
  ['/blog/change', '/img/change.png', 'You Don’t Want To Change.', 'You Don’t Want To Change', 'March 2024', 'If you were serious about wanting to change your life, you’d do it now.'],
  ['/books/', '/img/fitness-books-worth-reading.png', 'Fitness Books Worth Reading', 'Gym & Fitness Books Worth Reading', 'December 2023', 'Fitness (ish) books worth reading.'],
  ['/supplements/', '/img/muscle-building-supplement-stack.png', 'Muscle Building Supplement Stack', 'The Best Muscle Building Supplement Stack (Based on Research)', 'August 2023', 'Summary of 10+ years of supplement research.'],
  ['/blog/normal', '/img/normal.png', 'Do you strive to be normal?', 'On Being Normal', 'June 2023', 'Do you strive to be ‘normal’?'],
  ['/blog/reject-modernity-embrace-masculinity', '/img/reject-modernity-embrace-masculinity.png', 'Reject Modernity, Embrace Masculinity', 'Reject Modernity, Embrace Masculinity: The Meaning Behind The Meme', 'October 2022', 'Why is this meme so popular?'],
  ['/blog/best-protein-powder-for-building-muscle', '/img/best-protein-powder-muscle-gain.jpg', 'Five scoops of protein powder labelled whey, soy, pea, rice, and hemp protein', 'Best Protein Powder for Muscle Gain: An Evidence-Based Approach', 'October 2018', 'Not all protein powders were made equal.'],
  ['/blog/healthy-low-calorie-foods', '/img/archer-the-golden-zone.jpg', 'Archer standing behind a black and gold background with the words The Golden Zone', 'The Golden Zone: Healthy, Low Calorie Foods', 'August 2018', 'Where healthy meets low calorie.'],
  ['/blog/australian-health-star-rating', '/img/australian-health-star-has-to-go.jpg', 'Man eating cereal off of his head', 'Australian Health Star Ratings: A Failed Experiment', 'June 2018', 'Understanding the Australian health star rating system.'],
  ['/blog/healthy-organic-post', '/img/naturally-flavoured.jpg', 'What does naturally flavoured mean', 'A Healthy, Organic, Naturally Flavoured Post', 'May 2018', 'If you’ve ever been to the supermarket, you’ve probably seen many of these labels before.'],
  ['/blog/what-is-intermittent-fasting', '/img/no-breakfast.jpg', 'Do you need to eat breakfast', 'What is Intermittent Fasting?', 'April 2018', 'Purposely avoiding the most important meal of the day.'],
  ['/blog/calorie-calculator-how-to', '/img/calorie-calculator.jpg', 'A Calorie Calculator', 'How To Use The Calorie Calculator', 'March 2018', 'How to use the Calorie and Macro Calculator.'],
] satisfies readonly (readonly [string, string, string, string, string, string])[];

// Legacy index.html uses `.intrinsic--head` (60% padding, 5:3) for every card
// except /blog/normal, which uses `.intrinsic--new17` (51.57142857% padding).
const featureRatios: Readonly<Record<string, string>> = {
  '/blog/normal': '100 / 51.57142857',
};

export const typedHomeFeatures: readonly HomeFeature[] = homeFeatures.map(
  ([href, image, imageAlt, title, date, description]) => ({
    href,
    image,
    imageAlt,
    title,
    date,
    description,
    ratio: featureRatios[href] ?? '5 / 3',
  }),
);

// The sidebar labels intentionally preserve the shorter legacy wording rather
// than reusing every home-card title verbatim.
export const recentPosts = [
  ['/blog/breakup-energy', 'Breakup Energy'],
  ['/lose-fat-gain-muscle/', 'How To Lose Fat And Gain Muscle (As A Beginner)'],
  ['/blog/idols', 'First, They Kill Your Idols'],
  ['/blog/weak', 'How To Stay Weak'],
  ['/blog/change', 'You Don’t Want To Change'],
  ['/books/', 'Gym & Fitness Books Worth Reading'],
  ['/supplements/', 'Muscle Building Supplement Stack (Based on Research)'],
  ['/blog/normal', 'On Being Normal'],
  ['/blog/reject-modernity-embrace-masculinity', 'Reject Modernity, Embrace Masculinity'],
  ['/blog/best-protein-powder-for-building-muscle', 'Best Protein Powder for Muscle Gain: An Evidence-Based Approach'],
  ['/blog/healthy-low-calorie-foods', 'The Golden Zone: Healthy Low Calorie Foods'],
  ['/blog/australian-health-star-rating', 'Australian Health Star Ratings: A Failed Experiment'],
  ['/blog/healthy-organic-post', 'A Healthy, Organic, Naturally Flavoured Post'],
  ['/blog/what-is-intermittent-fasting', 'What is Intermittent Fasting?'],
  ['/blog/calorie-calculator-how-to', 'How To Use The Calorie Calculator'],
] as const;
