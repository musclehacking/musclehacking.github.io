const backToTop = document.querySelector<HTMLAnchorElement>('.back-to-top');

if (backToTop) {
  let shown = false;
  const updateBackToTop = () => {
    // The legacy control appears after 1000px. Write only when that state changes.
    const next = window.scrollY > 1000;
    if (next === shown) return;
    shown = next;
    backToTop.classList.toggle('show', shown);
  };
  window.addEventListener('scroll', updateBackToTop, { passive: true });
  updateBackToTop();
}

export {};
