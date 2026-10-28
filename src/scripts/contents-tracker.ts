/**
 * Contents tracker: marks which section the reader is in on a table of contents.
 *
 * Markup contract. Every link works as a native anchor without this module.
 * - Root holding native `a[href="#heading-id"]` links in document order.
 * - Optional `[data-contents-list]`, the element whose visibility decides whether to work
 *   (default: the first `ol` or `ul` in the root).
 * - Optional `[data-contents-scroller]`, the list's own scroll box, kept on the current entry.
 * - Optional `data-contents-progress` on the root, which publishes `--contents-progress`
 *   (0 to 1) on the current link for a per-section progress rule.
 * - Optional `[data-contents-end]`, whose bottom ends the last section
 *   (default: the last heading's parent).
 *
 * Output: `aria-current="location"` on the current link and `data-state` set to `done`,
 * `active` or `upcoming` on every link. Style both in CSS, and move any progress
 * fill with `transform`, never `height` or `width`.
 *
 * The current section is the last heading whose top has reached its native anchor
 * landing line (the approved legacy Bootstrap offset of 10px). Before the first
 * target nothing is current; at the document bottom the last target is current.
 *
 * Cost rules:
 * - An ordinary frame reads only the current heading and the next boundary. A jump
 *   walks from the previous answer, so it reads only the headings it passes.
 * - The fixed legacy offset needs no computed-style reads.
 * - Nothing is measured while the list is hidden, such as a closed phone fold or a panel
 *   scrolled off screen. The tracker catches up when the list is shown again.
 * - One exception: after a followed contents link, a hash change or arrival at an anchor,
 *   it measures every frame until the scroll has rested for ten frames, even while hidden,
 *   so the current entry is right when a screen-reader user reaches the list directly.
 * - Every read happens before any write, and only changed values are written.
 *
 * Returns a stop function for sites that swap pages without a full load.
 */
export function startContentsTracker(root: HTMLElement): () => void {
  const sections = [...root.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')].flatMap((link) => {
    const target = document.getElementById(decodeURIComponent(link.hash.slice(1)));
    return target ? [{ link, target }] : [];
  });
  if (!sections.length) return () => {};

  const list = root.querySelector<HTMLElement>('[data-contents-list]') ?? root.querySelector<HTMLElement>('ol, ul') ?? root;
  const scroller = root.querySelector<HTMLElement>('[data-contents-scroller]');
  const end = document.querySelector<HTMLElement>('[data-contents-end]') ?? sections[sections.length - 1]!.target.parentElement!;
  const progress = root.hasAttribute('data-contents-progress');

  // Preserve the approved Bootstrap ScrollSpy landing line.
  const landingLine = 10;
  let stopped = false;
  let current = -1;
  let shown = -2;
  let painted = '';
  let visible = false;
  let stale = true;
  let frame = 0;
  // Frames of forced measurement left after a jump; each frame that moves restarts the count.
  const REST_FRAMES = 10;
  let following = 0;
  let lastY = -1;

  const top = (index: number) => sections[index]!.target.getBoundingClientRect().top;
  const reached = (_index: number, position: number) => position <= landingLine;

  const update = () => {
    frame = 0;
    // Hidden contents have nothing to show. Reconciliation runs when they reappear,
    // unless a jump is being followed.
    if (!visible && !following) return;

    // Read live positions before writing. The legacy offset requires no style reads.
    const y = following ? scrollY : 0;
    const scrollTop = scrollY;
    const maximumScroll = document.documentElement.scrollHeight - innerHeight;
    let index = Math.max(0, current);
    let here = top(index);
    while (index > 0 && !reached(index, here)) here = top(--index);
    if (index === 0 && !reached(index, here)) index = -1;
    let next = index + 1 < sections.length ? top(index + 1) : Infinity;
    while (index + 1 < sections.length && reached(index + 1, next)) {
      here = next;
      index += 1;
      next = index + 1 < sections.length ? top(index + 1) : Infinity;
    }
    if (scrollTop >= maximumScroll - 1) index = sections.length - 1;
    const changed = stale || index !== shown;

    let value = '';
    if (progress && index >= 0) {
      const bottom = index + 1 < sections.length ? next : end.getBoundingClientRect().bottom;
      value = Math.min(1, Math.max(0, (landingLine - here) / Math.max(1, bottom - here))).toFixed(3);
    }

    let scroll = -1;
    if (changed && scroller && index >= 0) {
      const box = scroller.getBoundingClientRect();
      const entry = sections[index]!.link.getBoundingClientRect();
      const maximum = scroller.scrollHeight - scroller.clientHeight;
      if (maximum > 0) {
        let wanted = scroller.scrollTop;
        if (entry.bottom > box.bottom) wanted += entry.bottom - box.bottom + entry.height;
        else if (entry.top < box.top) wanted -= box.top - entry.top + entry.height;
        wanted = Math.max(0, Math.min(maximum, Math.round(wanted)));
        if (wanted !== Math.round(scroller.scrollTop)) scroll = wanted;
      }
    }

    // Writes, after every read.
    if (changed) {
      sections.forEach(({ link }, position) => {
        const state = position < index ? 'done' : position === index ? 'active' : 'upcoming';
        if (link.dataset.state !== state) link.dataset.state = state;
        if (link.classList.contains('active') !== (position === index)) link.classList.toggle('active', position === index);
      });
      if (shown >= 0 && shown !== index) {
        sections[shown]!.link.removeAttribute('aria-current');
        sections[shown]!.link.style.removeProperty('--contents-progress');
      }
      if (index >= 0) sections[index]!.link.setAttribute('aria-current', 'location');
      painted = '';
    }
    if (progress && index >= 0 && value !== painted) {
      sections[index]!.link.style.setProperty('--contents-progress', value);
      painted = value;
    }
    if (scroll >= 0 && scroller) scroller.scrollTop = scroll;

    current = index;
    shown = index;
    stale = false;
    if (following) {
      following = y === lastY ? following - 1 : REST_FRAMES;
      lastY = y;
      if (following) frame = requestAnimationFrame(update);
    }
  };

  const schedule = () => {
    if (!stopped && !frame) frame = requestAnimationFrame(update);
  };
  // Layout moved without a scroll, or style values might differ: refresh, then update.
  const reconcile = () => {
    stale = true;
    schedule();
  };

  // Follow a jump to its end, so the mark is right before the reader returns to the list.
  const follow = () => {
    following = REST_FRAMES;
    lastY = -1;
    schedule();
  };
  // A link whose hash is already in the address bar scrolls without a hash change.
  const followLink = (event: Event) => {
    if ((event.target as Element | null)?.closest?.('a[href^="#"]')) follow();
  };

  const visibility = new IntersectionObserver((entries) => {
    visible = entries[entries.length - 1]!.isIntersecting;
    if (visible) reconcile();
  });
  visibility.observe(list);
  // The body resizes when late images, fonts, inserted content or a growing header move
  // the article. Headings are always read live, so this only needs to trigger an update.
  const resizes = new ResizeObserver(reconcile);
  resizes.observe(document.body);
  resizes.observe(root);

  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', reconcile);
  addEventListener('pageshow', reconcile);
  addEventListener('hashchange', follow);
  root.addEventListener('click', followLink);
  document.fonts.addEventListener('loadingdone', reconcile);
  void document.fonts.ready.then(reconcile);
  if (location.hash) follow();

  return () => {
    stopped = true;
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    visibility.disconnect();
    resizes.disconnect();
    removeEventListener('scroll', schedule);
    removeEventListener('resize', reconcile);
    removeEventListener('pageshow', reconcile);
    removeEventListener('hashchange', follow);
    root.removeEventListener('click', followLink);
    document.fonts.removeEventListener('loadingdone', reconcile);
  };
}
