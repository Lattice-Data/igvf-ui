import {
  AuditDocMessage,
  groupAuditDocByType,
  unmatchedAuditTypes,
} from "../audit";

describe("Test groupAuditDocByType()", () => {
  it("puts an audit under every type it is registered against", () => {
    const auditDoc = {
      "igvfd.audit.library.audit_library_samples_missing_multiplexing_barcodes":
        [
          {
            audit_category: "missing multiplexing barcodes",
            audit_description:
              "Libraries with a barcode-based multiplexing method are expected to have multiplexing barcodes on every linked sample.",
            audit_level: "ERROR",
            audit_types: ["DropletBasedLibrary", "PlateBasedLibrary"],
          },
        ],
    };

    const groupedAudits = groupAuditDocByType(auditDoc);
    expect(Object.keys(groupedAudits).sort()).toEqual([
      "DropletBasedLibrary",
      "PlateBasedLibrary",
    ]);
    expect(groupedAudits.DropletBasedLibrary).toHaveLength(1);
    expect(groupedAudits.PlateBasedLibrary).toHaveLength(1);
    expect(groupedAudits.DropletBasedLibrary[0].audit_category).toBe(
      "missing multiplexing barcodes"
    );
  });

  it("uses the registered type rather than the module the audit lives in", () => {
    const auditDoc = {
      "igvfd.audit.matrix_file.audit_raw_matrix_file_software_without_version":
        [
          {
            audit_category: "missing software version",
            audit_description:
              "Raw matrix files are expected to specify the version of the software that generated them.",
            audit_level: "WARNING",
            audit_types: ["RawMatrixFile"],
          },
        ],
    };

    const groupedAudits = groupAuditDocByType(auditDoc);
    expect(Object.keys(groupedAudits)).toEqual(["RawMatrixFile"]);
    expect(groupedAudits.MatrixFile).toBeUndefined();
  });

  it("falls back to the audit module name when audit_types is missing or empty", () => {
    const auditDoc = {
      "igvfd.audit.treatment.audit_treatment_summary": [
        {
          audit_category: "inconsistent summary",
          audit_description: "Treatment summaries are expected to match.",
          audit_level: "ERROR",
        },
      ],
      "igvfd.audit.biosample.audit_biosample_taxa": [
        {
          audit_category: "inconsistent donor taxa",
          audit_description: "Biosamples are expected to match their donors.",
          audit_level: "ERROR",
          audit_types: [],
        },
      ],
    };

    const groupedAudits = groupAuditDocByType(auditDoc);
    expect(Object.keys(groupedAudits).sort()).toEqual([
      "Biosample",
      "Treatment",
    ]);
  });

  it("keeps an audit whose path has no module segment instead of dropping it", () => {
    const auditDoc = {
      audit_orphan: [
        {
          audit_category: "orphan audit",
          audit_description: "An audit path with no module segment.",
          audit_level: "WARNING",
        },
      ],
    };

    const groupedAudits = groupAuditDocByType(auditDoc);
    expect(groupedAudits.audit_orphan).toHaveLength(1);
  });

  it("skips a group with no messages without throwing", () => {
    const auditDoc = {
      "igvfd.audit.library.audit_library_without_docstring": {},
      "igvfd.audit.library.audit_library_null": null,
      "igvfd.audit.treatment.audit_treatment_summary": [
        {
          audit_category: "inconsistent summary",
          audit_description: "Treatment summaries are expected to match.",
          audit_level: "ERROR",
          audit_types: ["Treatment"],
        },
      ],
    };

    let groupedAudits: Record<string, AuditDocMessage[]>;
    expect(() => {
      groupedAudits = groupAuditDocByType(auditDoc);
    }).not.toThrow();
    expect(Object.keys(groupedAudits)).toEqual(["Treatment"]);
  });

  it("returns nothing for empty or missing audit documentation", () => {
    expect(groupAuditDocByType({})).toEqual({});
    expect(groupAuditDocByType(null)).toEqual({});
  });
});

describe("Test unmatchedAuditTypes()", () => {
  const groupedAudits = {
    Treatment: [
      {
        audit_category: "inconsistent summary",
        audit_description: "Treatment summaries are expected to match.",
        audit_level: "ERROR",
      },
    ],
    MatrixFile: [
      {
        audit_category: "missing software version",
        audit_description: "Software versions are expected.",
        audit_level: "WARNING",
      },
    ],
  };

  it("reports audit types that no schema type matches", () => {
    expect(
      unmatchedAuditTypes(groupedAudits, ["Treatment", "RawMatrixFile"])
    ).toEqual(["MatrixFile"]);
  });

  it("reports nothing when every audit type has a schema type", () => {
    expect(
      unmatchedAuditTypes(groupedAudits, ["Treatment", "MatrixFile"])
    ).toEqual([]);
  });

  it("reports every audit type when no schema types exist", () => {
    expect(unmatchedAuditTypes(groupedAudits, [])).toEqual([
      "Treatment",
      "MatrixFile",
    ]);
  });
});
