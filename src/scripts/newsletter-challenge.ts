/**
 * Runs the invisible Cloudflare Turnstile challenge when a newsletter form is submitted.
 *
 * Like the legacy reCAPTCHA v3 flow, nothing loads until the reader submits: the first
 * submit is held, Turnstile's script is fetched once, an invisible widget writes its
 * token into the form's `cf-turnstile-response` field, and the form is then submitted
 * natively so `/api/subscribe` can answer with its normal 303 redirect.
 */

interface TurnstileRenderOptions {
  sitekey: string;
  action: string;
  'response-field-name': string;
  callback: (token: string) => void;
  'error-callback': () => boolean;
  'expired-callback': () => void;
}

interface Turnstile {
  render: (container: HTMLElement, options: TurnstileRenderOptions) => string | undefined;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}

const SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
const FAILURE_MESSAGE = 'Submission failed. Please try again.';

let loader: Promise<Turnstile> | undefined;

/** Loads Turnstile once per page; a failed load clears the cache so a retry can try again. */
function loadTurnstile(): Promise<Turnstile> {
  loader ??= new Promise<Turnstile>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT_URL;
    script.async = true;
    script.addEventListener('load', () => (window.turnstile ? resolve(window.turnstile) : reject(new Error('Turnstile unavailable'))));
    script.addEventListener('error', () => reject(new Error('Turnstile failed to load')));
    document.head.appendChild(script);
  }).catch((error: unknown) => {
    loader = undefined;
    throw error;
  });
  return loader;
}

for (const form of document.querySelectorAll<HTMLFormElement>('form.newsletter-form[data-turnstile-sitekey]')) {
  const container = form.querySelector<HTMLElement>('[data-turnstile]');
  const sitekey = form.dataset.turnstileSitekey;
  const action = form.dataset.turnstileAction;
  if (!container || !sitekey || !action) continue;

  let widgetId: string | undefined;
  // idle -> pending (challenge running) -> passed (token present, next submit goes through).
  let state: 'idle' | 'pending' | 'passed' = 'idle';

  const reset = () => {
    if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
    widgetId = undefined;
    state = 'idle';
    form.removeAttribute('aria-busy');
  };

  const fail = () => {
    reset();
    window.alert(FAILURE_MESSAGE);
  };

  form.addEventListener('submit', (event) => {
    if (state === 'passed') return;
    event.preventDefault();
    if (state === 'pending') return;

    state = 'pending';
    form.setAttribute('aria-busy', 'true');
    const submitter = event.submitter instanceof HTMLElement ? event.submitter : undefined;

    loadTurnstile().then((turnstile) => {
      widgetId = turnstile.render(container, {
        sitekey,
        action,
        'response-field-name': 'cf-turnstile-response',
        callback: () => {
          state = 'passed';
          form.requestSubmit(submitter as HTMLButtonElement | undefined);
        },
        'error-callback': () => {
          fail();
          // Returning true tells Turnstile the error was handled, so it does not log or retry.
          return true;
        },
        // Tokens last 300 seconds and are single-use; start again on the next submit.
        'expired-callback': reset,
      });
    }).catch(fail);
  });

  // A page restored from the back/forward cache holds a spent token; discard it.
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) reset();
  });
}

export {};
