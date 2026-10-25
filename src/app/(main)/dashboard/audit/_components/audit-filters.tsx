"use client";

import { useEffect, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { SearchIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { AUDIT_ACTION_OPTIONS } from "./action-labels";

const TARGET_TYPES = [
  "organization",
  "member",
  "api_key",
  "assistant",
  "policy",
  "knowledge_base",
  "document",
  "conversation",
  "user",
];

export function AuditFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [targetId, setTargetId] = useState(searchParams.get("target_id") ?? "");

  useEffect(() => {
    setTargetId(searchParams.get("target_id") ?? "");
  }, [searchParams]);

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
      <Select value={searchParams.get("action") ?? "all"} onValueChange={(value) => update("action", value)}>
        <SelectTrigger size="sm" aria-label="Filter by action">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All actions</SelectItem>
          {AUDIT_ACTION_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={searchParams.get("target_type") ?? "all"} onValueChange={(value) => update("target_type", value)}>
        <SelectTrigger size="sm" aria-label="Filter by target type">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All targets</SelectItem>
          {TARGET_TYPES.map((option) => (
            <SelectItem key={option} value={option}>
              {option.replace("_", " ")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <form
        className="flex items-center gap-1.5"
        onSubmit={(event) => {
          event.preventDefault();
          update("target_id", targetId.trim());
        }}
      >
        <Input
          value={targetId}
          onChange={(event) => setTargetId(event.target.value)}
          placeholder="Target id"
          aria-label="Filter by target id"
          className="h-7 w-44 font-mono text-xs"
        />
        <Button type="submit" variant="outline" size="icon-sm" aria-label="Apply target id filter">
          <SearchIcon className="size-4" />
        </Button>
      </form>

      <Button variant="ghost" size="sm" onClick={() => router.replace("?")} className="text-muted-foreground">
        Reset
      </Button>
    </div>
  );
}
