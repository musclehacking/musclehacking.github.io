const floatingPrompt = document.querySelector<HTMLElement>('[data-calculator-newsletter-floating]');
const exitPrompt = document.querySelector<HTMLDialogElement>('[data-calculator-newsletter-exit]');
const exitPanel = document.querySelector<HTMLElement>('[data-calculator-newsletter-exit-panel]');

/* Legacy js/e-on-delay.min.js: `setTimeout(show, 3E4)` after DOMContentLoaded. */
const EXIT_PROMPT_DELAY_MS = 30_000;
/* Legacy js/eml-flt-right.js: `660 < pageYOffset` reveals the floating panel. */
const FLOATING_PROMPT_SCROLL_THRESHOLD = 660;

if (floatingPrompt && exitPrompt && exitPanel) {
  const controller = new AbortController();
  const { signal } = controller;
  let floatingDismissed = false;
  let exitInvoker: Element | null = null;

  const updateFloatingPrompt = () => {
    const hidden =
      floatingDismissed || window.innerWidth < 1440 || window.scrollY <= FLOATING_PROMPT_SCROLL_THRESHOLD;
    if (floatingPrompt.hidden !== hidden) floatingPrompt.hidden = hidden;
  };

  floatingPrompt.querySelector('[data-newsletter-prompt-close]')?.addEventListener('click', () => {
    floatingDismissed = true;
    floatingPrompt.hidden = true;
  }, { signal });

  const closeExitPrompt = () => {
    if (!exitPrompt.open) return;
    /* Legacy: the overlay leaves with `translateY(100%) scale(0)` over 0.3s. */
    delete exitPrompt.dataset.open;
    window.setTimeout(() => exitPrompt.close(), 300);
  };

  const openExitPrompt = () => {
    if (exitPrompt.open) return;
    // Only classic scrollbars occupy layout space. A permanent stable gutter
    // would narrow the unchanged page on browsers that use overlay scrollbars.
    const hasScrollbarGutter = window.innerWidth > document.documentElement.clientWidth;
    document.documentElement.style.setProperty('--newsletter-scrollbar-gutter', hasScrollbarGutter ? 'stable' : 'auto');
    exitInvoker = document.activeElement;
    exitPrompt.showModal();
    exitPrompt.focus({ preventScroll: true });
    /* Reflow before the visible state so the entrance transition plays. */
    void exitPrompt.offsetWidth;
    exitPrompt.dataset.open = 'true';
  };

  exitPanel.querySelector('[data-newsletter-prompt-close]')?.addEventListener('click', closeExitPrompt, { signal });
  exitPrompt.addEventListener('click', (event) => {
    /* Legacy: only a click on the overlay itself (outside `.n-lett`) closes it. */
    if (event.target === exitPrompt) {
      event.preventDefault();
      closeExitPrompt();
    }
  }, { signal });
  exitPrompt.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeExitPrompt();
  }, { signal });

  exitPrompt.addEventListener('close', () => {
    delete exitPrompt.dataset.open;
    document.documentElement.style.removeProperty('--newsletter-scrollbar-gutter');
    if (exitInvoker instanceof HTMLElement) exitInvoker.focus({ preventScroll: true });
  }, { signal });

  window.setTimeout(openExitPrompt, EXIT_PROMPT_DELAY_MS);

  window.addEventListener('scroll', updateFloatingPrompt, { passive: true, signal });
  window.addEventListener('resize', updateFloatingPrompt, { passive: true, signal });
  window.addEventListener('pagehide', () => controller.abort(), { once: true });
  updateFloatingPrompt();
}

export {};
