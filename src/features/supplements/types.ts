export const EVIDENCE_LEVELS = ["low", "medium", "high"] as const;

export type EvidenceLevel = (typeof EVIDENCE_LEVELS)[number];

export const SUPPLEMENT_CATEGORY_IDS = [
  "blood-pressure",
  "bone",
  "brain-function",
  "cardiovascular-health",
  "cholesterol",
  "fatty-liver",
  "focus",
  "glucose-control",
  "gut-health",
  "immune",
  "insulin-sensitivity",
  "joints",
  "longevity",
  "mood",
  "muscle",
  "power-output",
  "relaxation",
  "skin",
  "sleep",
  "test",
] as const;

export type SupplementCategoryId = (typeof SUPPLEMENT_CATEGORY_IDS)[number];

export interface SupplementEvidence {
  readonly category: SupplementCategoryId;
  readonly level: EvidenceLevel;
}

export interface SupplementRecord {
  /** Stable legacy heading fragment without the leading hash. */
  readonly id: string;
  readonly name: string;
  /** Zero-based position in the legacy Show All sequence. */
  readonly sourceOrder: number;
  /** Normalised visible text from the legacy Summary section. */
  readonly description: string;
  readonly evidence: readonly SupplementEvidence[];
  readonly recommendedSupplementUrl?: string;
  readonly referencesAnchor?: `#${string}`;
}

export interface SupplementCategory {
  readonly id: SupplementCategoryId;
  readonly label: string;
}

export interface SupplementFilter {
  readonly id: string;
  readonly label: string;
  readonly categories: readonly SupplementCategoryId[];
  readonly showAll?: boolean;
  readonly notice?: SupplementFilterNotice;
}

export interface SupplementFilterNotice {
  readonly title: "Note" | "Important";
  readonly text: string;
}

export interface SelectedSupplement extends SupplementRecord {
  /** Highest matching evidence level for the active filter. */
  readonly selectedEvidence?: EvidenceLevel;
}

export type SupplementHeadingKind = "supplement" | "information" | "references";

export interface SupplementHeading {
  readonly id: string;
  readonly label: string;
  readonly kind: SupplementHeadingKind;
  readonly evidence?: EvidenceLevel;
}
