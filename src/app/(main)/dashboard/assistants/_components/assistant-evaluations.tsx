"use client";

import { useState } from "react";

import { PlayIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { DecisionBadge } from "@/components/decision-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiPost } from "@/lib/api/client";
import { errorMessage } from "@/lib/api/errors";
import type { EvaluationCase, EvaluationReport, PolicyDecisionValue } from "@/lib/api/types";

type DraftCase = EvaluationCase & { key: string };

const DECISIONS: PolicyDecisionValue[] = ["ALLOW", "REFUSE", "CLARIFY", "ESCALATE", "REVIEW"];

function newCase(): DraftCase {
  return {
    key: crypto.randomUUID(),
    input: "",
    expected_decision: "ALLOW",
    has_knowledge: true,
    note: "",
  };
}

export function AssistantEvaluations({ assistantId, canEvaluate }: { assistantId: string; canEvaluate: boolean }) {
  const [cases, setCases] = useState<DraftCase[]>([newCase()]);
  const [pending, setPending] = useState(false);
  const [report, setReport] = useState<EvaluationReport | null>(null);

  const update = (key: string, patch: Partial<DraftCase>) => {
    setCases((current) => current.map((item) => (item.key === key ? { ...item, ...patch } : item)));
  };

  const run = async () => {
    const filled = cases.filter((item) => item.input.trim().length > 0);
    if (filled.length === 0) {
      toast.error("Add at least one case with an input.");
      return;
    }

    setPending(true);
    try {
      const result = await apiPost<EvaluationReport>(`/assistants/${assistantId}/evaluations/`, {
        cases: filled.map(({ input, expected_decision, has_knowledge, note }) => ({
          input: input.trim(),
          expected_decision,
          has_knowledge: Boolean(has_knowledge),
          note: note?.trim() ?? "",
        })),
      });
      setReport(result);
      toast.success(`Ran ${result.summary.total} case${result.summary.total === 1 ? "" : "s"}.`);
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Evaluation set</CardTitle>
          <CardDescription>
            Label a handful of requests and run them through the current policy. Nothing is sent to a model.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {cases.map((item, index) => (
            <div key={item.key} className="flex flex-col gap-3 rounded-lg border p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-muted-foreground text-xs">Case {index + 1}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Remove case"
                  className="text-muted-foreground hover:text-destructive"
                  disabled={cases.length === 1}
                  onClick={() => setCases((current) => current.filter((entry) => entry.key !== item.key))}
                >
                  <Trash2Icon className="size-4" />
                </Button>
              </div>

              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_10rem_auto]">
                <Field className="gap-1.5">
                  <FieldLabel htmlFor={`case-input-${item.key}`}>Request</FieldLabel>
                  <Input
                    id={`case-input-${item.key}`}
                    value={item.input}
                    onChange={(event) => update(item.key, { input: event.target.value })}
                    placeholder="Can I get a refund for last night?"
                  />
                </Field>

                <Field className="gap-1.5">
                  <FieldLabel htmlFor={`case-decision-${item.key}`}>Expected</FieldLabel>
                  <Select
                    value={item.expected_decision}
                    onValueChange={(value) => update(item.key, { expected_decision: value as PolicyDecisionValue })}
                  >
                    <SelectTrigger id={`case-decision-${item.key}`} className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DECISIONS.map((decision) => (
                        <SelectItem key={decision} value={decision}>
                          {decision}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field orientation="horizontal" className="items-center gap-3 lg:pt-6">
                  <FieldLabel htmlFor={`case-knowledge-${item.key}`} className="whitespace-nowrap">
                    Has knowledge
                  </FieldLabel>
                  <Switch
                    id={`case-knowledge-${item.key}`}
                    checked={Boolean(item.has_knowledge)}
                    onCheckedChange={(checked) => update(item.key, { has_knowledge: checked })}
                  />
                </Field>
              </div>
            </div>
          ))}

          <div className="flex flex-wrap items-center justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCases((current) => [...current, newCase()])}
            >
              <PlusIcon className="size-4" />
              Add case
            </Button>

            <Button type="button" size="sm" onClick={run} disabled={pending || !canEvaluate}>
              {pending ? <Spinner className="size-4" /> : <PlayIcon className="size-4" />}
              Run evaluation
            </Button>
          </div>

          {!canEvaluate ? <FieldDescription>Your role cannot run evaluations.</FieldDescription> : null}
        </CardContent>
      </Card>

      {report ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col gap-1 rounded-lg border p-3">
              <span className="text-muted-foreground text-xs">Accuracy</span>
              <span className="font-semibold text-2xl tabular-nums">{Math.round(report.summary.accuracy * 100)}%</span>
              <span className="text-muted-foreground text-xs">
                {report.summary.correct} / {report.summary.total} correct
              </span>
            </div>
            <div className="flex flex-col gap-1 rounded-lg border p-3">
              <span className="text-muted-foreground text-xs">False acceptance</span>
              <span className="font-semibold text-2xl tabular-nums">{report.summary.false_acceptance}</span>
              <span className="text-muted-foreground text-xs">Allowed something it should refuse</span>
            </div>
            <div className="flex flex-col gap-1 rounded-lg border p-3">
              <span className="text-muted-foreground text-xs">False rejection</span>
              <span className="font-semibold text-2xl tabular-nums">{report.summary.false_rejection}</span>
              <span className="text-muted-foreground text-xs">Refused something it should allow</span>
            </div>
            <div className="flex flex-col gap-1 rounded-lg border p-3">
              <span className="text-muted-foreground text-xs">Versions</span>
              <span className="font-semibold text-2xl tabular-nums">v{report.policy_version}</span>
              <span className="text-muted-foreground text-xs">evaluator {report.evaluator_version}</span>
            </div>
          </div>

          <Card className="overflow-hidden py-0">
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">Request</TableHead>
                    <TableHead>Expected</TableHead>
                    <TableHead>Actual</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead className="pr-4 text-right">Result</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.results.map((result, index) => (
                    <TableRow key={`${result.input}-${index}`}>
                      <TableCell className="max-w-[36ch] truncate pl-4">{result.input}</TableCell>
                      <TableCell>
                        <DecisionBadge decision={result.expected_decision} />
                      </TableCell>
                      <TableCell>
                        <DecisionBadge decision={result.actual_decision} />
                      </TableCell>
                      <TableCell className="font-mono text-muted-foreground text-xs">{result.reason_code}</TableCell>
                      <TableCell className="pr-4 text-right">
                        <Badge
                          variant="outline"
                          className={
                            result.passed
                              ? "border-emerald-600/20 bg-emerald-500/10 font-normal text-emerald-700 dark:text-emerald-300"
                              : "border-destructive/30 bg-destructive/10 font-normal text-destructive"
                          }
                        >
                          {result.passed ? "Pass" : "Fail"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <p className="text-muted-foreground text-xs">{report.disclaimer}</p>
        </>
      ) : null}
    </div>
  );
}
