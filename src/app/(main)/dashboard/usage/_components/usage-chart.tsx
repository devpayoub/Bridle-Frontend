"use client";

import { useEffect, useState } from "react";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { UsageByAssistant } from "@/lib/api/types";

export function UsageByAssistantChart({ data }: { data: UsageByAssistant["results"] }) {
  // ResponsiveContainer measures its parent, which is 0×0 during SSR; render it
  // only after mount so the server output stays clean and hydration matches.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const rows = data.map((row) => ({
    name: row.assistant_name,
    answered: row.successful,
    refused: row.refused,
  }));

  if (rows.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground text-sm">
        No traffic in this period.
      </div>
    );
  }

  if (!mounted) {
    return <div className="h-64 w-full" aria-hidden />;
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            interval={0}
            angle={rows.length > 4 ? -18 : 0}
            textAnchor={rows.length > 4 ? "end" : "middle"}
            height={rows.length > 4 ? 56 : 28}
          />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
          <Tooltip
            cursor={{ fill: "var(--muted)", opacity: 0.4 }}
            contentStyle={{
              background: "var(--popover)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              color: "var(--popover-foreground)",
              fontSize: 12,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: "var(--muted-foreground)" }} />
          <Bar dataKey="answered" name="Answered" stackId="requests" fill="var(--chart-2)" radius={[0, 0, 0, 0]} />
          <Bar dataKey="refused" name="Refused" stackId="requests" fill="var(--chart-4)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
