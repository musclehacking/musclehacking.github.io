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
const NOTE_ICON_PATH = "M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM6.5 7.75A.75.75 0 0 1 7.25 7h1a.75.75 0 0 1 .75.75v2.75h.25a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1 0-1.5h.25v-2h-.25a.75.75 0 0 1-.75-.75ZM8 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z";
const IMPORTANT_ICON_PATH = "M0 1.75C0 .784.784 0 1.75 0h12.5C15.216 0 16 .784 16 1.75v9.5A1.75 1.75 0 0 1 14.25 13H8.06l-2.573 2.573A1.458 1.458 0 0 1 3 14.543V13H1.75A1.75 1.75 0 0 1 0 11.25Zm1.75-.25a.25.25 0 0 0-.25.25v9.5c0 .138.112.25.25.25h2a.75.75 0 0 1 .75.75v2.19l2.72-2.72a.749.749 0 0 1 .53-.22h6.5a.25.25 0 0 0 .25-.25Zm7 2.25v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 9a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z";

/**
 * Enhances fully rendered supplement HTML. If this module does not run, all
 * supplement sections and native links remain visible and usable.
 */
export function enhanceSupplementExplorer(root: ExplorerRoot = document): () => void {
  const eventRoot = root instanceof Document ? root.documentElement : root;
  const documentNode = eventRoot.ownerDocument;
  const openedByFocus = new WeakSet<HTMLButtonElement>();
  let touchActivationTrigger: HTMLButtonElement | null = null;

  const applyFilter = (filterId: string): void => {
    closeAllPopovers(root, documentNode);

    if (filterId === "information") {
      showInformationOnly(root);
      updateActiveFilter(root, filterId);
      updateCategoryNote(root, filterId);
      updateCategoryTop(root, "supplement-information");
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
  if (text) text.textContent = notice.text;
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
