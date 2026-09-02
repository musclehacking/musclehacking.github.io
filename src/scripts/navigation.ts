const toggle = document.querySelector<HTMLButtonElement>('.nav-toggle');
const links = document.querySelector<HTMLElement>('#primary-links');

toggle?.addEventListener('click', () => {
  const nextState = toggle.getAttribute('aria-expanded') !== 'true';
  toggle.setAttribute('aria-expanded', String(nextState));
  links?.setAttribute('data-open', String(nextState));
});
