/** Shared between the audit filter (client) and the table (server). */
export const AUDIT_ACTION_LABELS: Record<string, string> = {
  "organization.created": "Organization created",
  "organization.updated": "Organization updated",
  "member.added": "Member added",
  "member.role_changed": "Member role changed",
  "member.removed": "Member removed",
  "api_key.created": "API key created",
  "api_key.revoked": "API key revoked",
  "api_key.rotated": "API key rotated",
  "assistant.created": "Assistant created",
  "assistant.updated": "Assistant updated",
  "assistant.status_changed": "Assistant status changed",
  "assistant.duplicated": "Assistant duplicated",
  "policy.updated": "Policy updated",
  "knowledge.created": "Knowledge base created",
  "knowledge.updated": "Knowledge base updated",
  "document.uploaded": "Document uploaded",
  "document.deleted": "Document deleted",
  "document.reprocessed": "Document reprocessed",
  "conversation.deleted": "Conversation anonymised",
  "account.deactivated": "Account deactivated",
  "admin.access": "Administrative access",
};

export const AUDIT_ACTION_OPTIONS = Object.entries(AUDIT_ACTION_LABELS).map(([value, label]) => ({ value, label }));
