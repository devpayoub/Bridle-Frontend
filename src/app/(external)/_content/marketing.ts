/**
 * Marketing content for the pages behind the landing navigation.
 *
 * Every nav item and sub-item has an entry here, so the mega menu and the pages
 * cannot drift apart: the menu links are generated from these paths, and the
 * dynamic route renders whatever is defined for a path.
 */
export type Section = {
  title: string;
  body: string;
  bullets?: string[];
};

export type MarketingPage = {
  /** URL path, also the key used by the nav. */
  path: string;
  /** Nav label (short). */
  nav: string;
  eyebrow: string;
  title: string;
  summary: string;
  sections: Section[];
  /** A full-width block rendered after the sections. */
  block?: "pricing" | "developers";
  related: { label: string; href: string }[];
};

const INDUSTRY_SECTIONS = (vertical: string, handles: string[], refuses: string[], example: string): Section[] => [
  {
    title: "What it handles",
    body: `A ${vertical} assistant answers the questions your team repeats all day. Scope it to those topics and nothing else.`,
    bullets: handles,
  },
  {
    title: "What it refuses",
    body: "The policy runs before the model, so a request outside the domain never reaches the provider. Refusals carry a reason code you can report on.",
    bullets: refuses,
  },
  {
    title: "A policy you can copy",
    body: "Start from this shape and edit the topics to match your own service.",
    bullets: [example],
  },
];

export const PAGES: MarketingPage[] = [
  // -- Platform -------------------------------------------------------------
  {
    path: "/platform",
    nav: "Platform",
    eyebrow: "Platform",
    title: "One pipeline between your customers and the model.",
    summary:
      "Every request runs the same six stages: screen, retrieve, generate, validate, persist, audit. Nothing is skipped and nothing is implicit.",
    sections: [
      {
        title: "Screening before spending",
        body: "Deterministic rules decide whether a request belongs in the domain before a token is generated. The optional classifier can only tighten that decision.",
        bullets: ["Allowed and prohibited topics", "Confidence thresholds", "Reason codes on every decision"],
      },
      {
        title: "Answers with a source",
        body: "Retrieval is limited to the knowledge bases attached to the assistant, and the response keeps the document and chunk it came from.",
        bullets: ["Approved sources only", "Per-answer citations", "Refusal when nothing is found"],
      },
      {
        title: "Evidence you can replay",
        body: "Policy version, evaluator version, decision, latency and token counts are stored for every request.",
        bullets: ["Append-only audit trail", "Idempotent retries", "Usage per assistant and per key"],
      },
    ],
    related: [
      { label: "Policy engine", href: "/platform/policy-engine" },
      { label: "Grounded answers", href: "/platform/grounded-answers" },
      { label: "See the API", href: "/resources/api" },
    ],
  },
  {
    path: "/platform/policy-engine",
    nav: "Policy engine",
    eyebrow: "Platform · Policy engine",
    title: "Refusals are the feature.",
    summary:
      "The engine decides allow, refuse, clarify or escalate before generation. It is rules-first, deterministic, and fast enough to run on every message.",
    sections: [
      {
        title: "Rules first, model second",
        body: "Topic matching, prohibited topics, escalation keywords and response constraints run in microseconds. A model classifier is optional and can only make a decision stricter.",
        bullets: ["Deterministic, versioned rules", "Classifier can tighten, never loosen", "Fail-closed by default"],
      },
      {
        title: "Thresholds you control",
        body: "Two numbers decide the boundary: below the clarify threshold the request is out of domain, above the allow threshold it is answered.",
        bullets: ["allow_threshold and clarify_threshold", "Per-assistant configuration", "Every change is versioned"],
      },
      {
        title: "Test before you ship",
        body: "Run labelled cases through the current rules and read accuracy, false acceptance and false rejection separately.",
        bullets: ["Batch evaluation endpoint", "False-acceptance tracking", "No model call required"],
      },
    ],
    related: [
      { label: "Grounded answers", href: "/platform/grounded-answers" },
      { label: "Policy lab in the console", href: "/dashboard/policies" },
      { label: "Healthcare example", href: "/solutions/healthcare" },
    ],
  },
  {
    path: "/platform/grounded-answers",
    nav: "Grounded answers",
    eyebrow: "Platform · Grounding",
    title: "If it isn't in your sources, it isn't in the answer.",
    summary:
      "The assistant answers from the documents you attach and nothing else. When retrieval comes back empty, it says so instead of improvising.",
    sections: [
      {
        title: "Retrieval is scoped",
        body: "Only the knowledge bases attached to the assistant are searched. A document in another workspace is invisible, not just filtered out.",
        bullets: ["Per-assistant knowledge bases", "Tenant-scoped queries", "Chunk-level citations"],
      },
      {
        title: "Citations on every answer",
        body: "Each response carries the document title, chunk index and page number so a support agent can check the claim in one click.",
        bullets: ["Document and chunk references", "Page numbers when available", "Stored with the message"],
      },
      {
        title: "Honest when unsure",
        body: "If no approved source covers the question, the assistant asks a clarifying question or refuses — depending on the policy you set.",
        bullets: ["Clarify or refuse", "No invented facts", "Escalation keywords"],
      },
    ],
    related: [
      { label: "Policy engine", href: "/platform/policy-engine" },
      { label: "Knowledge pipeline", href: "/resources/docs" },
      { label: "Retail example", href: "/solutions/retail" },
    ],
  },

  // -- Solutions ------------------------------------------------------------
  {
    path: "/solutions",
    nav: "Solutions",
    eyebrow: "Solutions",
    title: "The same guardrail, tuned to your industry.",
    summary:
      "The pipeline is shared; the domain is not. Pick the closest starting point and edit the topics, refusals and escalation rules.",
    sections: [
      {
        title: "Pick your vertical",
        body: "Each solution ships with a policy you can copy: what the assistant may answer, what it must refuse, and where it hands over to a person.",
        bullets: ["SaaS", "Healthcare", "Education", "Retail", "Fintech"],
      },
      {
        title: "Same evidence everywhere",
        body: "Whatever the vertical, you get the same audit trail, citations and usage controls.",
        bullets: ["Per-request audit", "Citations", "Quota controls"],
      },
    ],
    related: [
      { label: "SaaS", href: "/solutions/saas" },
      { label: "Healthcare", href: "/solutions/healthcare" },
      { label: "Fintech", href: "/solutions/fintech" },
    ],
  },
  {
    path: "/solutions/saas",
    nav: "SaaS",
    eyebrow: "Solutions · SaaS",
    title: "Deflect the tickets that have an answer.",
    summary:
      "An in-product assistant that handles onboarding, plan questions and how-to requests — and refuses anything that needs an account decision.",
    sections: INDUSTRY_SECTIONS(
      "SaaS",
      ["Onboarding and setup", "Feature how-tos", "Plan and billing FAQ", "Status and incident links"],
      ["Account-specific pricing", "Legal or tax advice", "Contract negotiation", "Security questionnaires"],
      'allowed_topics: ["onboarding", "billing faq", "integrations"]',
    ),
    related: [
      { label: "Grounding", href: "/platform/grounded-answers" },
      { label: "Education", href: "/solutions/education" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    path: "/solutions/healthcare",
    nav: "Healthcare",
    eyebrow: "Solutions · Healthcare",
    title: "Front-desk answers, never a diagnosis.",
    summary:
      "Hours, locations, insurance accepted and appointment logistics — with clinical questions escalated to a person, every time.",
    sections: INDUSTRY_SECTIONS(
      "clinic",
      [
        "Opening hours and location",
        "Which insurance is accepted",
        "How to book or move an appointment",
        "Preparation instructions from your own documents",
      ],
      ["Diagnosis or symptoms", "Dosage or medication advice", "Emergency triage", "Anything about a named patient"],
      'prohibited_topics: ["diagnosis", "dosage", "emergency"]',
    ),
    related: [
      { label: "Policy engine", href: "/platform/policy-engine" },
      { label: "Enterprise controls", href: "/enterprise" },
      { label: "Education", href: "/solutions/education" },
    ],
  },
  {
    path: "/solutions/education",
    nav: "Education",
    eyebrow: "Solutions · Education",
    title: "Admissions answers, without the queue.",
    summary: "Deadlines, entry requirements, fees and campus life, grounded in the prospectus you already publish.",
    sections: INDUSTRY_SECTIONS(
      "university",
      ["Application deadlines", "Entry requirements", "Tuition and fees", "Campus and accommodation questions"],
      [
        "Visa or immigration advice",
        "Individual admission decisions",
        "Grades of a named student",
        "Scholarship promises",
      ],
      'allowed_topics: ["deadlines", "entry requirements", "fees"]',
    ),
    related: [
      { label: "Grounding", href: "/platform/grounded-answers" },
      { label: "SaaS", href: "/solutions/saas" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    path: "/solutions/retail",
    nav: "Retail",
    eyebrow: "Solutions · Retail",
    title: "Order questions, answered from the source.",
    summary:
      "Shipping windows, returns policy, sizing and stock — read from your own policy pages so the answer matches what legal approved.",
    sections: INDUSTRY_SECTIONS(
      "retail",
      ["Delivery windows and tracking", "Returns and exchanges policy", "Sizing and materials", "Product care"],
      ["Refunds outside policy", "Price matching", "Discount codes", "Complaints about a named order"],
      'allowed_topics: ["delivery", "returns", "sizing"]',
    ),
    related: [
      { label: "Grounding", href: "/platform/grounded-answers" },
      { label: "Fintech", href: "/solutions/fintech" },
      { label: "See the API", href: "/resources/api" },
    ],
  },
  {
    path: "/solutions/fintech",
    nav: "Fintech",
    eyebrow: "Solutions · Fintech",
    title: "Explain the product. Never give advice.",
    summary:
      "Fee schedules, required documents and how the product works — with anything that looks like investment or tax advice refused and logged.",
    sections: INDUSTRY_SECTIONS(
      "financial",
      ["How the product works", "Fee schedule", "Documents needed for verification", "Supported countries"],
      ["Investment or tax advice", "Account balances", "Credit decisions", "Regulatory interpretation"],
      'prohibited_topics: ["investment advice", "tax advice", "balances"]',
    ),
    related: [
      { label: "Policy engine", href: "/platform/policy-engine" },
      { label: "Audit trail", href: "/enterprise" },
      { label: "SaaS", href: "/solutions/saas" },
    ],
  },

  // -- Resources ------------------------------------------------------------
  {
    path: "/resources",
    nav: "Resources",
    eyebrow: "Resources",
    title: "Everything you need to ship it.",
    summary: "Documentation, the API reference and a changelog that says what actually changed.",
    sections: [
      {
        title: "Start with the quickstart",
        body: "Create a workspace, define one assistant and send a request. The mock provider means you can try the whole pipeline without a bill.",
        bullets: ["Quickstart", "Authentication", "Idempotency"],
      },
      {
        title: "Then read the reference",
        body: "The OpenAPI schema is generated from the code, so the docs and the API cannot disagree.",
        bullets: ["REST endpoints", "Error envelope", "Rate limits"],
      },
      {
        title: "Know what changed",
        body: "Every release is listed with the endpoints and behaviours that moved.",
        bullets: ["Versioned changelog", "Breaking changes called out", "Migration notes"],
      },
    ],
    related: [
      { label: "Docs", href: "/resources/docs" },
      { label: "API reference", href: "/resources/api" },
      { label: "Changelog", href: "/resources/changelogs" },
    ],
  },
  {
    path: "/resources/docs",
    nav: "Docs",
    eyebrow: "Resources · Docs",
    title: "Quickstart in four calls.",
    summary: "Log in, create a workspace, create an assistant, send a message. That is the whole integration.",
    sections: [
      {
        title: "Authentication",
        body: "Two credentials, two purposes. A bearer token drives the console; a bb- key drives server-to-server chat.",
        bullets: [
          "Access token: 15 minutes",
          "Refresh token: 7 days, rotating",
          "API keys: bb- followed by 47 characters",
        ],
      },
      {
        title: "Send a message",
        body: "One endpoint returns the answer, the decision that produced it, the sources behind it and what it cost.",
        bullets: [
          "POST /api/v1/chat/completions/",
          "Idempotency-Key for safe retries",
          "Citations and usage in the response",
        ],
      },
      {
        title: "Handle refusals",
        body: "A refusal is a normal response, not an error. Branch on decision, not on the HTTP status.",
        bullets: [
          "decision: ALLOW | REFUSE | CLARIFY | ESCALATE",
          "reason_code for reporting",
          "Fallback copy you control",
        ],
      },
    ],
    related: [
      { label: "API reference", href: "/resources/api" },
      { label: "Changelog", href: "/resources/changelogs" },
      { label: "Platform", href: "/platform" },
    ],
  },
  {
    path: "/resources/api",
    nav: "API",
    eyebrow: "Resources · API",
    title: "REST, versioned, generated from the code.",
    summary:
      "The OpenAPI schema is produced from the views themselves, so the reference is never a hand-written approximation.",
    sections: [
      {
        title: "Conventions",
        body: "JSON in, JSON out, an error envelope on every failure, and a request id you can quote in a support thread.",
        bullets: [
          "{ error: { code, message, details, request_id } }",
          "Retry-After on 429",
          "Cursor-free pagination with page and page_size",
        ],
      },
      {
        title: "Endpoints",
        body: "Assistants, policies, knowledge, chat, conversations, usage, audit and keys — all tenant-scoped.",
        bullets: [
          "/assistants/ and /assistants/{id}/policy/",
          "/knowledge-bases/ and /documents/",
          "/chat/completions/",
        ],
      },
      {
        title: "Try it",
        body: "The interactive reference runs against this deployment. Sign in for a token, then send a real request.",
        bullets: ["Swagger UI", "ReDoc", "OpenAPI JSON"],
      },
    ],
    related: [
      { label: "Docs", href: "/resources/docs" },
      { label: "Changelog", href: "/resources/changelogs" },
      { label: "Enterprise", href: "/enterprise" },
    ],
  },
  {
    path: "/resources/changelogs",
    nav: "Changelogs",
    eyebrow: "Resources · Changelog",
    title: "What changed, and when.",
    summary: "A short, dated list. Breaking changes are called out separately so an upgrade never surprises you.",
    sections: [
      {
        title: "Unreleased",
        body: "Work in progress, not yet deployed.",
        bullets: ["Per-workspace provider credentials in the console", "Streaming responses"],
      },
      {
        title: "Current",
        body: "The API as documented today.",
        bullets: [
          "bb- API keys (legacy sk_ keys still accepted)",
          "Assistant draft endpoint",
          "Policy evaluation endpoints",
        ],
      },
      {
        title: "Compatibility promise",
        body: "Additive changes ship in minor releases. Anything that removes or renames a field gets a deprecation window.",
        bullets: ["Additive fields are safe", "Deprecations announced here first", "No silent behaviour changes"],
      },
    ],
    related: [
      { label: "API reference", href: "/resources/api" },
      { label: "Docs", href: "/resources/docs" },
      { label: "Platform", href: "/platform" },
    ],
  },

  // -- Top-level ------------------------------------------------------------
  {
    path: "/docs",
    nav: "Docs",
    eyebrow: "Documentation",
    title: "Read it, then send a request.",
    summary:
      "The quickstart, the API reference and the changelog live together. Start at the top and work down — the whole integration is four calls.",
    sections: [
      {
        title: "First, the model of the system",
        body: "A workspace owns assistants, keys and knowledge. An assistant owns a policy. A policy decides what may be answered.",
        bullets: [
          "Workspace → assistant → policy",
          "Keys are scoped to a workspace",
          "Knowledge is attached per assistant",
        ],
      },
      {
        title: "Then the request",
        body: "Chat is one POST. The response tells you what was decided, what was cited and what it cost.",
        bullets: ["POST /api/v1/chat/completions/", "Bearer bb-…", "Idempotency-Key"],
      },
      {
        title: "When something goes wrong",
        body: "Errors are structured, and the request id ties the response to the server log line.",
        bullets: ["Stable error codes", "request_id on every response", "Retry-After on rate limits"],
      },
    ],
    block: "developers",
    related: [
      { label: "API reference", href: "/resources/api" },
      { label: "Changelog", href: "/resources/changelogs" },
      { label: "Platform", href: "/platform" },
    ],
  },
  {
    path: "/enterprise",
    nav: "Enterprise",
    eyebrow: "Enterprise",
    title: "Tenancy, audit and deployment you can defend.",
    summary:
      "The parts a security review asks about: how tenants are separated, what is recorded, and where the software runs.",
    sections: [
      {
        title: "Isolation",
        body: "Every query is scoped to the workspace before it runs, and a cross-tenant lookup returns 404 rather than a hint that the object exists.",
        bullets: [
          "Organisation filter on every queryset",
          "Service-layer ownership checks",
          "404 instead of 403 on foreign ids",
        ],
      },
      {
        title: "Evidence",
        body: "Role changes, key rotations, policy edits and assistant status changes are recorded with the actor and the request id.",
        bullets: ["Append-only audit log", "730-day retention by default", "Filter by actor, action and target"],
      },
      {
        title: "Deployment",
        body: "Run it on your own infrastructure when data cannot leave your network. Docker Compose for a single host, or the same containers on your platform of choice.",
        bullets: [
          "Self-hosted API and console",
          "Postgres + Redis only",
          "Provider credentials stay in your environment",
        ],
      },
    ],
    related: [
      { label: "Platform", href: "/platform" },
      { label: "API reference", href: "/resources/api" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    path: "/pricing",
    nav: "Pricing",
    eyebrow: "Pricing",
    title: "Pay for the workspace, not the seat count.",
    summary: "Start free. Move up when you need more assistants, more traffic or more keys.",
    sections: [],
    block: "pricing",
    related: [
      { label: "Enterprise", href: "/enterprise" },
      { label: "Docs", href: "/docs" },
      { label: "Platform", href: "/platform" },
    ],
  },
];

export const PAGE_BY_PATH = new Map(PAGES.map((page) => [page.path, page]));
