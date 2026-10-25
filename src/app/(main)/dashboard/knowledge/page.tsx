import Link from "next/link";

import { BookOpenIcon, ChevronRightIcon, FileTextIcon } from "lucide-react";
import type { Metadata } from "next";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { serverFetch } from "@/lib/api/server";
import type { KnowledgeBase, Paginated } from "@/lib/api/types";
import { formatDate } from "@/lib/format";
import { requireTenant } from "@/lib/tenant/server";

import { KnowledgeBaseDialog } from "./_components/knowledge-base-dialog";

export const metadata: Metadata = {
  title: "Knowledge",
};

export default async function KnowledgePage() {
  const tenant = await requireTenant();
  const data = await serverFetch<Paginated<KnowledgeBase>>("/knowledge-bases/", { query: { page_size: 100 } });
  const canWrite = tenant.session.capabilities.includes("knowledge:write");

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Knowledge"
        description="Approved sources only. Retrieval is scoped to the bases attached to each assistant."
        actions={canWrite ? <KnowledgeBaseDialog /> : null}
      />

      {data.results.length === 0 ? (
        <Card>
          <CardContent>
            <Empty className="border-none py-16">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <BookOpenIcon />
                </EmptyMedia>
                <EmptyTitle>No knowledge bases yet</EmptyTitle>
                <EmptyDescription>
                  Create a knowledge base, upload documents, then attach it to an assistant so answers can cite it.
                </EmptyDescription>
              </EmptyHeader>
              {canWrite ? (
                <EmptyContent>
                  <KnowledgeBaseDialog />
                </EmptyContent>
              ) : null}
            </Empty>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.results.map((knowledgeBase) => (
            <Link
              key={knowledgeBase.id}
              href={`/dashboard/knowledge/${knowledgeBase.id}`}
              className="group rounded-xl border bg-card transition-colors hover:border-ring/60 hover:bg-muted/30"
            >
              <div className="flex h-full flex-col gap-4 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                    <BookOpenIcon className="size-4" />
                  </div>
                  <ChevronRightIcon className="mt-1 size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </div>

                <div className="flex flex-col gap-1">
                  <h2 className="font-medium leading-tight">{knowledgeBase.name}</h2>
                  <p className="line-clamp-2 text-muted-foreground text-sm">
                    {knowledgeBase.description || "No description."}
                  </p>
                </div>

                <div className="mt-auto flex items-center justify-between text-muted-foreground text-xs">
                  <span className="inline-flex items-center gap-1.5">
                    <FileTextIcon className="size-3.5" />
                    {knowledgeBase.document_count} document{knowledgeBase.document_count === 1 ? "" : "s"}
                  </span>
                  <span>Updated {formatDate(knowledgeBase.updated_at)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>How grounding works</CardTitle>
          <CardDescription>The pipeline never retrieves outside the attached bases.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-3">
          <div className="flex flex-col gap-1 rounded-lg border p-3">
            <span className="font-medium">1. Upload</span>
            <span className="text-muted-foreground">
              PDF, DOCX, HTML, Markdown or text. Files are scanned and parsed in a background job.
            </span>
          </div>
          <div className="flex flex-col gap-1 rounded-lg border p-3">
            <span className="font-medium">2. Chunk</span>
            <span className="text-muted-foreground">
              Content is split into overlapping chunks with page references preserved for citations.
            </span>
          </div>
          <div className="flex flex-col gap-1 rounded-lg border p-3">
            <span className="font-medium">3. Cite</span>
            <span className="text-muted-foreground">
              Answers carry the document and chunk they came from, or are refused when grounding is required.
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
