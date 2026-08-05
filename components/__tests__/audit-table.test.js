import { render, screen } from "@testing-library/react";
import AuditTable from "../audit-table";

describe("Test the AuditTable component", () => {
  it("renders every audit, ordered by level and then category", () => {
    const audits = [
      {
        audit_category: "unexpected RT indexes",
        audit_description:
          "Plate-based libraries are not expected to have RT indexes.",
        audit_level: "WARNING",
      },
      {
        audit_category: "missing multiplexing barcodes",
        audit_description: "Multiplexed samples are expected to have barcodes.",
        audit_level: "ERROR",
      },
      {
        audit_category: "inconsistent donor taxa",
        audit_description: "Biosamples are expected to match their donors.",
        audit_level: "ERROR",
      },
    ];

    render(<AuditTable data={audits} />);

    const categories = screen
      .getAllByRole("cell")
      .map((cell) => cell.textContent);
    expect(categories).toContain("inconsistent donor taxa");
    expect(categories.indexOf("inconsistent donor taxa")).toBeLessThan(
      categories.indexOf("missing multiplexing barcodes")
    );
    expect(categories.indexOf("missing multiplexing barcodes")).toBeLessThan(
      categories.indexOf("unexpected RT indexes")
    );
  });

  it("renders an unrecognized audit level instead of crashing", () => {
    const audits = [
      {
        audit_category: "unknown severity",
        audit_description: "An audit level the UI has no icon for.",
        audit_level: "CATASTROPHE",
      },
    ];

    expect(() => render(<AuditTable data={audits} />)).not.toThrow();
    expect(screen.getByText("CATASTROPHE")).toBeInTheDocument();
  });

  it("renders an audit with no category instead of crashing", () => {
    const audits = [
      {
        audit_description: "An audit with no category to sort on.",
        audit_level: "ERROR",
      },
    ];

    expect(() => render(<AuditTable data={audits} />)).not.toThrow();
    expect(
      screen.getByText("An audit with no category to sort on.")
    ).toBeInTheDocument();
  });
});
