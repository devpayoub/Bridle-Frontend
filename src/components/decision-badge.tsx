import { cn } from "cn";

import { Badge } from "@/components/ui/badge";
import type { PolicyDecisionValue } from "@/lib/api/types";

const TONES: Record<PolicyDecisionValue, string> = {
  ALLOW: "border-emerald-600/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  REFUSE: "border-destructive/30 bg-destructive/10 text-destructive",
  CLARIFY: "border-amber-600/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  ESCALATE: "border-violet-600/20 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  REVIEW: "border-blue-600/20 bg-blue-500/10 text-blue-700 dark:text-blue-300",
};

const LABELS: Record<PolicyDecisionValue, string> = {
  ALLOW: "Allowed",
  REFUSE: "Refused",
  CLARIFY: "Clarify",
  ESCALATE: "Escalated",
  REVIEW: "Review",
};

export function DecisionBadge({
  decision,
  className,
}: {
  decision: PolicyDecisionValue | string | null | undefined;
  className?: string;
}) {
  if (!decision) return null;
  const key = decision as PolicyDecisionValue;
  return (
    <Badge variant="outline" className={cn("gap-1.5 border px-2 py-0.5 font-medium", TONES[key] ?? "", className)}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {LABELS[key] ?? decision}
    </Badge>
  );
}
