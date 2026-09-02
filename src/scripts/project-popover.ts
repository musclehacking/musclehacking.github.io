/** Returns the DOM popover controlled by a trigger's `aria-controls` value. */
export function getControlledPopover(documentNode: Document, trigger: HTMLElement): HTMLElement | null {
  const panelId = trigger.getAttribute('aria-controls');
  return panelId ? documentNode.getElementById(panelId) : null;
}

/** Keeps DOM visibility and the trigger's expanded state in one shared path. */
export function setControlledPopover(documentNode: Document, trigger: HTMLElement, open: boolean): void {
  const panel = getControlledPopover(documentNode, trigger);
  if (!panel) return;

  trigger.setAttribute('aria-expanded', String(open));
  panel.hidden = !open;
  if (open) panel.dataset.opening = 'true';
  else delete panel.dataset.opening;
}
