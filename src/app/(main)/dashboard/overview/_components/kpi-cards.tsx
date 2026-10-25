import { cn } from "cn";
import { ArrowDownRightIcon, ArrowUpRightIcon, MinusIcon } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export type Kpi = {
  label: string;
  value: string;
  hint?: string;
  trend?: "up" | "down" | "flat";
};

function TrendIcon({ trend }: { trend: Kpi["trend"] }) {
  if (trend === "up") return <ArrowUpRightIcon className="size-3.5 text-emerald-600 dark:text-emerald-400" />;
  if (trend === "down") return <ArrowDownRightIcon className="size-3.5 text-destructive" />;
  return <MinusIcon className="size-3.5 text-muted-foreground" />;
}

export function KpiCards({ items }: { items: Kpi[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label} className="gap-3">
          <CardHeader className="gap-1">
            <CardDescription>{item.label}</CardDescription>
            <CardTitle className="text-2xl tabular-nums">{item.value}</CardTitle>
          </CardHeader>
          {item.hint ? (
            <CardContent className={cn("flex items-center gap-1 text-muted-foreground text-xs")}>
              <TrendIcon trend={item.trend} />
              <span>{item.hint}</span>
            </CardContent>
          ) : null}
        </Card>
      ))}
    </div>
  );
}
