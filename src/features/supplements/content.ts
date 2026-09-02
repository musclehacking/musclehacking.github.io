import { load } from "cheerio";

import legacySupplementHtml from "../../../supplements/index.html?raw";
import { supplements } from "./data";

type SupplementId = (typeof supplements)[number]["id"];
type Selection = ReturnType<typeof $>;

export interface SupplementContentRecord {
  readonly id: SupplementId;
  readonly detailHtml: string;
}

export interface SupplementSupportContent {
  readonly informationHtml: string;
  readonly referencesHtml: string;
}

const $ = load(legacySupplementHtml);

/**
 * Full supplement copy remains owned by the audited legacy document. Extracting
 * it at build time prevents a second, manually maintained copy from drifting.
 * Only the semantic content is retained; the legacy scripts and interaction
 * attributes never enter the generated page.
 */
export const supplementContent = supplements.map((supplement) => {
  const section = $(".category").filter((_, element) =>
    $(element).find(`h2#${supplement.id}`).length > 0,
  ).first().clone();

  if (!section.length) {
    throw new Error(`Missing legacy supplement content for ${supplement.id}`);
  }

  section.children(".heading-wrapper").first().remove();
  replaceTermPopovers(section, supplement.id);
  removeLegacyInteractionAttributes(section);

  const detailHtml = section.html()?.trim();
  if (!detailHtml) {
    throw new Error(`Empty legacy supplement content for ${supplement.id}`);
  }

  return { id: supplement.id, detailHtml };
}) satisfies readonly SupplementContentRecord[];

export const supplementContentById = new Map(
  supplementContent.map((content) => [content.id, content]),
);

const informationSection = $('.category[data-category="info"]').first().clone();
const referencesHeading = informationSection.find("#all-references").first();

if (!informationSection.length || !referencesHeading.length) {
  throw new Error("Missing legacy supplement information or references content");
}

informationSection.children(".heading-wrapper").first().remove();
removeLegacyInteractionAttributes(informationSection);

let informationHtml = "";
for (const child of informationSection.contents().toArray()) {
  if (child === referencesHeading.get(0)) break;
  informationHtml += $.html(child);
}

const referencesNodes = referencesHeading.nextAll().toArray();

export const supplementSupportContent = {
  informationHtml: informationHtml.trim(),
  referencesHtml: referencesNodes.map((node) => $.html(node)).join("").trim(),
} satisfies SupplementSupportContent;

for (const supplement of supplements) {
  if (!("referencesAnchor" in supplement) || !supplement.referencesAnchor) continue;

  const targetId = supplement.referencesAnchor.slice(1);
  if (!referencesHeading.parent().find(`#${targetId}`).length) {
    throw new Error(`Missing legacy reference section ${supplement.referencesAnchor}`);
  }
}

function removeLegacyInteractionAttributes(root: Selection): void {
  root.find("[data-toggle], [data-content], [data-html]").each((_, element) => {
    $(element).removeAttr("data-toggle data-content data-html");
  });
}

function replaceTermPopovers(root: Selection, supplementId: SupplementId): void {
  root.find("a.no-link-popover").each((index, element) => {
    const term = $(element);
    const content = term.attr("data-content")?.trim();
    if (!content) return;

    const panelId = `term-help-${supplementId}-${index + 1}`;
    const button = $("<button></button>")
      .attr({
        type: "button",
        class: "supplement-term",
        "data-supplement-popover": "",
        "aria-expanded": "false",
        "aria-controls": panelId,
      })
      .html(term.html() ?? term.text());
    const panel = $("<span></span>")
      .attr({ id: panelId, class: "term-help", hidden: "" })
      .html(content);

    term.replaceWith(button.add(panel));
  });
}
