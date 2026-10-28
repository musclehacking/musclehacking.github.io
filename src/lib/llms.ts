export interface LlmsLink {
  label: string;
  url: string;
  description?: string;
}

export interface LlmsSection {
  heading: string;
  links: readonly LlmsLink[];
}

export interface LlmsDocument {
  name: string;
  /** One sentence naming the product, who it serves, and what it does. */
  summary: string;
  /** One operating fact the summary has no room for. Omit when none exists. */
  details?: readonly string[];
  /** `Use {Product} when {audience} needs to {job}; {job}; or {job}.` */
  whenToUse: string;
  /** `{Product} is not {adjacent category}. It is {what it is}.` */
  whenNotToUse: string;
  /** Precondition, first action, canonical URL, and the friction facts asked next. */
  howToStart: string;
  /** Every entry must appear inline inside `howToStart`. */
  actionUrls: readonly string[];
  sections: readonly LlmsSection[];
}

/** Openers that describe the website instead of the product it markets. */
const SITE_SUBJECT_PATTERN =
  /\b(?:these|this|the)\s+(?:pages?|site|website|marketing site|resources?|links?|documents?|file)\b/i;

/** Promotional terms an agent cannot verify on a linked page. */
const PROMOTIONAL_TERMS = [
  'powerful',
  'seamless',
  'seamlessly',
  'revolutionary',
  'best-in-class',
  'cutting-edge',
  'game-changing',
  'world-class',
  'effortless',
  'effortlessly',
  'unlock',
  'supercharge',
  'unparalleled',
  'unrivalled',
  'state-of-the-art',
  'next-generation',
  'industry-leading',
  'market-leading',
] as const;

/** Minimum substance per operating line. `whenToUse` must hold a job list. */
const MINIMUM_LENGTHS = { whenToUse: 120, whenNotToUse: 60, howToStart: 80 } as const;

function required(value: string, field: string): string {
  const normalised = value.trim();
  if (!normalised) throw new Error(`${field} must not be empty.`);
  return normalised;
}

function requiredSingleLine(value: string, field: string): string {
  if (/[\r\n\u2028\u2029]/.test(value)) throw new Error(`${field} must be a single line.`);
  return required(value, field);
}

function optionalSingleLine(value: string | undefined, field: string): string | undefined {
  if (value === undefined) return undefined;
  if (/[\r\n\u2028\u2029]/.test(value)) throw new Error(`${field} must be a single line.`);
  return value.trim() || undefined;
}

function absoluteHttpUrl(value: string, field: string): string {
  const url = new URL(required(value, field));
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error(`${field} must use HTTP(S).`);
  return url.toString();
}

/** Reject a promotional adjective the site cannot evidence. */
function assertObjectiveRegister(value: string, field: string): void {
  const term = PROMOTIONAL_TERMS.find((candidate) =>
    new RegExp(`\\b${candidate.replaceAll('-', '[- ]')}\\b`, 'i').test(value),
  );
  if (term) {
    throw new Error(`${field} must state a verifiable fact, not the promotional term "${term}".`);
  }
}

/**
 * Enforce the agent-operating block: three lines whose subject is the product,
 * a job list in `whenToUse`, and every canonical action URL inline in `howToStart`.
 */
function validateOperatingBlock(document: LlmsDocument): void {
  const name = requiredSingleLine(document.name, 'name');
  const entries = [
    ['whenToUse', document.whenToUse],
    ['whenNotToUse', document.whenNotToUse],
    ['howToStart', document.howToStart],
  ] as const;

  for (const [field, raw] of entries) {
    const value = requiredSingleLine(raw, field);

    // The subject must be the product. `Use these pages to ...` indexes the site instead.
    if (SITE_SUBJECT_PATTERN.test(value)) {
      throw new Error(`${field} must describe ${name}, not the website or its pages.`);
    }
    if (value.length < MINIMUM_LENGTHS[field]) {
      throw new Error(`${field} must state specific jobs, limits, or actions in at least ${MINIMUM_LENGTHS[field]} characters.`);
    }
    // Strip URLs first so a hostname cannot stand in for naming the product.
    const prose = value.replace(/https?:\/\/\S+/g, ' ');
    if (!prose.toLowerCase().includes(name.toLowerCase())) {
      throw new Error(`${field} must name ${name} so the line stands alone when quoted.`);
    }
    assertObjectiveRegister(value, field);
  }

  // `whenToUse` carries the capability inventory, so require at least three job clauses.
  const jobClauses = requiredSingleLine(document.whenToUse, 'whenToUse')
    .split(/;|,\s/)
    .map((clause) => clause.trim())
    .filter(Boolean);
  if (jobClauses.length < 3) {
    throw new Error('whenToUse must enumerate at least three distinct jobs separated by semicolons.');
  }

  if (document.actionUrls.length === 0) {
    throw new Error('howToStart requires at least one canonical action URL.');
  }
  document.actionUrls.forEach((url, index) => {
    const resolved = absoluteHttpUrl(url, `actionUrls[${index}]`);
    // The URL belongs in the instruction that hands it over, not in a trailing list.
    if (!document.howToStart.includes(url.trim()) && !document.howToStart.includes(resolved)) {
      throw new Error(`howToStart must contain the canonical action URL ${resolved} inline.`);
    }
  });
}

export function validateLlmsDocument(document: LlmsDocument): void {
  requiredSingleLine(document.name, 'name');
  assertObjectiveRegister(requiredSingleLine(document.summary, 'summary'), 'summary');
  document.details?.forEach((detail, index) => {
    const value = requiredSingleLine(detail, `details[${index}]`);
    assertObjectiveRegister(value, `details[${index}]`);
    // `details` adds an operating fact; it must not restate the summary.
    if (value.toLowerCase() === document.summary.trim().toLowerCase()) {
      throw new Error(`details[${index}] must add a fact the summary does not already state.`);
    }
  });
  validateOperatingBlock(document);
  if (document.sections.length === 0) throw new Error('llms.txt requires at least one H2 file-list section.');

  const seen = new Set<string>();
  for (const [sectionIndex, section] of document.sections.entries()) {
    requiredSingleLine(section.heading, `sections[${sectionIndex}].heading`);
    if (section.links.length === 0) throw new Error('Every llms.txt H2 must contain URL file-list items.');
    for (const [linkIndex, link] of section.links.entries()) {
      const field = `sections[${sectionIndex}].links[${linkIndex}]`;
      const label = requiredSingleLine(link.label, `${field}.label`);
      const description = optionalSingleLine(link.description, `${field}.description`);
      // A description restating the label tells an agent nothing about the destination.
      if (description && description.toLowerCase().replace(/\.$/, '') === label.toLowerCase()) {
        throw new Error(`${field}.description must say what the page provides, not repeat the label.`);
      }
      const url = absoluteHttpUrl(link.url, `${field}.url`);
      if (seen.has(url)) throw new Error(`Duplicate llms.txt URL: ${url}`);
      seen.add(url);
    }
  }
}

function assertRenderedH2FileLists(markdown: string, expectedSectionCount: number): void {
  let sectionCount = 0;
  let fileCount = 0;

  for (const line of markdown.split('\n')) {
    if (line.startsWith('## ')) {
      if (sectionCount > 0 && fileCount === 0) {
        throw new Error('Every rendered llms.txt H2 must contain URL file-list items.');
      }
      sectionCount += 1;
      fileCount = 0;
      continue;
    }
    if (sectionCount === 0 || line === '') continue;
    if (!line.startsWith('- [')) {
      throw new Error('Rendered llms.txt H2 sections must contain only URL file-list items.');
    }
    fileCount += 1;
  }

  if (sectionCount !== expectedSectionCount || fileCount === 0) {
    throw new Error('Rendered llms.txt H2 sections must match the declared URL file lists.');
  }
}

export function renderLlmsTxt(document: LlmsDocument): string {
  validateLlmsDocument(document);
  const lines = [
    `# ${document.name.trim()}`,
    '',
    `> ${document.summary.trim()}`,
    '',
    ...(document.details ?? []).flatMap((detail) => [detail.trim(), '']),
    `**When to use:** ${document.whenToUse.trim()}`,
    '',
    `**When not to use:** ${document.whenNotToUse.trim()}`,
    '',
    `**How to get started:** ${document.howToStart.trim()}`,
  ];

  for (const section of document.sections) {
    lines.push('', `## ${section.heading.trim()}`, '');
    for (const link of section.links) {
      const description = link.description?.trim();
      lines.push(`- [${link.label.trim()}](${new URL(link.url).toString()})${description ? `: ${description}` : ''}`);
    }
  }
  const output = `${lines.join('\n')}\n`;
  assertRenderedH2FileLists(output, document.sections.length);
  return output;
}
