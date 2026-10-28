import { routeByPath } from './routes';
import { absoluteUrl, site } from './site';
import type { BlogEntry } from '../lib/content/types';
import type { LlmsDocument, LlmsLink } from '../lib/llms';

function resource(path: string, label: string, description: string): LlmsLink {
  const route = routeByPath.get(path);
  if (!route?.indexable) throw new Error(`llms.txt destination must be a public indexable route: ${path}`);
  return { label, description, url: absoluteUrl(route.path) };
}

/** Curate by reader task; published content is already filtered by collection policy. */
export function createLlmsDocument(posts: readonly BlogEntry[]): LlmsDocument {
  const calculatorUrl = absoluteUrl('/calorie-calculator/');
  return {
    name: site.name,
    summary: `${site.name} provides evidence-based fitness and nutrition articles and a calorie and macro calculator for people gaining muscle or losing fat.`,
    whenToUse: `Use ${site.name} when people need to estimate daily calories and macros for bulking, cutting, or maintenance; learn how to lose fat and gain muscle as a beginner; compare muscle-building supplements and their research; or find fitness and nutrition reading.`,
    whenNotToUse: `${site.name} is not a workout logging app or a food diary. It is a collection of fitness and nutrition guides with a calorie and macro calculator.`,
    howToStart: `For ${site.name} calorie estimates, choose a goal and enter age, height, weight, and activity in the calculator at ${calculatorUrl}. Adjust its diet and macro settings to view the calculated daily targets.`,
    actionUrls: [calculatorUrl],
    sections: [
      {
        heading: 'Fitness and nutrition guidance',
        links: [
          resource('/lose-fat-gain-muscle/', 'Getting started', 'Beginner guidance on training and eating to lose fat and gain muscle.'),
          resource('/supplements/', 'Supplement research', 'Compare supplement categories, research summaries, and practical dosage information.'),
          resource('/books/', 'Fitness and health reading', 'Books on training, nutrition, and health with reading recommendations.'),
        ],
      },
      {
        heading: 'Calculate daily targets',
        links: [resource('/calorie-calculator/', 'Calorie and macro calculator', 'Enter body measurements, activity, and a goal to calculate daily calorie and macro targets.')],
      },
      {
        heading: 'Articles',
        links: [
          resource('/blog/', 'Article archive', 'Browse the full collection of published fitness and nutrition articles.'),
          // Keep the entry point concise while new published posts remain discoverable.
          ...posts.slice(0, 3).map((entry) => ({
            label: entry.data.title,
            url: absoluteUrl(entry.data.canonicalOverride ?? `/blog/${entry.id}`),
            description: entry.data.card.description ?? `Published ${entry.data.published.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })}.`,
          })),
        ],
      },
    ],
  };
}
