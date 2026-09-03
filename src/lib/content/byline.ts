const formatMonth = (date: Date) => new Intl.DateTimeFormat('en-US', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
}).format(date);

export function deriveByline(published: Date, updated: Date | undefined, authorDisplayName: string): string {
  const posted = `Posted ${formatMonth(published)}`;
  const timing = updated ? `Updated ${formatMonth(updated)}, ${posted}` : posted;
  return `By ${authorDisplayName} — ${timing}`;
}
