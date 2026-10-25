/**
 * DTOs mirroring the Django serializers.
 *
 * Hand-written on purpose: the surface is small and stable, and hand-written
 * types stay readable at the call site. If the API grows, generate these from
 * `/api/schema/` instead.
 */

export type Role = "OWNER" | "ADMIN" | "DEVELOPER" | "MEMBER" | "READ_ONLY";

export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  page: number;
  page_size: number;
  results: T[];
};

export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
    details: Record<string, string[]> | null;
    request_id: string;
  };
};

// -- accounts ---------------------------------------------------------------
export type User = {
  id: string;
  email: string;
  full_name: string;
  is_email_verified: boolean;
  date_joined: string;
  is_active: boolean;
};

export type Membership = {
  organization_id: string;
  organization_name: string;
  organization_slug: string;
  role: Role;
};

export type MeResponse = {
  user: User;
  memberships: Membership[];
};

export type LoginResponse = {
  access: string;
  refresh: string;
  user: User;
};

// -- organizations ----------------------------------------------------------
export type OrganizationStatus = "ACTIVE" | "SUSPENDED" | "ARCHIVED";

export type Organization = {
  id: string;
  name: string;
  slug: string;
  status: OrganizationStatus;
  timezone: string;
  plan_code: string | null;
  member_count: number;
  role: Role | null;
  created_at: string;
  updated_at: string;
};

/** `GET /organizations/{id}/ai-settings/` — the key itself is never returned. */
export type AISettings = {
  provider: string;
  model: string;
  has_key: boolean;
  key_last4: string;
  source: "workspace" | "environment";
  available_providers: string[];
  /** Display names, e.g. the gateway vendor instead of the wire protocol. */
  provider_labels: Record<string, string>;
  environment: {
    provider: string;
    model: string;
    has_key: boolean;
  };
  updated_at: string | null;
  updated_by: string | null;
};

export type AISettingsUpdate = {
  provider?: string;
  model?: string;
  /** Write-only. Omit to keep the stored key. */
  api_key?: string;
};

export type AISettingsTestResult = {
  ok: boolean;
  provider: string;
  model: string;
  source: string;
  latency_ms?: number;
  sample?: string;
  error?: string;
  error_code?: string;
};

export type MembershipRow = {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  role: Role;
  created_at: string;
};

// -- assistants -------------------------------------------------------------
export type AssistantStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "ARCHIVED";

export type AssistantDomainType = "HOTEL" | "HOSPITAL" | "ECOMMERCE" | "BOOKING" | "UNIVERSITY" | "GENERIC" | "OTHER";

export type GenerationParameters = {
  temperature?: number;
  top_p?: number;
};

export type Assistant = {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: AssistantStatus;
  domain_type: AssistantDomainType;
  allowed_topics: string[];
  prohibited_topics: string[];
  system_instructions: string;
  fallback_message: string;
  default_language: string;
  model_provider: string;
  model_name: string;
  generation_parameters: GenerationParameters;
  maximum_output_tokens: number;
  knowledge_required: boolean;
  knowledge_base_ids: string[];
  config_version: number;
  policy_version: number;
  created_at: string;
  updated_at: string;
};

export type AssistantWrite = {
  name: string;
  description?: string;
  domain_type?: AssistantDomainType;
  allowed_topics?: string[];
  prohibited_topics?: string[];
  system_instructions?: string;
  fallback_message?: string;
  default_language?: string;
  model_provider?: string;
  model_name?: string;
  generation_parameters?: GenerationParameters;
  maximum_output_tokens?: number;
  knowledge_required?: boolean;
  knowledge_base_ids?: string[];
};

/** `POST /assistants/draft/` — a suggested starting configuration, never persisted. */
export type AssistantDraft = {
  name: string;
  description: string;
  domain_type: string;
  allowed_topics: string[];
  prohibited_topics: string[];
  system_instructions: string;
  fallback_message: string;
  provider: string;
  model: string;
  /** `model` when a provider wrote it, `template` when the deterministic fallback ran. */
  source: "model" | "template";
  generated: boolean;
};

/** `GET /assistants/{id}/usage/` */
export type AssistantUsage = {
  assistant_id: string;
  total_requests: number;
  successful: number;
  refused: number;
  errors: number;
  input_tokens: number;
  output_tokens: number;
  average_latency_ms: number;
};

// -- policies ---------------------------------------------------------------
export type UncertaintyHandling = "CLARIFY" | "REFUSE";
export type EvaluatorMode = "RULES" | "HYBRID";

export type ResponseConstraints = {
  max_chars?: number;
  banned_phrases?: string[];
  required_disclaimer?: string;
  block_pii?: boolean;
  messages?: Record<string, string>;
};

export type EscalationRules = {
  keywords?: string[];
  message?: string;
};

export type ToolPermissions = {
  allowed_tools?: string[];
};

export type AssistantPolicy = {
  assistant_id: string;
  allowed_topics: string[];
  prohibited_topics: string[];
  industry: string;
  response_constraints: ResponseConstraints;
  escalation_rules: EscalationRules;
  tool_permissions: ToolPermissions;
  uncertainty_handling: UncertaintyHandling;
  evaluator_mode: EvaluatorMode;
  allow_threshold: number;
  clarify_threshold: number;
  version: number;
  updated_at: string;
};

export type PolicyUpdate = Partial<{
  allowed_topics: string[];
  prohibited_topics: string[];
  industry: string;
  response_constraints: ResponseConstraints;
  escalation_rules: EscalationRules;
  tool_permissions: ToolPermissions;
  uncertainty_handling: UncertaintyHandling;
  evaluator_mode: EvaluatorMode;
  allow_threshold: number;
  clarify_threshold: number;
}>;

export type PolicyDecisionValue = "ALLOW" | "REFUSE" | "CLARIFY" | "ESCALATE" | "REVIEW";

export type PolicyEvaluation = {
  decision: PolicyDecisionValue;
  reason_code: string;
  message: string;
  confidence: number | null;
  policy_version: number;
  evaluator: string;
  evaluator_version: string;
  metadata?: Record<string, unknown>;
  latency_ms?: number;
  response_evaluation?: Omit<PolicyEvaluation, "response_evaluation">;
};

export type PolicyEvaluationRequest = {
  assistant_id?: string;
  policy?: {
    allowed_topics?: string[];
    prohibited_topics?: string[];
    industry?: string;
    response_constraints?: ResponseConstraints;
    escalation_rules?: EscalationRules;
    uncertainty_handling?: UncertaintyHandling;
    evaluator_mode?: EvaluatorMode;
    allow_threshold?: number;
    clarify_threshold?: number;
    knowledge_required?: boolean;
  };
  request_text: string;
  proposed_response?: string;
  knowledge_context?: string;
};

export type EvaluationCase = {
  input: string;
  expected_decision: PolicyDecisionValue;
  has_knowledge?: boolean;
  note?: string;
};

export type EvaluationReport = {
  assistant_id: string;
  policy_version: number;
  evaluator_version: string;
  summary: {
    total: number;
    correct: number;
    accuracy: number;
    false_acceptance: number;
    false_rejection: number;
    false_acceptance_rate: number;
    false_rejection_rate: number;
  };
  results: Array<{
    input: string;
    expected_decision: PolicyDecisionValue;
    actual_decision: PolicyDecisionValue;
    reason_code: string;
    confidence: number | null;
    passed: boolean;
    note: string;
  }>;
  disclaimer: string;
};

// -- knowledge --------------------------------------------------------------
export type DocumentStatus = "PENDING" | "PROCESSING" | "READY" | "FAILED";

export type KnowledgeBase = {
  id: string;
  name: string;
  slug: string;
  description: string;
  document_count: number;
  created_at: string;
  updated_at: string;
};

export type Document = {
  id: string;
  knowledge_base_id: string;
  title: string;
  original_filename: string;
  content_type: string;
  size_bytes: number;
  status: DocumentStatus;
  chunk_count: number;
  page_count: number;
  error_code: string;
  error_message: string;
  created_at: string;
  updated_at: string;
};

export type DocumentProcessingStatus = {
  document_id: string;
  status: DocumentStatus;
  chunk_count: number;
  page_count: number;
  error_code: string;
  error_message: string;
  job: {
    id: string | null;
    status: "QUEUED" | "RUNNING" | "SUCCEEDED" | "FAILED" | null;
    attempts: number;
    started_at: string | null;
    finished_at: string | null;
  };
};

// -- conversations ----------------------------------------------------------
export type ConversationStatus = "ACTIVE" | "CLOSED" | "ANONYMIZED";

export type Conversation = {
  id: string;
  assistant_id: string;
  assistant_name: string;
  external_user_id: string;
  status: ConversationStatus;
  config_version: number;
  message_count: number;
  last_message_at: string | null;
  created_at: string;
};

export type MessageRole = "USER" | "ASSISTANT" | "SYSTEM" | "TOOL";
export type MessageStatus = "COMPLETED" | "BLOCKED" | "FAILED";

export type Citation = {
  document_id: string;
  document_title: string;
  chunk_index: number;
  page_number: number | null;
  score: number;
};

export type Message = {
  id: string;
  role: MessageRole;
  content: string;
  status: MessageStatus;
  policy_decision: string;
  refusal_reason_code: string;
  citations: Citation[];
  input_tokens: number;
  output_tokens: number;
  latency_ms: number;
  created_at: string;
};

export type ChatRequest = {
  assistant_id: string;
  message: string;
  conversation_id?: string;
  metadata?: Record<string, string | number | boolean | null>;
};

export type ChatResponse = {
  conversation_id: string;
  message_id: string;
  assistant_id: string;
  decision: PolicyDecisionValue;
  reason_code: string;
  content: string;
  citations: Citation[];
  usage: {
    input_tokens: number;
    output_tokens: number;
    estimated: boolean;
  };
  policy: {
    decision: PolicyDecisionValue;
    reason_code: string;
    confidence: number | null;
    policy_version: number;
    evaluator: string;
  };
  latency_ms: number;
  request_id: string;
};

// -- api keys ---------------------------------------------------------------
export type ApiKeyEnvironment = "DEVELOPMENT" | "STAGING" | "PRODUCTION";

export type ApiKey = {
  id: string;
  name: string;
  prefix: string;
  environment: ApiKeyEnvironment;
  scopes: string[];
  assistant_id: string | null;
  expires_at: string | null;
  revoked_at: string | null;
  last_used_at: string | null;
  is_active: boolean;
  created_at: string;
};

export type ApiKeyCreated = ApiKey & { key: string };

// -- usage ------------------------------------------------------------------
export type UsageTotals = {
  requests: number;
  successful: number;
  refused: number;
  clarifications: number;
  escalations: number;
  errors: number;
  input_tokens: number;
  output_tokens: number;
  average_latency_ms: number;
};

export type QuotaState = {
  limit: number;
  used: number;
  remaining: number;
  period_end: string;
};

export type UsageSummary = {
  from: string;
  to: string;
  totals: UsageTotals;
  by_kind: Record<string, number>;
  quota: {
    chat_requests: QuotaState;
    policy_evaluations: QuotaState;
  };
  note: string;
};

export type UsageByAssistant = {
  from: string;
  to: string;
  results: Array<{
    assistant_id: string;
    assistant_name: string;
    requests: number;
    successful: number;
    refused: number;
    input_tokens: number;
    output_tokens: number;
    average_latency_ms: number;
  }>;
};

export type UsageByApiKey = {
  from: string;
  to: string;
  results: Array<{
    api_key_id: string;
    name: string;
    prefix: string;
    environment: ApiKeyEnvironment;
    requests: number;
    refused: number;
    errors: number;
  }>;
};

// -- audit ------------------------------------------------------------------
export type AuditLog = {
  id: string;
  action: string;
  actor_email: string | null;
  api_key_prefix: string | null;
  target_type: string;
  target_id: string;
  metadata: Record<string, unknown>;
  request_id: string;
  created_at: string;
};
