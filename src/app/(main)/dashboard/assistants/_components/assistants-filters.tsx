"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { SearchIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "DRAFT", label: "Draft" },
  { value: "ACTIVE", label: "Active" },
  { value: "PAUSED", label: "Paused" },
  { value: "ARCHIVED", label: "Archived" },
];

const DOMAIN_OPTIONS = [
  { value: "all", label: "All domains" },
  { value: "HOTEL", label: "Hotel" },
  { value: "HOSPITAL", label: "Hospital" },
  { value: "ECOMMERCE", label: "E-commerce" },
  { value: "BOOKING", label: "Booking" },
  { value: "UNIVERSITY", label: "University" },
  { value: "GENERIC", label: "Generic" },
  { value: "OTHER", label: "Other" },
];

export function AssistantsFilters({ initialSearch }: { initialSearch: string }) {
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
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const value = new FormData(event.currentTarget).get("search");
          update("search", typeof value === "string" ? value : "");
        }}
        className="w-full sm:w-64"
      >
        <InputGroup className="h-8">
          <InputGroupAddon align="inline-start">
            <SearchIcon className="size-3.5" />
          </InputGroupAddon>
          <InputGroupInput
            name="search"
            defaultValue={initialSearch}
            placeholder="Search assistants…"
            className="h-8"
            aria-label="Search assistants"
          />
        </InputGroup>
      </form>

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

      <Select value={searchParams.get("domain_type") ?? "all"} onValueChange={(value) => update("domain_type", value)}>
        <SelectTrigger size="sm" aria-label="Filter by domain">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {DOMAIN_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.replace("?")}
        className="text-muted-foreground"
        type="button"
      >
        Reset
      </Button>
    </div>
  );
}
