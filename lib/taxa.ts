/**
 * Donor `taxa` used to hold a species name string. It now links to an NCBITaxon controlled term,
 * which arrives embedded as an object, or as an `@id` string in the `object` frame.
 */
export type TaxaValue =
  | string
  | {
      "@id": string;
      term_id: string;
      term_name?: string;
    };

/**
 * Get the displayable species name from a donor's `taxa` value. Embedded controlled terms show
 * their term name, falling back to the term ID if the ontology has no name for the term. String
 * values display as they are.
 * @param {TaxaValue} taxa `taxa` property of a donor or sample
 * @returns {string} Species name to display; empty string if none
 */
export function getTaxaName(taxa?: TaxaValue | null): string {
  if (!taxa) {
    return "";
  }
  if (typeof taxa === "object") {
    return taxa.term_name || taxa.term_id || "";
  }
  return taxa;
}
