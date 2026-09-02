/**
 * Project tooltip primitive.
 *
 * Reproduces the retained production tippy.js 6.3.7 structure (root, box,
 * content, and SVG arrow) so the heading self-links, calculator copy control,
 * and share rail all share one look, one `shift-toward-extreme` motion, and one
 * theme palette. The CSS owner is `src/styles/global.css` (`.project-tip-*`).
 */

export type ProjectTipPlacement = 'top' | 'bottom' | 'left' | 'right';
export type ProjectTipTheme = 'muscle' | 'tw' | 'fa' | 'lkn' | 'em' | 'link';

export interface ProjectTip {
  root: HTMLElement;
  box: HTMLElement;
  content: HTMLElement;
}

export interface ProjectTipOptions {
  id?: string;
  label: string;
  theme?: ProjectTipTheme;
  placement?: ProjectTipPlacement;
  role?: string;
  /** Extra class names for the root (positioning variants). */
  rootClass?: string;
}

/* Production anchor.js tippy arrow: a 16x6 SVG with a shadow path and a fill path. */
export const PROJECT_TIP_ARROW_SHADOW_PATH =
  'M0 6s1.796-.013 4.67-3.615C5.851.9 6.93.006 8 0c1.07-.006 2.148.887 3.343 2.385C14.233 6.005 16 6 16 6H0z';
export const PROJECT_TIP_ARROW_FILL_PATH = 'm0 7s2 0 5-4c1-1 2-2 3-2 1 0 2 1 3 2 3 4 5 4 5 4h-16z';

const SVG_NS = 'http://www.w3.org/2000/svg';

/** Builds the arrow container (`.project-tip-arrow`) with the two production paths. */
export function createProjectTipArrow(documentNode: Document = document): HTMLElement {
  const arrow = documentNode.createElement('span');
  arrow.className = 'project-tip-arrow project-popover-arrow';
  arrow.setAttribute('aria-hidden', 'true');
  const svg = documentNode.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('width', '16');
  svg.setAttribute('height', '6');
  const shadow = documentNode.createElementNS(SVG_NS, 'path');
  shadow.classList.add('svg-arrow');
  shadow.setAttribute('d', PROJECT_TIP_ARROW_SHADOW_PATH);
  const fill = documentNode.createElementNS(SVG_NS, 'path');
  fill.classList.add('svg-content');
  fill.setAttribute('d', PROJECT_TIP_ARROW_FILL_PATH);
  svg.appendChild(shadow);
  svg.appendChild(fill);
  arrow.appendChild(svg);
  return arrow;
}

/** One production-equivalent tooltip: positioned root plus animated themed box. */
export function createProjectTip(options: ProjectTipOptions, documentNode: Document = document): ProjectTip {
  const { id, label, theme = 'muscle', placement = 'top', role = 'tooltip', rootClass = '' } = options;

  const root = documentNode.createElement('span');
  if (id) root.id = id;
  root.className = `project-tip-root ${rootClass}`.trim();

  const box = documentNode.createElement('span');
  box.className = 'project-tip-box';
  box.dataset.theme = theme;
  box.dataset.placement = placement;
  box.dataset.state = 'hidden';
  box.setAttribute('role', role);

  const content = documentNode.createElement('span');
  content.className = 'project-tip-content';
  content.textContent = label;

  box.appendChild(content);
  box.appendChild(createProjectTipArrow(documentNode));
  root.appendChild(box);
  return { root, box, content };
}

/** Shows or hides a tooltip box using the production `data-state` transition hook. */
export function setProjectTipState(tip: ProjectTip, visible: boolean): void {
  tip.box.dataset.state = visible ? 'visible' : 'hidden';
}

/**
 * Re-enters a tooltip "fresh" like a click-triggered tippy instance: the box is
 * reset to hidden, reflowed, then shown so the entrance motion always replays.
 */
export function replayProjectTip(tip: ProjectTip): void {
  tip.box.dataset.state = 'hidden';
  void tip.box.offsetWidth;
  tip.box.dataset.state = 'visible';
}

/**
 * The legacy site body carries this gradient for the muscle-theme tooltip
 * arrow fill (`fill: url(#b-gradient)` in css/pretty-tippy.css).
 */
export function ensureProjectTipGradient(documentNode: Document = document): void {
  if (documentNode.getElementById('b-gradient')) return;
  const holder = documentNode.createElementNS(SVG_NS, 'svg');
  holder.setAttribute('aria-hidden', 'true');
  holder.setAttribute('focusable', 'false');
  holder.setAttribute('style', 'width:0;height:0;position:absolute;');
  const gradient = documentNode.createElementNS(SVG_NS, 'linearGradient');
  gradient.id = 'b-gradient';
  gradient.setAttribute('x2', '1');
  gradient.setAttribute('y2', '1');
  const stopA = documentNode.createElementNS(SVG_NS, 'stop');
  stopA.setAttribute('offset', '0%');
  stopA.setAttribute('stop-color', '#004e92');
  const stopB = documentNode.createElementNS(SVG_NS, 'stop');
  stopB.setAttribute('offset', '100%');
  stopB.setAttribute('stop-color', '#000428');
  gradient.appendChild(stopA);
  gradient.appendChild(stopB);
  holder.appendChild(gradient);
  documentNode.body.appendChild(holder);
}

/** Copies text with the Clipboard API, falling back to the retained execCommand path. */
export async function copyTextToClipboard(value: string, documentNode: Document = document): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const field = documentNode.createElement('textarea');
  field.value = value;
  field.setAttribute('readonly', '');
  field.style.position = 'fixed';
  field.style.opacity = '0';
  documentNode.body.appendChild(field);
  field.select();
  const copied = documentNode.execCommand('copy');
  field.remove();
  if (!copied) throw new Error('Clipboard copy failed.');
}
