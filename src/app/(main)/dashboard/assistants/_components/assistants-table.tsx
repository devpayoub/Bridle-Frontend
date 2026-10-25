import Link from "next/link";

import { ChevronRightIcon } from "lucide-react";

import { StatusBadge } from "@/components/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Assistant } from "@/lib/api/types";

const DOMAIN_LABELS: Record<string, string> = {
  HOTEL: "Hotel",
  HOSPITAL: "Hospital",
  ECOMMERCE: "E-commerce",
  BOOKING: "Booking",
  UNIVERSITY: "University",
  GENERIC: "Generic",
  OTHER: "Other",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function AssistantsTable({ assistants }: { assistants: Assistant[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="pl-4">Assistant</TableHead>
          <TableHead>Domain</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Topics</TableHead>
          <TableHead>Updated</TableHead>
          <TableHead className="pr-4" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {assistants.map((assistant) => (
          <TableRow key={assistant.id} className="group">
            <TableCell className="pl-4">
              <div className="flex flex-col gap-0.5">
                <Link
                  href={`/dashboard/assistants/${assistant.id}`}
                  className="font-medium underline-offset-4 group-hover:underline"
                >
                  {assistant.name}
                </Link>
                <span className="max-w-[38ch] truncate text-muted-foreground text-xs">
                  {assistant.description || assistant.slug}
                </span>
              </div>
            </TableCell>
            <TableCell className="text-muted-foreground text-sm">
              {DOMAIN_LABELS[assistant.domain_type] ?? assistant.domain_type}
            </TableCell>
            <TableCell>
              <StatusBadge status={assistant.status} />
            </TableCell>
            <TableCell className="text-right text-sm tabular-nums">
              {assistant.allowed_topics.length}
              {assistant.prohibited_topics.length > 0 ? (
                <span className="text-muted-foreground"> / {assistant.prohibited_topics.length} off-limits</span>
              ) : null}
            </TableCell>
            <TableCell className="text-muted-foreground text-sm tabular-nums">
              {formatDate(assistant.updated_at)}
            </TableCell>
            <TableCell className="pr-4 text-right">
              <Link
                href={`/dashboard/assistants/${assistant.id}`}
                aria-label={`Open ${assistant.name}`}
                className="inline-flex text-muted-foreground transition-colors hover:text-foreground"
              >
                <ChevronRightIcon className="size-4" />
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
