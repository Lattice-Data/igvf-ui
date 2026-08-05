// node_modules
import PropTypes from "prop-types";
import { useContext, useEffect } from "react";
// component
import AuditKeyTable from "../components/audit-key-table";
import AuditTable from "../components/audit-table";
import PagePreamble from "../components/page-preamble";
import {
  SCROLL_TO_TOP_ID,
  secDirId,
  useSecDir,
} from "../components/section-directory";
import SessionContext from "../components/session-context";
// lib
import { groupAuditDocByType, unmatchedAuditTypes } from "../lib/audit";
import { errorObjectToProps } from "../lib/errors";
import FetchRequest from "../lib/fetch-request";
import { retrieveProfiles } from "../lib/server-objects";

const auditKeyColor = [
  {
    audit_level: "ERROR",
    audit_description: "Incorrect or inconsistent metadata",
  },
  {
    audit_level: "NOT_COMPLIANT",
    audit_description:
      "Not fulfilling a compliance standard like attached documents. This will not be released without special exception.",
  },
  {
    audit_level: "WARNING",
    audit_description:
      "Possibly inconsistent metadata. Data can be released with warnings",
  },
  {
    audit_level: "INTERNAL_ACTION",
    audit_description: "Metadata errors that require DACC staff to resolve",
  },
];

/**
 * Get the level of a type in the schema hierarchy, as well as whether it has child types or not.
 * @param {string} type `@type` to find in the hierarchy
 * @param {object} hierarchy Hierarchy tree to search from /profiles
 * @param {number} level Current level in the hierarchy; this gets incremented as we go deeper
 *     into the hierarchy
 * @returns {object} Level of the type in the hierarchy and whether it has child types or not
 */
function getTypeLevel(type, hierarchy, currentLevel = 0) {
  if (hierarchy) {
    if (type in hierarchy) {
      const isParent = Object.keys(hierarchy[type]).length > 0;
      return { level: currentLevel, isParent };
    }
    for (const value of Object.values(hierarchy)) {
      const { level, isParent } = getTypeLevel(type, value, currentLevel + 1);
      if (level !== -1) {
        return { level, isParent };
      }
    }
  }
  return { level: -1, isParent: false };
}

/**
 * Custom renderer for the section directory items on the audit page. It displays the titles
 * indented by their level in the hierarchy.
 */
function DirectoryItemRenderer({ section }) {
  const { profiles } = useContext(SessionContext);
  const hierarchy = profiles?._hierarchy.Item || null;
  const isScrollToTop = section.id === SCROLL_TO_TOP_ID;

  // Get the DOM element for the audit section and extract the `@type` it represents from the
  // data-type attribute.
  const element = document.querySelector(`[id="${section.id}"]`);
  const type = element?.getAttribute("data-type") || "";

  if (isScrollToTop) {
    return <div>{section.title}</div>;
  }

  if (hierarchy && type) {
    const { level, isParent } = getTypeLevel(type, hierarchy);
    return (
      <div
        style={{
          paddingLeft: `${Math.max(level, 0) * 0.8}rem`,
          fontWeight: isParent ? "bold" : "normal",
        }}
      >
        {section.title}
      </div>
    );
  }
  return <div>{section.id}</div>;
}

DirectoryItemRenderer.propTypes = {
  // Anchor and title of the section being rendered in the section directory menu
  section: PropTypes.exact({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  }).isRequired,
};

/**
 * Section of the audits page holding every audit that applies to one object type. The heading acts
 * as the target for the section directory.
 */
function AuditSection({ type, title, audits, isParent = false }) {
  return (
    <>
      <h2
        className={`text-brand mt-8 mb-1 text-lg dark:text-[#8fb3a5] ${
          isParent ? "font-semibold" : ""
        }`}
        id={secDirId(type)}
        data-type={type}
      >
        {title}
      </h2>
      <AuditTable data={audits} />
    </>
  );
}

AuditSection.propTypes = {
  // `@type` the audits in this section apply to
  type: PropTypes.string.isRequired,
  // Heading to display for the section
  title: PropTypes.string.isRequired,
  // Audits to display in this section
  audits: PropTypes.arrayOf(PropTypes.object).isRequired,
  // True if the type has child types in the schema hierarchy
  isParent: PropTypes.bool,
};

export default function AuditDoc({ auditDoc, schemas }) {
  const { collectionTitles, profiles } = useContext(SessionContext);
  const hierarchy = profiles?._hierarchy.Item || null;
  const sections = useSecDir({
    renderer: DirectoryItemRenderer,
    hash: hierarchy ? "profiles" : "",
  });

  const auditsGroupedByCollection = groupAuditDocByType(auditDoc);
  const allSchemaNames = flattenHierarchy(schemas._hierarchy.Item, schemas);

  // Audits documented against something the page has no section for. Collect them into a trailing
  // section so that they stay visible instead of disappearing without a trace.
  const unmatchedTypes = unmatchedAuditTypes(
    auditsGroupedByCollection,
    allSchemaNames
  );
  const unmatchedAudits = unmatchedTypes.flatMap(
    (type) => auditsGroupedByCollection[type]
  );
  const unmatchedTypesKey = unmatchedTypes.join(", ");

  useEffect(() => {
    if (unmatchedTypesKey) {
      console.warn(
        `Audit documentation covers types with no matching schema: ${unmatchedTypesKey}`
      );
    }
  }, [unmatchedTypesKey]);

  return (
    <>
      <PagePreamble sections={sections} />
      <p>
        The Lattice group has established an audit system, utilizing flags, to
        detect discrepancies in the data. While dependencies ensure metadata
        accuracy within an individual object, audits primarily focus on
        validating metadata between linked objects. For example, a specific
        audit has been implemented to verify the linkage of Biosamples with
        donors sharing the same taxa. Within each audit category, there could be
        one or more icons, each assigned a distinct color corresponding to the
        severity level of the audit category.
      </p>
      <div className="text-brand mt-4 mb-1 text-lg font-semibold dark:text-[#8fb3a5]">
        {"Severity Level and Description Key"}
      </div>
      <AuditKeyTable data={auditKeyColor} />
      {allSchemaNames.map((itemType) => {
        const typeAudits = auditsGroupedByCollection[itemType];
        if (typeAudits) {
          const { isParent } = getTypeLevel(itemType, hierarchy);
          return (
            <AuditSection
              key={itemType}
              type={itemType}
              title={collectionTitles?.[itemType] || itemType}
              audits={typeAudits}
              isParent={isParent}
            />
          );
        }
        return null;
      })}
      {unmatchedAudits.length > 0 && (
        <AuditSection type="Other" title="Other" audits={unmatchedAudits} />
      )}
    </>
  );
}

AuditDoc.propTypes = {
  // Audits to display on this page
  auditDoc: PropTypes.object.isRequired,
  // List of schemas to display in the list; directly from /profiles endpoint
  schemas: PropTypes.shape({
    _hierarchy: PropTypes.shape({
      Item: PropTypes.object.isRequired,
    }).isRequired,
  }),
};

/**
 * Extracts the hierarchical schema type names from the hierarchy parameter and converts them
 * to a flat array of schema type names in the order they appear on the Schemas page.
 * @param {object} hierarchy _hierarchical tree from /profiles endpoint
 * @param {object} schemas  List of schemas from /profiles endpoint
 * @returns List of profiles name in PascalCase in hierarchical order
 */
function flattenHierarchy(hierarchy, schemas) {
  const schemaNames = Object.keys(hierarchy).reduce((acc, schemaName) => {
    if (!isDisplayableType(schemaName, schemas, hierarchy[schemaName])) {
      return acc;
    }
    if (Object.keys(hierarchy[schemaName]).length > 0) {
      const childSchemaNames = flattenHierarchy(hierarchy[schemaName], schemas);
      return acc.concat(schemaName, childSchemaNames);
    }
    return acc.concat(schemaName);
  }, []);
  return schemaNames;
}

/**
 * Returns true if the given object type is displayable in the UI. This also indicates that you
 * can add and edit objects of this type.
 * @param {string} objectType Object @type to check
 * @param {object} schemas List of schemas to display in the list; directly from /profiles endpoint
 * @param {object} tree Top of the _hierarchy tree at this level
 * @returns {boolean} True if the object type is displayable/addable/editable
 */
function isDisplayableType(objectType, schemas, tree) {
  return (
    schemas[objectType]?.identifyingProperties?.length > 0 ||
    Object.keys(tree).length > 0
  );
}

export async function getServerSideProps({ req }) {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const auditDoc = (
    await request.getObject("/static/doc/auditdoc.json")
  ).union();
  const schemas = await retrieveProfiles(req.headers.cookie);
  if (
    FetchRequest.isResponseSuccess(auditDoc) &&
    FetchRequest.isResponseSuccess(schemas)
  ) {
    return {
      props: {
        auditDoc,
        schemas,
        pageContext: { title: "Audit Documentation" },
      },
    };
  }
  return errorObjectToProps(auditDoc);
}
