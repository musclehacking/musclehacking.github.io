import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import Figure from '../../src/components/content/Figure.astro';
import YouTube from '../../src/components/content/YouTube.astro';

describe('content media components', () => {
  it('renders the legacy ratio-box figure markup', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Figure, {
      props: { src: '/img/majin-buu-eating.gif', alt: 'Eating cake', width: 500, height: 280, ratio: 'new2' },
      slots: { default: 'Caption' },
    });
    const compact = html.replace(/ data-astro-cid-[\w-]+/g, '').replace(/\s+/g, ' ');
    expect(compact).toContain('<picture class="intrinsic intrinsic--new2"><img class="intrinsic-item" src="/img/majin-buu-eating.gif" alt="Eating cake" width="500" height="280" loading="lazy" decoding="async"></picture>');
    expect(compact).toContain('<p class="figurecap">Caption</p>');
  });

  it('rejects an id that could change the YouTube host', async () => {
    const container = await AstroContainer.create();
    await expect(container.renderToString(YouTube, {
      props: { id: 'https://youtube.com/watch?v=unsafe', title: 'Unsafe' },
    })).rejects.toThrow('must not contain a host or path');
  });
});
