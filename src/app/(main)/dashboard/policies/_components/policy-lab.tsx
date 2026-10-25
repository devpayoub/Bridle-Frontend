"use client";

import { useState } from "react";

import { GaugeIcon, PlayIcon, ScanSearchIcon } from "lucide-react";
import { toast } from "sonner";

import { DecisionBadge } from "@/components/decision-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { apiPost } from "@/lib/api/client";
import { ApiError, errorMessage } from "@/lib/api/errors";
import type { Assistant, PolicyEvaluation } from "@/lib/api/types";
import { formatNumber } from "@/lib/format";

function splitList(value: string): string[] {
  return value
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function DecisionPanel({ evaluation, title }: { evaluation: PolicyEvaluation; title: string }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <CardTitle>{title}</CardTitle>
          <CardDescription className="font-mono text-xs">{evaluation.reason_code}</CardDescription>
        </div>
        <DecisionBadge decision={evaluation.decision} />
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm">
        <p className="rounded-lg border bg-muted/40 p-3">{evaluation.message}</p>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-muted-foreground text-xs">Confidence</span>
            <span className="font-medium tabular-nums">
              {evaluation.confidence === null ? "—" : evaluation.confidence.toFixed(2)}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-muted-foreground text-xs">Policy version</span>
            <span className="font-medium tabular-nums">v{evaluation.policy_version}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-muted-foreground text-xs">Evaluator</span>
            <span className="font-medium">
              {evaluation.evaluator} {evaluation.evaluator_version}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-muted-foreground text-xs">Latency</span>
            <span className="font-medium tabular-nums">{formatNumber(evaluation.latency_ms)} ms</span>
          </div>
        </div>

        {evaluation.metadata && Object.keys(evaluation.metadata).length > 0 ? (
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs">Metadata</span>
            <pre className="overflow-x-auto rounded-lg border bg-muted/40 p-3 font-mono text-xs">
              {JSON.stringify(evaluation.metadata, null, 2)}
            </pre>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function PolicyLab({
  assistants,
  initialAssistantId,
}: {
  assistants: Assistant[];
  initialAssistantId?: string;
}) {
  const [assistantId, setAssistantId] = useState(initialAssistantId ?? assistants[0]?.id ?? "inline");
  const [requestText, setRequestText] = useState("");
  const [proposedResponse, setProposedResponse] = useState("");
  const [knowledgeContext, setKnowledgeContext] = useState("");

  const [allowedTopics, setAllowedTopics] = useState("");
  const [prohibitedTopics, setProhibitedTopics] = useState("");
  const [uncertainty, setUncertainty] = useState<"CLARIFY" | "REFUSE">("CLARIFY");
  const [allowThreshold, setAllowThreshold] = useState(0.6);
  const [clarifyThreshold, setClarifyThreshold] = useState(0.34);
  const [knowledgeRequired, setKnowledgeRequired] = useState(false);

  const [pending, setPending] = useState<"request" | "response" | null>(null);
  const [result, setResult] = useState<PolicyEvaluation | null>(null);

  const inline = assistantId === "inline";

  const evaluate = async (mode: "request" | "response") => {
    if (requestText.trim().length === 0) {
      toast.error("Enter a request to evaluate.");
      return;
    }
    if (mode === "response" && proposedResponse.trim().length === 0) {
      toast.error("Enter a proposed response to evaluate.");
      return;
    }

    const payload: Record<string, unknown> = {
      request_text: requestText.trim(),
      proposed_response: proposedResponse.trim(),
      knowledge_context: knowledgeContext.trim(),
    };

    if (inline) {
      payload.policy = {
        allowed_topics: splitList(allowedTopics),
        prohibited_topics: splitList(prohibitedTopics),
        uncertainty_handling: uncertainty,
        allow_threshold: allowThreshold,
        clarify_threshold: clarifyThreshold,
        knowledge_required: knowledgeRequired,
      };
    } else {
      payload.assistant_id = assistantId;
    }

    setPending(mode);
    try {
      const evaluation = await apiPost<PolicyEvaluation>(`/policies/evaluate-${mode}/`, payload);
      setResult(evaluation);
    } catch (error) {
      if (error instanceof ApiError && error.code === "validation_error") {
        toast.error(Object.values(error.fieldErrors)[0]?.[0] ?? error.message);
      } else {
        toast.error(errorMessage(error));
      }
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_24rem]">
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Policy</CardTitle>
            <CardDescription>
              Evaluate against a saved assistant, or paste an inline policy to test a draft.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup className="gap-4">
              <Field className="gap-1.5">
                <FieldLabel htmlFor="lab-assistant">Assistant</FieldLabel>
                <Select value={assistantId} onValueChange={setAssistantId}>
                  <SelectTrigger id="lab-assistant" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {assistants.map((assistant) => (
                      <SelectItem key={assistant.id} value={assistant.id}>
                        {assistant.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="inline">Inline policy (draft)</SelectItem>
                  </SelectContent>
                </Select>
                <FieldDescription>An inline policy is not saved and does not touch any assistant.</FieldDescription>
              </Field>

              {inline ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field className="gap-1.5">
                    <FieldLabel htmlFor="lab-allowed">Allowed topics</FieldLabel>
                    <Textarea
                      id="lab-allowed"
                      rows={2}
                      value={allowedTopics}
                      onChange={(event) => setAllowedTopics(event.target.value)}
                      placeholder="check-in, breakfast"
                    />
                  </Field>
                  <Field className="gap-1.5">
                    <FieldLabel htmlFor="lab-prohibited">Prohibited topics</FieldLabel>
                    <Textarea
                      id="lab-prohibited"
                      rows={2}
                      value={prohibitedTopics}
                      onChange={(event) => setProhibitedTopics(event.target.value)}
                      placeholder="refunds, legal advice"
                    />
                  </Field>
                  <Field className="gap-1.5">
                    <FieldLabel htmlFor="lab-uncertainty">Uncertainty</FieldLabel>
                    <Select
                      value={uncertainty}
                      onValueChange={(value) => setUncertainty(value as "CLARIFY" | "REFUSE")}
                    >
                      <SelectTrigger id="lab-uncertainty" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CLARIFY">Clarify</SelectItem>
                        <SelectItem value="REFUSE">Refuse</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field orientation="horizontal" className="items-center justify-between gap-4 sm:pt-6">
                    <FieldLabel htmlFor="lab-knowledge">Require knowledge</FieldLabel>
                    <Switch id="lab-knowledge" checked={knowledgeRequired} onCheckedChange={setKnowledgeRequired} />
                  </Field>
                  <Field className="gap-1.5">
                    <FieldLabel htmlFor="lab-allow">Allow threshold</FieldLabel>
                    <Input
                      id="lab-allow"
                      type="number"
                      step={0.01}
                      min={0}
                      max={1}
                      value={allowThreshold}
                      onChange={(event) => setAllowThreshold(Number(event.target.value))}
                    />
                  </Field>
                  <Field className="gap-1.5">
                    <FieldLabel htmlFor="lab-clarify">Clarify threshold</FieldLabel>
                    <Input
                      id="lab-clarify"
                      type="number"
                      step={0.01}
                      min={0}
                      max={1}
                      value={clarifyThreshold}
                      onChange={(event) => setClarifyThreshold(Number(event.target.value))}
                    />
                  </Field>
                </div>
              ) : null}
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Request</CardTitle>
            <CardDescription>Screened before any model call, exactly as production traffic is.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup className="gap-4">
              <Field className="gap-1.5">
                <FieldLabel htmlFor="lab-request">User message</FieldLabel>
                <Textarea
                  id="lab-request"
                  rows={3}
                  value={requestText}
                  onChange={(event) => setRequestText(event.target.value)}
                  placeholder="Can I get a refund for last night?"
                />
              </Field>

              <Field className="gap-1.5">
                <FieldLabel htmlFor="lab-response">Proposed response</FieldLabel>
                <Textarea
                  id="lab-response"
                  rows={3}
                  value={proposedResponse}
                  onChange={(event) => setProposedResponse(event.target.value)}
                  placeholder="Optional. Required to run the response check."
                />
                <FieldDescription>
                  The response check looks for banned phrases, disclaimers, PII and grounding.
                </FieldDescription>
              </Field>

              <Field className="gap-1.5">
                <FieldLabel htmlFor="lab-context">Approved context</FieldLabel>
                <Textarea
                  id="lab-context"
                  rows={2}
                  value={knowledgeContext}
                  onChange={(event) => setKnowledgeContext(event.target.value)}
                  placeholder="Optional. Text the response should be grounded in."
                />
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={() => evaluate("request")} disabled={pending !== null}>
            {pending === "request" ? <Spinner className="size-4" /> : <ScanSearchIcon className="size-4" />}
            Evaluate request
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => evaluate("response")}
            disabled={pending !== null || proposedResponse.trim().length === 0}
          >
            {pending === "response" ? <Spinner className="size-4" /> : <PlayIcon className="size-4" />}
            Evaluate response only
          </Button>
          <span className="text-muted-foreground text-xs">Evaluations count against the monthly policy quota.</span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {result ? (
          <>
            <DecisionPanel evaluation={result} title="Request decision" />
            {result.response_evaluation ? (
              <DecisionPanel evaluation={result.response_evaluation} title="Response decision" />
            ) : null}
          </>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center gap-2 py-16 text-center">
              <GaugeIcon className="size-5 text-muted-foreground" />
              <p className="font-medium text-sm">No evaluation yet</p>
              <p className="max-w-[28ch] text-muted-foreground text-sm">
                Send a request to see the decision, reason code and confidence.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
