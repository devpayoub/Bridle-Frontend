import type { MenuArtVariant } from "../_components/menu-art";

export type MenuLink = { label: string; href: string };

export type FeatureColumn = {
  kind: "feature";
  eyebrow: string;
  title: string;
  href: string;
  cta: string;
  art: MenuArtVariant;
  links: MenuLink[];
};

export type ListColumn = { kind: "list"; eyebrow: string; links: MenuLink[] };

export type StoryColumn = {
  kind: "story";
  eyebrow: string;
  title: string;
  href: string;
  cta: string;
  art: MenuArtVariant;
};

export type MegaMenu = {
  label: string;
  /** Where the menu's own page lives. */
  href: string;
  columns: [FeatureColumn, ListColumn, StoryColumn];
};

/**
 * Menu contents.
 *
 * Every href here resolves to a page in `_content/marketing.ts`; the catch-all
 * route renders them, so a link can never point at a 404.
 */
export const MENUS: MegaMenu[] = [
  {
    label: "Platform",
    href: "/platform",
    columns: [
      {
        kind: "feature",
        eyebrow: "Platform",
        title: "One pipeline between your customers and the model.",
        href: "/platform",
        cta: "Explore the platform",
        art: "cube",
        links: [
          { label: "Policy engine", href: "/platform/policy-engine" },
          { label: "Grounded answers", href: "/platform/grounded-answers" },
        ],
      },
      {
        kind: "list",
        eyebrow: "Capabilities",
        links: [
          { label: "Overview", href: "/platform" },
          { label: "Policy engine", href: "/platform/policy-engine" },
          { label: "Grounded answers", href: "/platform/grounded-answers" },
          { label: "Audit and tenancy", href: "/enterprise" },
        ],
      },
      {
        kind: "story",
        eyebrow: "From the docs",
        title: "A refusal is a 200, not an error.",
        href: "/resources/docs",
        cta: "Read the guide",
        art: "grid",
      },
    ],
  },
  {
    label: "Solutions",
    href: "/solutions",
    columns: [
      {
        kind: "feature",
        eyebrow: "Solutions",
        title: "The same guardrail, tuned to your industry.",
        href: "/solutions",
        cta: "All solutions",
        art: "rings",
        links: [
          { label: "SaaS", href: "/solutions/saas" },
          { label: "Healthcare", href: "/solutions/healthcare" },
          { label: "Fintech", href: "/solutions/fintech" },
        ],
      },
      {
        kind: "list",
        eyebrow: "Industries",
        links: [
          { label: "SaaS", href: "/solutions/saas" },
          { label: "Healthcare", href: "/solutions/healthcare" },
          { label: "Education", href: "/solutions/education" },
          { label: "Retail", href: "/solutions/retail" },
          { label: "Fintech", href: "/solutions/fintech" },
        ],
      },
      {
        kind: "story",
        eyebrow: "From the docs",
        title: "Copy a policy, then edit the topics.",
        href: "/resources/docs",
        cta: "See the policy shape",
        art: "cube",
      },
    ],
  },
  {
    label: "Resources",
    href: "/resources",
    columns: [
      {
        kind: "feature",
        eyebrow: "Resources",
        title: "Everything you need to ship it.",
        href: "/resources",
        cta: "Browse resources",
        art: "grid",
        links: [
          { label: "Quickstart", href: "/resources/docs" },
          { label: "API reference", href: "/resources/api" },
        ],
      },
      {
        kind: "list",
        eyebrow: "Reference",
        links: [
          { label: "Docs", href: "/resources/docs" },
          { label: "API", href: "/resources/api" },
          { label: "Changelogs", href: "/resources/changelogs" },
          { label: "Documentation hub", href: "/docs" },
        ],
      },
      {
        kind: "story",
        eyebrow: "From the docs",
        title: "bb- keys: 50 characters, shown once.",
        href: "/resources/api",
        cta: "Read the auth guide",
        art: "rings",
      },
    ],
  },
];

export const DIRECT_LINKS: MenuLink[] = [
  { label: "Docs", href: "/docs" },
  { label: "Enterprise", href: "/enterprise" },
  { label: "Pricing", href: "/pricing" },
];
