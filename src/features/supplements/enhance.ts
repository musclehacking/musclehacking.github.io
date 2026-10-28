import { startContentsTracker } from '../../scripts/contents-tracker';
import { NOTE_ICON_PATH, IMPORTANT_ICON_PATH } from '../../lib/icons';
import {
  getSupplementFilter,
  selectSupplementHeadings,
  selectSupplements,
} from "./selector";
import { getControlledPopover, setControlledPopover } from '../../scripts/project-popover';

type ExplorerRoot = Document | HTMLElement;

const FILTER_SELECTOR = "[data-supplement-filter]";
const SECTION_SELECTOR = "[data-supplement-id]";
const EVIDENCE_SELECTOR = "[data-supplement-evidence]";
const POPOVER_TRIGGER_SELECTOR = "[data-supplement-popover]";
const INFORMATION_LINK_SELECTOR = "[data-supplement-information-link]";

/**
 * Enhances fully rendered supplement HTML. If this module does not run, all
 * supplement sections and native links remain visible and usable.
 */
export function enhanceSupplementExplorer(root: ExplorerRoot = document): () => void {
  const eventRoot = root instanceof Document ? root.documentElement : root;
  const documentNode = eventRoot.ownerDocument;
  const openedByFocus = new WeakSet<HTMLButtonElement>();
  let touchActivationTrigger: HTMLButtonElement | null = null;
  let stopContentsTracker: (() => void) | undefined;
  const restartContentsTracker = () => {
    stopContentsTracker?.();
    const list = root.querySelector<HTMLElement>('[data-supplement-toc]');
    if (list) stopContentsTracker = startContentsTracker(list);
  };

  const applyFilter = (filterId: string): void => {
    closeAllPopovers(root, documentNode);

    if (filterId === "information") {
      showInformationOnly(root);
      updateActiveFilter(root, filterId);
      updateCategoryNote(root, filterId);
      updateCategoryTop(root, "supplement-information");
      restartContentsTracker();
      return;
    }

    const selected = selectSupplements(filterId);
    const selectedById = new Map(selected.map((record) => [record.id, record]));
    const sectionParent = root.querySelector<HTMLElement>("[data-supplement-sections]");

    root.querySelectorAll<HTMLElement>(SECTION_SELECTOR).forEach((section) => {
      const record = selectedById.get(section.dataset.supplementId ?? "");
      section.hidden = !record;

      const evidenceTag = section.querySelector<HTMLElement>(EVIDENCE_SELECTOR);
      if (evidenceTag) {
        const selectedEvidence = record?.selectedEvidence;
        evidenceTag.textContent = selectedEvidence ?? "";
        evidenceTag.dataset.evidenceLevel = selectedEvidence ?? "";
        evidenceTag.hidden = !selectedEvidence;
      }
    });

    if (sectionParent) {
      for (const record of selected) {
        const section = sectionParent.querySelector<HTMLElement>(
          `[data-supplement-id="${record.id}"]`,
        );
        if (section) sectionParent.appendChild(section);
      }
    }

    root.querySelectorAll<HTMLElement>("[data-supplement-support]").forEach((section) => {
      section.hidden = false;
    });

    updateActiveFilter(root, filterId);
    updateCategoryNote(root, filterId);
    updateCategoryTop(root, selected[0]?.id);
    renderTableOfContents(root, filterId);
    restartContentsTracker();
  };

  const handleClick = (event: Event): void => {
    if (!(event.target instanceof Element)) return;

    if (event instanceof PointerEvent && event.pointerType === "touch" && touchActivationTrigger) {
      const trigger = touchActivationTrigger;
      touchActivationTrigger = null;
      if (eventRoot.contains(trigger)) setPopoverOpen(documentNode, trigger, true);
      return;
    }
    touchActivationTrigger = null;

    const filterButton = event.target.closest<HTMLElement>(FILTER_SELECTOR);
    if (filterButton && eventRoot.contains(filterButton)) {
      applyFilter(filterButton.dataset.supplementFilter ?? "");
      return;
    }

    const informationLink = event.target.closest<HTMLAnchorElement>(INFORMATION_LINK_SELECTOR);
    if (informationLink && eventRoot.contains(informationLink)) {
      applyFilter("information");
      return;
    }

    const popoverTrigger = event.target.closest<HTMLButtonElement>(POPOVER_TRIGGER_SELECTOR);
    if (popoverTrigger && eventRoot.contains(popoverTrigger)) {
      if (event instanceof PointerEvent && event.pointerType === "touch") {
        // Touch focus opens before the generated click. Keep that activation open
        // instead of applying the mouse-style toggle and immediately closing it.
        setPopoverOpen(documentNode, popoverTrigger, true);
      } else if (event instanceof MouseEvent && event.detail === 0) {
        setPopoverOpen(documentNode, popoverTrigger, true);
      } else if (openedByFocus.has(popoverTrigger)) {
        openedByFocus.delete(popoverTrigger);
        setPopoverOpen(documentNode, popoverTrigger, true);
      } else {
        togglePopover(documentNode, popoverTrigger);
      }
      return;
    }

    if (!event.target.closest('.evidence-help')) closeAllPopovers(root, documentNode);
  };

  const handleKeydown = (event: KeyboardEvent): void => {
    if (event.key !== "Escape") return;

    const openTrigger = root.querySelector<HTMLButtonElement>(
      `${POPOVER_TRIGGER_SELECTOR}[aria-expanded="true"]`,
    );
    if (!openTrigger) return;

    setPopoverOpen(documentNode, openTrigger, false);
    openTrigger.focus();
  };

  const handlePointerDown = (event: PointerEvent): void => {
    if (event.pointerType !== "touch" || !(event.target instanceof Element)) return;
    const trigger = event.target.closest<HTMLButtonElement>(POPOVER_TRIGGER_SELECTOR);
    touchActivationTrigger = trigger && eventRoot.contains(trigger) ? trigger : null;
  };

  const handlePointerOver = (event: PointerEvent): void => {
    if (event.pointerType === "touch" || !(event.target instanceof Element)) return;
    const trigger = event.target.closest<HTMLButtonElement>(POPOVER_TRIGGER_SELECTOR);
    if (trigger && eventRoot.contains(trigger)) {
      openedByFocus.add(trigger);
      setPopoverOpen(documentNode, trigger, true);
    }
  };

  const handlePointerOut = (event: PointerEvent): void => {
    if (event.pointerType === "touch" || !(event.target instanceof Element)) return;
    const trigger = event.target.closest<HTMLButtonElement>(POPOVER_TRIGGER_SELECTOR);
    const hoveredPanel = event.target.closest<HTMLElement>('.evidence-help');
    const panelOwner = hoveredPanel?.id
      ? root.querySelector<HTMLButtonElement>(`${POPOVER_TRIGGER_SELECTOR}[aria-controls="${hoveredPanel.id}"]`)
      : null;
    const controllingTrigger = trigger ?? panelOwner;
    if (!controllingTrigger) return;

    const panel = getPopoverPanel(documentNode, controllingTrigger);
    if (event.relatedTarget instanceof Node
      && (panel?.contains(event.relatedTarget) || controllingTrigger.contains(event.relatedTarget))) return;
    setPopoverOpen(documentNode, controllingTrigger, false);
  };

  const handleFocusIn = (event: FocusEvent): void => {
    if (!(event.target instanceof Element)) return;
    const trigger = event.target.closest<HTMLButtonElement>(POPOVER_TRIGGER_SELECTOR);
    if (trigger && eventRoot.contains(trigger)) setPopoverOpen(documentNode, trigger, true);
  };

  const handleFocusOut = (event: FocusEvent): void => {
    if (!(event.target instanceof Element)) return;
    const trigger = event.target.closest<HTMLButtonElement>(POPOVER_TRIGGER_SELECTOR);
    if (!trigger) return;
    openedByFocus.delete(trigger);
    const panel = getPopoverPanel(documentNode, trigger);
    if (event.relatedTarget instanceof Node && panel?.contains(event.relatedTarget)) return;
    setPopoverOpen(documentNode, trigger, false);
  };

  eventRoot.addEventListener("click", handleClick);
  eventRoot.addEventListener("keydown", handleKeydown);
  eventRoot.addEventListener("pointerdown", handlePointerDown);
  eventRoot.addEventListener("pointerover", handlePointerOver);
  eventRoot.addEventListener("pointerout", handlePointerOut);
  eventRoot.addEventListener("focusin", handleFocusIn);
  eventRoot.addEventListener("focusout", handleFocusOut);

  const initialFilter = hasValidHashTarget(documentNode) ? "show-all" : "muscle-growth";
  applyFilter(initialFilter);
  scrollToInitialFragment(documentNode);

  return () => {
    eventRoot.removeEventListener("click", handleClick);
    eventRoot.removeEventListener("keydown", handleKeydown);
    eventRoot.removeEventListener("pointerdown", handlePointerDown);
    eventRoot.removeEventListener("pointerover", handlePointerOver);
    eventRoot.removeEventListener("pointerout", handlePointerOut);
    eventRoot.removeEventListener("focusin", handleFocusIn);
    eventRoot.removeEventListener("focusout", handleFocusOut);
    stopContentsTracker?.();
  };
}

function scrollToInitialFragment(documentNode: Document): void {
  const view = documentNode.defaultView;
  const hash = view?.location.hash;
  if (!view || !hash) return;

  let target: Element | null = null;
  try {
    target = documentNode.querySelector(hash);
  } catch {
    return;
  }
  if (!target) return;

  view.setTimeout(() => target?.scrollIntoView({ block: "start" }), 0);
}

function hasValidHashTarget(documentNode: Document): boolean {
  const hash = documentNode.defaultView?.location.hash;
  if (!hash) return false;

  try {
    return documentNode.querySelector(hash) !== null;
  } catch {
    return false;
  }
}

function updateActiveFilter(root: ExplorerRoot, filterId: string): void {
  root.querySelectorAll<HTMLElement>(FILTER_SELECTOR).forEach((button) => {
    const active = button.dataset.supplementFilter === filterId;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function updateCategoryNote(root: ExplorerRoot, filterId: string): void {
  const notice = getSupplementFilter(filterId).notice;
  const container = root.querySelector<HTMLElement>("[data-supplement-category-note]");
  if (!container) return;

  container.hidden = !notice;
  container.classList.toggle(
    "supplement-category-note--important",
    notice?.title === "Important",
  );
  container.classList.toggle("project-callout--important", notice?.title === "Important");
  container.classList.toggle("project-callout--note", notice?.title !== "Important");
  if (!notice) return;

  const title = container.querySelector<HTMLElement>("[data-supplement-category-note-label]");
  const text = container.querySelector<HTMLElement>("[data-supplement-category-note-text]");
  const icon = container.querySelector<SVGPathElement>("[data-supplement-category-note-icon]");
  if (title) title.textContent = notice.title;
  // Blank-line breaks in the notice text become the legacy `<br><br>` paragraph breaks.
  if (text) {
    text.replaceChildren(...notice.text.split("\n\n").flatMap((paragraph, index) => index === 0
      ? [paragraph]
      : [text.ownerDocument.createElement("br"), text.ownerDocument.createElement("br"), paragraph]));
  }
  if (icon) icon.setAttribute("d", notice.title === "Important" ? IMPORTANT_ICON_PATH : NOTE_ICON_PATH);
}

function updateCategoryTop(root: ExplorerRoot, targetId: string | undefined): void {
  root
    .querySelectorAll<HTMLElement>(`${SECTION_SELECTOR}, [data-supplement-support]`)
    .forEach((section) => section.classList.remove("category-top"));

  if (!targetId) return;
  root.querySelector<HTMLElement>(`#${targetId}`)?.classList.add("category-top");
}

function renderTableOfContents(root: ExplorerRoot, filterId: string): void {
  const list = root.querySelector<HTMLOListElement | HTMLUListElement>("[data-supplement-toc]");
  if (!list) return;

  list.replaceChildren(
    ...selectSupplementHeadings(filterId).map((heading) => {
      const item = list.ownerDocument.createElement("li");
      const link = list.ownerDocument.createElement("a");
      link.href = `#${heading.id}`;
      link.textContent = heading.label;
      item.appendChild(link);
      return item;
    }),
  );
}

function showInformationOnly(root: ExplorerRoot): void {
  root.querySelectorAll<HTMLElement>(SECTION_SELECTOR).forEach((section) => {
    section.hidden = true;
  });
  root.querySelectorAll<HTMLElement>("[data-supplement-support]").forEach((section) => {
    section.hidden = false;
  });

  const list = root.querySelector<HTMLOListElement | HTMLUListElement>("[data-supplement-toc]");
  if (!list) return;

  const headings = selectSupplementHeadings("show-all").slice(-2);
  list.replaceChildren(
    ...headings.map((heading) => {
      const item = list.ownerDocument.createElement("li");
      const link = list.ownerDocument.createElement("a");
      link.href = `#${heading.id}`;
      link.textContent = heading.label;
      item.appendChild(link);
      return item;
    }),
  );
}

function togglePopover(documentNode: Document, trigger: HTMLButtonElement): void {
  setPopoverOpen(documentNode, trigger, trigger.getAttribute("aria-expanded") !== "true");
}

function setPopoverOpen(
  documentNode: Document,
  trigger: HTMLButtonElement,
  open: boolean,
): void {
  setControlledPopover(documentNode, trigger, open);
}

function closeAllPopovers(root: ExplorerRoot, documentNode: Document): void {
  root.querySelectorAll<HTMLButtonElement>(`${POPOVER_TRIGGER_SELECTOR}[aria-expanded="true"]`)
    .forEach((trigger) => setPopoverOpen(documentNode, trigger, false));
}

function getPopoverPanel(documentNode: Document, trigger: HTMLButtonElement): HTMLElement | null {
  return getControlledPopover(documentNode, trigger);
}
