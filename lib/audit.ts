// node_modules
import _ from "lodash";
// lib
import { snakeCaseToPascalCase } from "./general";
// Types
import { DatabaseObject } from "../globals.d";

/**
 * All possible audit levels, and just the public ones.
 */
export type AuditLevel =
  | "ERROR"
  | "NOT_COMPLIANT"
  | "WARNING"
  | "INTERNAL_ACTION";
export type PublicAuditLevel = Exclude<AuditLevel, "INTERNAL_ACTION">;

/**
 * Order that audit levels should appear in the UI.
 */
export const auditLevelOrder: readonly AuditLevel[] = [
  "ERROR",
  "NOT_COMPLIANT",
  "WARNING",
  "INTERNAL_ACTION",
];

/**
 * Typescript can't generate arrays from union types 😭
 */
const publicLevels: PublicAuditLevel[] = ["ERROR", "WARNING", "NOT_COMPLIANT"];

/**
 * Test whether an audit level is a public or not.
 * @param level Audit level to check
 * @returns True if the audit level is a public audit level
 */
function isPublicAuditLevel(level: string): level is PublicAuditLevel {
  return publicLevels.includes(level as PublicAuditLevel);
}

/**
 * Get the list of audit levels visible for the user's authentication level for the audits of a
 * database item.
 * @param item Item that might contain audits
 * @param isAuthenticated True if the user has authenticated
 * @returns Sorted list of audit levels that are visible to the user
 */
export function getVisibleItemAuditLevels(
  item: DatabaseObject,
  isAuthenticated: boolean
): string[] {
  const visibleAuditLevels = item.audit
    ? Object.keys(item.audit).filter((level): level is AuditLevel => {
        return isAuthenticated || isPublicAuditLevel(level);
      })
    : [];
  const validAuditLevels = visibleAuditLevels.filter((level) =>
    auditLevelOrder.includes(level)
  );
  return validAuditLevels.length > 0
    ? _.sortBy(validAuditLevels, (level) => auditLevelOrder.indexOf(level))
    : [];
}

/**
 * One documented audit message from /static/doc/auditdoc.json.
 */
export type AuditDocMessage = {
  audit_category: string;
  audit_description: string;
  audit_level: string;
  /** Object types the audit is registered against; missing on older igvfd deployments */
  audit_types?: string[];
};

/**
 * Object types a documented audit message applies to.
 *
 * `audit_types` holds the types the audit is registered against, so prefer it. Deployments that
 * predate that field leave us guessing from the module name in the audit path, where
 * `igvfd.audit.treatment.audit_missing_summary` implies `Treatment`. That guess is wrong whenever
 * the module name isn't itself a type name -- `matrix_file` holds audits registered against
 * `RawMatrixFile` -- so fall back to the whole path, which keeps the message visible under "Other"
 * rather than dropping it.
 * @param message Audit message to find the types of
 * @param auditPath Key the message appeared under in the audit documentation
 * @returns Types the message should appear under
 */
function auditMessageTypes(
  message: AuditDocMessage,
  auditPath: string
): string[] {
  if (Array.isArray(message?.audit_types) && message.audit_types.length > 0) {
    return message.audit_types;
  }
  const moduleName = auditPath.split(".")[2];
  return [moduleName ? snakeCaseToPascalCase(moduleName) : auditPath];
}

/**
 * Group the audit documentation by the object types each audit applies to. An audit registered
 * against more than one type appears under each of them.
 * @param auditDoc Audit documentation from /static/doc/auditdoc.json
 * @returns Audit messages keyed by the object type they apply to
 */
export function groupAuditDocByType(
  auditDoc: Record<string, unknown>
): Record<string, AuditDocMessage[]> {
  const groupedAudits: Record<string, AuditDocMessage[]> = {};
  for (const [auditPath, messages] of Object.entries(auditDoc || {})) {
    // An audit with no docstring to parse comes through as an empty object, not a list.
    if (!Array.isArray(messages)) {
      continue;
    }
    for (const message of messages as AuditDocMessage[]) {
      for (const type of auditMessageTypes(message, auditPath)) {
        groupedAudits[type] = (groupedAudits[type] || []).concat(message);
      }
    }
  }
  return groupedAudits;
}

/**
 * Types in the grouped audit documentation that no displayable schema type matches. The audits
 * page renders its sections by walking the schema types, so these would otherwise go unrendered
 * with nothing to distinguish them from a type that simply has no audits.
 * @param groupedAudits Audit messages keyed by object type, from `groupAuditDocByType`
 * @param schemaTypes Schema types the page can render sections for
 * @returns Audit types with no matching schema type
 */
export function unmatchedAuditTypes(
  groupedAudits: Record<string, AuditDocMessage[]>,
  schemaTypes: string[]
): string[] {
  return Object.keys(groupedAudits).filter(
    (type) => !schemaTypes.includes(type)
  );
}
