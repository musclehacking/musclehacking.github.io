import { evidenceRank, supplementFilters, supplements } from "./data";
import type {
  EvidenceLevel,
  SelectedSupplement,
  SupplementFilter,
  SupplementHeading,
  SupplementRecord,
} from "./types";

export const DEFAULT_SUPPLEMENT_FILTER_ID = "muscle-growth";

export function getSupplementFilter(filterId: string): SupplementFilter {
  const filter = supplementFilters.find((candidate) => candidate.id === filterId);

  if (!filter) {
    throw new RangeError(`Unknown supplement filter: ${filterId}`);
  }

  return filter;
}

export function selectSupplements(
  filterId: string,
  records: readonly SupplementRecord[] = supplements,
): SelectedSupplement[] {
  const filter = getSupplementFilter(filterId);

  if (filter.showAll) {
    return [...records]
      .sort((left, right) => left.sourceOrder - right.sourceOrder)
      .map((record) => ({ ...record }));
  }

  const selected = records.flatMap<SelectedSupplement>((record) => {
    const selectedEvidence = getHighestEvidence(record, filter);
    return selectedEvidence ? [{ ...record, selectedEvidence }] : [];
  });

  return selected.sort((left, right) => {
    const evidenceDifference =
      rankEvidence(right.selectedEvidence) - rankEvidence(left.selectedEvidence);

    return evidenceDifference || left.sourceOrder - right.sourceOrder;
  });
}

export function selectSupplementHeadings(
  filterId: string,
  records: readonly SupplementRecord[] = supplements,
): SupplementHeading[] {
  const selected = selectSupplements(filterId, records);

  return [
    ...selected.map((record) => ({
      id: record.id,
      label: record.name,
      kind: "supplement" as const,
      evidence: record.selectedEvidence,
    })),
    { id: "supplement-information", label: "What is this?", kind: "information" },
    { id: "all-references", label: "References", kind: "references" },
  ];
}

function getHighestEvidence(
  record: SupplementRecord,
  filter: SupplementFilter,
): EvidenceLevel | undefined {
  let highest: EvidenceLevel | undefined;

  for (const evidence of record.evidence) {
    if (!filter.categories.includes(evidence.category)) {
      continue;
    }

    if (!highest || evidenceRank[evidence.level] > evidenceRank[highest]) {
      highest = evidence.level;
    }
  }

  return highest;
}

function rankEvidence(level: EvidenceLevel | undefined): number {
  return level ? evidenceRank[level] : 0;
}
