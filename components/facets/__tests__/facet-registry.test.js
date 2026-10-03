import facetRegistry from "../facet-registry";
import StandardTagLabel from "../custom-facets/standard-tag-label";
import StandardTermLabel from "../custom-facets/standard-term-label";
import TaxaTagLabel from "../custom-facets/taxa-tag-label";
import TaxaTermLabel from "../custom-facets/taxa-term-label";

describe("Test taxa entries in the facet registry", () => {
  const taxaFields = [
    "taxa",
    "taxa.term_name",
    "donors.taxa",
    "donors.taxa.term_name",
  ];

  it.each(taxaFields)("uses the taxa labels for %s", (field) => {
    expect(facetRegistry.tagLabel.lookup(field)).toBe(TaxaTagLabel);
    expect(facetRegistry.termLabel.lookup(field)).toBe(TaxaTermLabel);
  });

  it("uses the standard labels for other fields", () => {
    expect(facetRegistry.tagLabel.lookup("sex")).toBe(StandardTagLabel);
    expect(facetRegistry.termLabel.lookup("sex")).toBe(StandardTermLabel);
  });
});
