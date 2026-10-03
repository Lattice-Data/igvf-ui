import { render, screen } from "@testing-library/react";
import { DonorDataItems } from "../common-data-items";
import DonorTable from "../donor-table";

const humanTaxa = {
  "@id": "/controlled_terms/NCBITaxon:9606/",
  term_id: "NCBITaxon:9606",
  term_name: "Homo sapiens",
};

const mouseTaxa = {
  "@id": "/controlled_terms/NCBITaxon:10090/",
  term_id: "NCBITaxon:10090",
  term_name: "Mus musculus",
};

const unnamedTaxa = {
  "@id": "/controlled_terms/NCBITaxon:7668/",
  term_id: "NCBITaxon:7668",
  term_name: "",
};

function makeDonor(id, taxa) {
  return {
    "@id": `/human_donors/${id}/`,
    "@type": ["HumanDonor", "Donor", "Item"],
    accession: id,
    status: "released",
    taxa,
  };
}

describe("Test taxa in DonorDataItems", () => {
  it("displays the term name of an embedded taxa term in italics", () => {
    render(<DonorDataItems item={makeDonor("D1", humanTaxa)} />);
    const value = screen.getByText("Homo sapiens");
    expect(value.tagName).toBe("I");
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("falls back to the term ID when the term name is empty", () => {
    render(<DonorDataItems item={makeDonor("D2", unnamedTaxa)} />);
    expect(screen.getByText("NCBITaxon:7668")).toBeInTheDocument();
  });

  it("displays a string taxa value from an older backend", () => {
    render(<DonorDataItems item={makeDonor("D3", "Mus musculus")} />);
    expect(screen.getByText("Mus musculus").tagName).toBe("I");
  });

  it("displays no taxa item when the donor has no taxa", () => {
    render(<DonorDataItems item={makeDonor("D4", undefined)} />);
    expect(screen.queryByText("Taxa")).not.toBeInTheDocument();
  });
});

describe("Test taxa in DonorTable", () => {
  beforeAll(() => {
    window.scrollTo = jest.fn();
  });

  it("displays object and string taxa values in the taxa column", () => {
    const donors = [
      makeDonor("D1", mouseTaxa),
      makeDonor("D2", "Homo sapiens"),
      makeDonor("D3", unnamedTaxa),
    ];
    render(<DonorTable donors={donors} />);

    expect(screen.getByText("Mus musculus").tagName).toBe("I");
    expect(screen.getByText("Homo sapiens").tagName).toBe("I");
    expect(screen.getByText("NCBITaxon:7668").tagName).toBe("I");
  });
});
