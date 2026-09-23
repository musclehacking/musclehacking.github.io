export const pinnedSections = [
  {
    href: '/supplements/',
    published: new Date('2023-08-01T00:00:00.000Z'),
    title: 'The Best Muscle Building Supplement Stack (Based on Research)',
    description: 'Summary of 10+ years of supplement research.',
    image: '/img/muscle-building-supplement-stack.png',
    imageAlt: 'Muscle Building Supplement Stack',
    sidebarTitle: 'Muscle Building Supplement Stack (Based on Research)',
    ratio: '5 / 3',
  },
  {
    // Replaces the retired `/blog/calorie-calculator-how-to` article card, which now 301s here.
    href: '/calorie-calculator/#how-to-use',
    published: new Date('2018-03-01T00:00:00.000Z'),
    title: 'How To Use The Calorie Calculator',
    description: 'How to use the Calorie and Macro Calculator.',
    image: '/img/calorie-calculator.jpg',
    imageAlt: 'A Calorie Calculator',
    sidebarTitle: 'How To Use The Calorie Calculator',
    ratio: '5 / 3',
  },
] as const;
