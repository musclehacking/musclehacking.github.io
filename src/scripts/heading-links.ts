import {
  copyTextToClipboard,
  createProjectTip,
  ensureProjectTipGradient,
  replayProjectTip,
  setProjectTipState,
  type ProjectTip,
} from './project-tip';

/*
 * Production scope (js/anchor.min.js):
 *   anchors.add('.post-body h2, #how-to-use, .post-body h3:not(#share-t,#comm-t), .post-body h4, .post-body h5')
 * The audited legacy page endings (bottom newsletter, Share, Comment, and
 * previous/next navigation) never carried a self-link, so every heading inside
 * the shared `[data-content-ending]` composition is excluded here as well.
 */
const headingSelector = [
  '.legacy-content h2',
  '.legacy-content h3',
  '.legacy-content h4',
  '.legacy-content h5',
  '[data-heading-links] h2',
  '[data-heading-links] h3',
  '[data-heading-links] h4',
  '[data-heading-links] h5',
].join(', ');

const excludedHeadingSelector = '#share-t, #comm-t, .supplement-filter-heading, [data-content-ending] *, .newsletter-signup *, #post-nav *';

const slugify = (value: string) =>
  value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const reserveUniqueId = (heading: HTMLHeadingElement, preferredId: string) => {
  let candidate = preferredId || 'section';
  let suffix = 1;

  while (document.getElementById(candidate) && document.getElementById(candidate) !== heading) {
    candidate = `${preferredId || 'section'}-${suffix}`;
    suffix += 1;
  }

  return candidate;
};

ensureProjectTipGradient();

document.querySelectorAll<HTMLHeadingElement>(headingSelector).forEach((heading) => {
  if (
    heading.matches(excludedHeadingSelector)
    || heading.closest('[data-heading-links="off"]')
    || heading.querySelector(':scope > .anchorjs-link')
  ) return;

  const explicitTarget = heading.dataset.headingLinkTarget;
  const id = explicitTarget || reserveUniqueId(heading, heading.id || slugify(heading.textContent ?? ''));
  if (!explicitTarget) heading.id = id;

  const link = document.createElement('a');
  link.className = 'anchorjs-link';
  link.href = `#${id}`;
  link.dataset.anchorjsIcon = '\uE9CB';
  link.setAttribute('aria-label', `Link to ${heading.textContent?.trim() || 'section'}`);

  const popoverId = `heading-popover-${id}`;
  const hover = createProjectTip({ id: popoverId, label: 'Click to Copy', role: 'tooltip', rootClass: 'heading-link-popover' });
  const feedback = createProjectTip({ id: `${popoverId}-feedback`, label: 'Link Copied', role: 'status', rootClass: 'heading-link-popover' });
  hover.content.classList.add('heading-link-popover-label');
  feedback.content.classList.add('heading-link-popover-label');
  link.setAttribute('aria-controls', popoverId);
  link.setAttribute('aria-describedby', popoverId);
  link.setAttribute('aria-expanded', 'false');

  /* Settled production geometry: box centred on the anchor, bottom edge flush
     with the anchor top, arrow tip pointing down at the anchor control. The
     root (never animated) carries a translate(-50%, -100%) so the centring
     stays exact when web fonts change the rendered tooltip width. */
  const position = (tooltip: ProjectTip) => {
    const linkBox = link.getBoundingClientRect();
    tooltip.root.style.transform = 'translate(-50%, -100%)';
    tooltip.root.style.left = `${window.scrollX + linkBox.left + linkBox.width / 2}px`;
    tooltip.root.style.top = `${window.scrollY + linkBox.top}px`;
  };

  let showTimer = 0;
  let hideTimer = 0;
  let feedbackTimer = 0;

  const showHover = () => {
    window.clearTimeout(hideTimer);
    window.clearTimeout(showTimer);
    /* Production anchor tooltip uses tippy `delay: 50`. */
    showTimer = window.setTimeout(() => {
      position(hover);
      setProjectTipState(hover, true);
      link.setAttribute('aria-expanded', 'true');
    }, 50);
  };

  const hideHover = (immediate = false) => {
    window.clearTimeout(showTimer);
    window.clearTimeout(hideTimer);
    const hide = () => {
      setProjectTipState(hover, false);
      link.setAttribute('aria-expanded', 'false');
    };
    if (immediate) hide();
    else hideTimer = window.setTimeout(hide, 50);
  };

  const hideFeedback = () => {
    window.clearTimeout(feedbackTimer);
    feedbackTimer = 0;
    setProjectTipState(feedback, false);
  };

  link.addEventListener('pointerenter', (event) => {
    if (event.pointerType !== 'touch') showHover();
  });
  /* Keep the tooltip centred over the glyph after its 0.25s hover travel. */
  link.addEventListener('transitionend', (event) => {
    if (event.propertyName !== 'margin-left') return;
    if (hover.box.dataset.state === 'visible') position(hover);
    if (feedback.box.dataset.state === 'visible') position(feedback);
  });
  link.addEventListener('pointerleave', () => hideHover());
  link.addEventListener('focus', showHover);
  link.addEventListener('blur', () => {
    hideHover();
    hideFeedback();
  });
  link.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    hideHover(true);
    hideFeedback();
  });

  link.addEventListener('click', async (event) => {
    event.preventDefault();
    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href
      ?? `${location.origin}${location.pathname}`;
    const targetUrl = `${canonical}#${id}`;
    let copied = true;
    try {
      await copyTextToClipboard(targetUrl);
    } catch {
      copied = false;
    }

    /* Production: the hover tippy hides on click while a second click-triggered
       tippy enters fresh with the same motion, holds, then dismisses itself. */
    hideHover(true);
    window.clearTimeout(feedbackTimer);
    feedback.content.textContent = copied ? 'Link Copied' : 'Copy Failed';
    position(feedback);
    replayProjectTip(feedback);
    feedbackTimer = window.setTimeout(() => {
      feedbackTimer = 0;
      setProjectTipState(feedback, false);
    }, copied ? 750 : 1_000);
  });

  document.body.appendChild(hover.root);
  document.body.appendChild(feedback.root);
  heading.insertBefore(link, heading.firstChild);
});

const initialHash = location.hash;
if (initialHash) {
  let initialTarget: Element | null = null;
  try {
    initialTarget = document.querySelector(initialHash);
  } catch {
    initialTarget = null;
  }
  if (initialTarget) {
    window.setTimeout(() => initialTarget?.scrollIntoView({ block: 'start' }), 0);
  }
}
