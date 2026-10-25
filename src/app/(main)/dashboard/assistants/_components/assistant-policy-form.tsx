"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { apiPut } from "@/lib/api/client";
import { ApiError, errorMessage } from "@/lib/api/errors";
import type { AssistantPolicy, PolicyUpdate } from "@/lib/api/types";
import { formatDateTime } from "@/lib/format";

const schema = z
  .object({
    allowed_topics: z.string().max(8000),
    prohibited_topics: z.string().max(8000),
    industry: z.string().trim().max(32),
    uncertainty_handling: z.enum(["CLARIFY", "REFUSE"]),
    evaluator_mode: z.enum(["RULES", "HYBRID"]),
    allow_threshold: z.number().min(0).max(1),
    clarify_threshold: z.number().min(0).max(1),
    max_chars: z.number().int().min(40, { message: "At least 40 characters." }).max(20000),
    banned_phrases: z.string().max(4000),
    required_disclaimer: z.string().max(500),
    block_pii: z.boolean(),
    escalation_keywords: z.string().max(4000),
    escalation_message: z.string().max(500),
  })
  .refine((values) => values.clarify_threshold < values.allow_threshold, {
    path: ["clarify_threshold"],
    message: "The clarify threshold must be below the allow threshold.",
  });

type Values = z.infer<typeof schema>;

function splitList(value: string): string[] {
  return value
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function toFormValues(policy: AssistantPolicy): Values {
  return {
    allowed_topics: (policy.allowed_topics ?? []).join(", "),
    prohibited_topics: (policy.prohibited_topics ?? []).join(", "),
    industry: policy.industry ?? "",
    uncertainty_handling: policy.uncertainty_handling,
    evaluator_mode: policy.evaluator_mode,
    allow_threshold: policy.allow_threshold,
    clarify_threshold: policy.clarify_threshold,
    max_chars: policy.response_constraints?.max_chars ?? 1200,
    banned_phrases: (policy.response_constraints?.banned_phrases ?? []).join(", "),
    required_disclaimer: policy.response_constraints?.required_disclaimer ?? "",
    block_pii: policy.response_constraints?.block_pii ?? false,
    escalation_keywords: (policy.escalation_rules?.keywords ?? []).join(", "),
    escalation_message: policy.escalation_rules?.message ?? "",
  };
}

export function AssistantPolicyForm({ policy, canWrite }: { policy: AssistantPolicy; canWrite: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: toFormValues(policy),
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const payload: PolicyUpdate = {
      allowed_topics: splitList(values.allowed_topics),
      prohibited_topics: splitList(values.prohibited_topics),
      industry: values.industry,
      uncertainty_handling: values.uncertainty_handling,
      evaluator_mode: values.evaluator_mode,
      allow_threshold: values.allow_threshold,
      clarify_threshold: values.clarify_threshold,
      response_constraints: {
        max_chars: values.max_chars,
        banned_phrases: splitList(values.banned_phrases),
        required_disclaimer: values.required_disclaimer,
        block_pii: values.block_pii,
      },
      escalation_rules: {
        keywords: splitList(values.escalation_keywords),
        message: values.escalation_message,
      },
    };

    setPending(true);
    try {
      await apiPut<AssistantPolicy>(`/assistants/${policy.assistant_id}/policy/`, payload);
      toast.success("Policy updated.");
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError) {
        for (const [field, messages] of Object.entries(error.fieldErrors)) {
          if (field in values) {
            form.setError(field as keyof Values, { message: messages[0] });
          }
        }
        toast.error(error.message);
      } else {
        toast.error(errorMessage(error));
      }
    } finally {
      setPending(false);
    }
  });

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Scope</CardTitle>
          <CardDescription>
            Topics the policy engine will accept. Version {policy.version}, updated {formatDateTime(policy.updated_at)}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup className="gap-4">
            <Controller
              control={form.control}
              name="allowed_topics"
              render={({ field, fieldState }) => (
                <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="policy-allowed">Allowed topics</FieldLabel>
                  <Textarea {...field} id="policy-allowed" rows={2} disabled={!canWrite} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="prohibited_topics"
              render={({ field, fieldState }) => (
                <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="policy-prohibited">Prohibited topics</FieldLabel>
                  <Textarea {...field} id="policy-prohibited" rows={2} disabled={!canWrite} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="industry"
              render={({ field, fieldState }) => (
                <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="policy-industry">Industry</FieldLabel>
                  <Input {...field} id="policy-industry" disabled={!canWrite} placeholder="hospitality" />
                  {fieldState.invalid ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : (
                    <FieldDescription>Optional label used for reporting.</FieldDescription>
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Decisioning</CardTitle>
          <CardDescription>Confidence boundaries and how ambiguity is handled.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <Controller
              control={form.control}
              name="uncertainty_handling"
              render={({ field }) => (
                <Field className="gap-1.5">
                  <FieldLabel htmlFor="policy-uncertainty">Uncertainty</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange} disabled={!canWrite}>
                    <SelectTrigger id="policy-uncertainty" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CLARIFY">Ask a clarifying question</SelectItem>
                      <SelectItem value="REFUSE">Refuse</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="evaluator_mode"
              render={({ field }) => (
                <Field className="gap-1.5">
                  <FieldLabel htmlFor="policy-evaluator">Evaluator</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange} disabled={!canWrite}>
                    <SelectTrigger id="policy-evaluator" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RULES">Rules only</SelectItem>
                      <SelectItem value="HYBRID">Rules + classifier</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldDescription>A classifier can only tighten a decision.</FieldDescription>
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="allow_threshold"
              render={({ field, fieldState }) => (
                <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="policy-allow">Allow threshold</FieldLabel>
                  <Input
                    id="policy-allow"
                    type="number"
                    step={0.01}
                    min={0}
                    max={1}
                    value={field.value}
                    onChange={(event) => field.onChange(Number(event.target.value))}
                    disabled={!canWrite}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="clarify_threshold"
              render={({ field, fieldState }) => (
                <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="policy-clarify">Clarify threshold</FieldLabel>
                  <Input
                    id="policy-clarify"
                    type="number"
                    step={0.01}
                    min={0}
                    max={1}
                    value={field.value}
                    onChange={(event) => field.onChange(Number(event.target.value))}
                    disabled={!canWrite}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : (
                    <FieldDescription>Below this confidence, clarify.</FieldDescription>
                  )}
                </Field>
              )}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Response constraints</CardTitle>
          <CardDescription>Applied after generation, before the answer is returned.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup className="gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                control={form.control}
                name="max_chars"
                render={({ field, fieldState }) => (
                  <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="policy-max-chars">Maximum characters</FieldLabel>
                    <Input
                      id="policy-max-chars"
                      type="number"
                      min={40}
                      max={20000}
                      value={field.value}
                      onChange={(event) => field.onChange(Number(event.target.value))}
                      disabled={!canWrite}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="block_pii"
                render={({ field }) => (
                  <Field orientation="horizontal" className="items-center justify-between gap-4 sm:pt-6">
                    <div className="flex flex-col gap-0.5">
                      <FieldLabel htmlFor="policy-block-pii">Block PII</FieldLabel>
                      <FieldDescription>Refuse answers that echo personal data.</FieldDescription>
                    </div>
                    <Switch
                      id="policy-block-pii"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={!canWrite}
                    />
                  </Field>
                )}
              />
            </div>

            <Controller
              control={form.control}
              name="banned_phrases"
              render={({ field, fieldState }) => (
                <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="policy-banned">Banned phrases</FieldLabel>
                  <Textarea {...field} id="policy-banned" rows={2} disabled={!canWrite} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="required_disclaimer"
              render={({ field, fieldState }) => (
                <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="policy-disclaimer">Required disclaimer</FieldLabel>
                  <Textarea {...field} id="policy-disclaimer" rows={2} disabled={!canWrite} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Escalation</CardTitle>
          <CardDescription>Requests matching these keywords are handed to a human.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup className="gap-4">
            <Controller
              control={form.control}
              name="escalation_keywords"
              render={({ field, fieldState }) => (
                <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="policy-escalation-keywords">Keywords</FieldLabel>
                  <Textarea {...field} id="policy-escalation-keywords" rows={2} disabled={!canWrite} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="escalation_message"
              render={({ field, fieldState }) => (
                <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="policy-escalation-message">Escalation message</FieldLabel>
                  <Textarea {...field} id="policy-escalation-message" rows={2} disabled={!canWrite} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>
        </CardContent>
      </Card>

      {canWrite ? (
        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? <Spinner className="size-4" /> : null}
            Save policy
          </Button>
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">Your role can read this policy but not change it.</p>
      )}
    </form>
  );
}
