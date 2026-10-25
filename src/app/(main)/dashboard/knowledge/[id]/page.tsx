import Link from "next/link";
import { notFound } from "next/navigation";

import { ArrowLeftIcon, FileTextIcon } from "lucide-react";
import type { Metadata } from "next";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { ApiError } from "@/lib/api/errors";
import { serverFetch } from "@/lib/api/server";
import type { Document, KnowledgeBase, Paginated } from "@/lib/api/types";
import { formatDate } from "@/lib/format";
import { requireTenant } from "@/lib/tenant/server";

import { DocumentUpload } from "../_components/document-upload";
import { DocumentsTable } from "../_components/documents-table";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const knowledgeBase = await serverFetch<KnowledgeBase>(`/knowledge-bases/${id}/`);
    return { title: knowledgeBase.name };
  } catch {
    return { title: "Knowledge base" };
  }
}

export default async function KnowledgeBasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tenant = await requireTenant();

  let knowledgeBase: KnowledgeBase;
  try {
    knowledgeBase = await serverFetch<KnowledgeBase>(`/knowledge-bases/${id}/`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  const documents = await serverFetch<Paginated<Document>>(`/knowledge-bases/${id}/documents/`, {
    query: { page_size: 100 },
  });

  const canWrite = tenant.session.capabilities.includes("knowledge:write");
  const ready = documents.results.filter((document) => document.status === "READY").length;
  const failed = documents.results.filter((document) => document.status === "FAILED").length;
  const processing = documents.results.filter(
    (document) => document.status === "PENDING" || document.status === "PROCESSING",
  ).length;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 text-muted-foreground">
          <Link href="/dashboard/knowledge">
            <ArrowLeftIcon className="size-4" />
            Knowledge
          </Link>
        </Button>
      </div>

      <PageHeader title={knowledgeBase.name} description={knowledgeBase.description || `Slug: ${knowledgeBase.slug}`} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-1 rounded-lg border p-3">
          <span className="text-muted-foreground text-xs">Documents</span>
          <span className="font-semibold text-lg tabular-nums">{knowledgeBase.document_count}</span>
        </div>
        <div className="flex flex-col gap-1 rounded-lg border p-3">
          <span className="text-muted-foreground text-xs">Ready</span>
          <span className="font-semibold text-lg tabular-nums">{ready}</span>
        </div>
        <div className="flex flex-col gap-1 rounded-lg border p-3">
          <span className="text-muted-foreground text-xs">Processing</span>
          <span className="font-semibold text-lg tabular-nums">{processing}</span>
        </div>
        <div className="flex flex-col gap-1 rounded-lg border p-3">
          <span className="text-muted-foreground text-xs">Failed</span>
          <span className="font-semibold text-lg tabular-nums">{failed}</span>
        </div>
      </div>

      {canWrite ? (
        <Card>
          <CardHeader>
            <CardTitle>Upload a document</CardTitle>
            <CardDescription>
              PDF, DOCX, HTML, Markdown or plain text. Ingestion runs asynchronously — the status updates here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DocumentUpload knowledgeBaseId={knowledgeBase.id} />
          </CardContent>
        </Card>
      ) : null}

      <Card className="overflow-hidden py-0">
        <CardContent className="px-0">
          {documents.results.length === 0 ? (
            <Empty className="border-none py-16">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FileTextIcon />
                </EmptyMedia>
                <EmptyTitle>No documents yet</EmptyTitle>
                <EmptyDescription>
                  Upload the source material this base should answer from. Nothing outside these files is retrieved.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <DocumentsTable documents={documents.results} canWrite={canWrite} />
          )}
        </CardContent>
      </Card>

      <p className="text-muted-foreground text-xs">Created {formatDate(knowledgeBase.created_at)}</p>
    </div>
  );
}
