import { getTaxaName } from "../taxa";

describe("Test getTaxaName()", () => {
  it("returns the term name of an embedded controlled term", () => {
    expect(
      getTaxaName({
        "@id": "/controlled_terms/NCBITaxon:10090/",
        term_id: "NCBITaxon:10090",
        term_name: "Mus musculus",
      })
    ).toBe("Mus musculus");
  });

  it("falls back to the term ID when the term name is empty or missing", () => {
    expect(
      getTaxaName({
        "@id": "/controlled_terms/NCBITaxon:9606/",
        term_id: "NCBITaxon:9606",
        term_name: "",
      })
    ).toBe("NCBITaxon:9606");
    expect(
      getTaxaName({
        "@id": "/controlled_terms/NCBITaxon:9606/",
        term_id: "NCBITaxon:9606",
      })
    ).toBe("NCBITaxon:9606");
  });

  it("returns string values unchanged", () => {
    expect(getTaxaName("Homo sapiens")).toBe("Homo sapiens");
  });

  it("returns an empty string for missing values", () => {
    expect(getTaxaName(undefined)).toBe("");
    expect(getTaxaName(null)).toBe("");
  });
});
