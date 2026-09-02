const rail = document.querySelector<HTMLElement>('[data-social-share-rail]');

if (rail) {
  const mobileBar = window.matchMedia('(max-width: 768px)');

  /* Production tippy semantics: mouseenter/focus shows, leave/blur hides,
     hideOnClick hides, and hidden state animates 20px from the far side. */
  const setState = (box: HTMLElement | null, visible: boolean) => {
    if (!box) return;
    box.dataset.placement = mobileBar.matches ? 'top' : 'right';
    box.dataset.state = visible ? 'visible' : 'hidden';
  };

  rail.querySelectorAll<HTMLAnchorElement>('a').forEach((link) => {
    const circle = link.parentElement;
    const hoverTip = circle?.querySelector<HTMLElement>('[data-share-tooltip]') ?? null;
    if (!hoverTip) return;

    link.addEventListener('pointerenter', (event) => {
      if (event.pointerType !== 'touch') setState(hoverTip, true);
    });
    link.addEventListener('pointerleave', () => setState(hoverTip, false));
    link.addEventListener('focus', () => setState(hoverTip, true));
    link.addEventListener('blur', () => setState(hoverTip, false));
    link.addEventListener('click', () => setState(hoverTip, false));
  });

  const copyText = async (value: string) => {
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(value);
        return true;
      } catch {
        // Continue to the retained-browser fallback below.
      }
    }

    const field = document.createElement('textarea');
    field.value = value;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.opacity = '0';
    try {
      document.body.appendChild(field);
      field.select();
      return document.execCommand('copy');
    } catch {
      return false;
    } finally {
      field.remove();
    }
  };

  const updateVisibility = () => {
    const visible = window.scrollY > 660;
    rail.dataset.visible = String(visible);
    rail.setAttribute('aria-hidden', String(!visible));
    rail.toggleAttribute('inert', !visible);
  };

  updateVisibility();
  window.addEventListener('scroll', updateVisibility, { passive: true });

  let feedbackTimer = 0;
  rail.querySelector<HTMLAnchorElement>('[data-copy-page-link]')?.addEventListener('click', async (event) => {
    event.preventDefault();
    const link = event.currentTarget as HTMLAnchorElement;
    const circle = link.parentElement;
    const feedbackBox = circle?.querySelector<HTMLElement>('[data-share-feedback]') ?? null;
    const feedbackLabel = feedbackBox?.querySelector<HTMLElement>('[data-copy-page-feedback]') ?? null;
    const copied = await copyText(link.href);
    link.dataset.copied = String(copied);
    if (feedbackBox) {
      /* Production: the click-triggered "Link Copied!" tippy enters fresh with
         the same shift-toward-extreme motion, holds one second, then hides. */
      window.clearTimeout(feedbackTimer);
      if (feedbackLabel) feedbackLabel.textContent = copied ? 'Link Copied!' : 'Copy Failed';
      feedbackBox.dataset.state = 'hidden';
      void feedbackBox.offsetWidth;
      setState(feedbackBox, true);
      feedbackTimer = window.setTimeout(() => {
        setState(feedbackBox, false);
        if (feedbackLabel) feedbackLabel.textContent = 'Link Copied!';
        delete link.dataset.copied;
      }, 1_000);
    }
    if (!copied) location.assign(link.href);
  });
}
