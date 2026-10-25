"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Assistant } from "@/lib/api/types";

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "CLOSED", label: "Closed" },
  { value: "ANONYMIZED", label: "Anonymised" },
];

export function ConversationFilters({ assistants }: { assistants: Assistant[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams.toString());
    if (!value || value === "all") {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    next.delete("page");
    const query = next.toString();
    router.replace(query ? `?${query}` : "?");
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={searchParams.get("assistant_id") ?? "all"}
        onValueChange={(value) => update("assistant_id", value)}
      >
        <SelectTrigger size="sm" aria-label="Filter by assistant">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All assistants</SelectItem>
          {assistants.map((assistant) => (
            <SelectItem key={assistant.id} value={assistant.id}>
              {assistant.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={searchParams.get("status") ?? "all"} onValueChange={(value) => update("status", value)}>
        <SelectTrigger size="sm" aria-label="Filter by status">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button variant="ghost" size="sm" onClick={() => router.replace("?")} className="text-muted-foreground">
        Reset
      </Button>
    </div>
  );
}
