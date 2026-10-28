import { describe, expect, it } from 'vitest';
import { createLlmsDocument } from '../../src/config/llms';
import { renderLlmsTxt } from '../../src/lib/llms';

describe('curated llms.txt', () => {
  it('provides operating instructions and canonical task destinations', () => {
    const output = renderLlmsTxt(createLlmsDocument([]));
    expect(output).toMatch(/^# Muscle Hacking\n\n> /);
    expect(output).toContain('**When to use:**');
    expect(output).toContain('**When not to use:**');
    expect(output).toContain('**How to get started:**');
    expect(output).toContain('https://www.musclehacking.com/calorie-calculator/');
    expect(output).toContain('https://www.musclehacking.com/lose-fat-gain-muscle/');
    const urls = [...output.matchAll(/^- \[.+?\]\((.+?)\)/gm)].map((match) => match[1]);
    expect(new Set(urls).size).toBe(urls.length);
    expect(output).not.toMatch(/\/join\/|\/one-last-step\/|localhost|\.md\)/);
  });

  // A malformed document fails at build time, before a browser can observe it.
  it('rejects duplicate links and incomplete operating instructions', () => {
    const document = createLlmsDocument([]);
    const duplicate = document.sections[0]!.links[0]!;
    expect(() => renderLlmsTxt({ ...document, sections: [{ heading: 'Guides', links: [duplicate, duplicate] }] })).toThrow('Duplicate');
    expect(() => renderLlmsTxt({ ...document, howToStart: 'Read the site.' })).toThrow();
  });
});
