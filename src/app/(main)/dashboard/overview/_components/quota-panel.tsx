import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { QuotaState } from "@/lib/api/types";

function formatPeriodEnd(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function QuotaRow({ label, quota }: { label: string; quota: QuotaState }) {
  const percent = quota.limit > 0 ? Math.min(100, Math.round((quota.used / quota.limit) * 100)) : 0;
  const isTight = percent >= 85;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-medium text-sm">{label}</span>
        <span
          className={isTight ? "text-destructive text-sm tabular-nums" : "text-muted-foreground text-sm tabular-nums"}
        >
          {quota.used.toLocaleString()} / {quota.limit.toLocaleString()}
        </span>
      </div>
      <Progress value={percent} className="h-2" />
      <p className="text-muted-foreground text-xs">
        {quota.remaining.toLocaleString()} remaining · resets {formatPeriodEnd(quota.period_end)}
      </p>
    </div>
  );
}

export function QuotaPanel({
  chat,
  policy,
  planCode,
}: {
  chat: QuotaState;
  policy: QuotaState;
  planCode: string | null;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Plan usage</CardTitle>
        <CardDescription>
          {planCode ? `Current plan: ${planCode}` : "Current billing period"} — limits are enforced before each model
          call.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <QuotaRow label="Chat requests" quota={chat} />
        <QuotaRow label="Policy evaluations" quota={policy} />
      </CardContent>
    </Card>
  );
}
