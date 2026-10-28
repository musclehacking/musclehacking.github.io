/** One processed entry owns project behaviour. Each module checks its own markup. */
import './navigation';
import './newsletter-challenge';
import './heading-links';
import './social-share';
import './back-to-top';
import './calculator-newsletter-prompts';
import { enhanceSupplementExplorer } from '../features/supplements/enhance';

if (document.querySelector('[data-supplement-sections]')) enhanceSupplementExplorer();
