import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "Bridle AI",
  version: packageJson.version,
  copyright: `© ${currentYear}, Bridle AI.`,
  meta: {
    title: "Bridle AI — Domain-restricted AI assistants",
    description:
      "Build AI assistants that stay inside an approved domain: enforced policies, grounded answers, cited sources, per-request audit trails and usage controls.",
  },
};
