"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldTitle } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { apiPatch, apiPost } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import type { Assistant, AssistantDomainType, AssistantDraft, AssistantWrite, KnowledgeBase } from "@/lib/api/types";

import { AssistantAutofill } from "./assistant-autofill";

const DOMAIN_TYPES = [
  { value: "GENERIC", label: "Generic" },
  { value: "HOTEL", label: "Hotel" },
  { value: "HOSPITAL", label: "Hospital" },
  { value: "ECOMMERCE", label: "E-commerce" },
  { value: "BOOKING", label: "Booking" },
  { value: "UNIVERSITY", label: "University" },
  { value: "OTHER", label: "Other" },
] as const;

const schema = z.object({
  name: z.string().trim().min(2, { message: "Give the assistant a name." }).max(150),
  description: z.string().trim().max(5000),
  domain_type: z.enum(["GENERIC", "HOTEL", "HOSPITAL", "ECOMMERCE", "BOOKING", "UNIVERSITY", "OTHER"]),
  allowed_topics: z.string().max(8000),
  prohibited_topics: z.string().max(8000),
  system_instructions: z.string().max(8000),
  fallback_message: z.string().trim().max(500),
  default_language: z.string().trim().min(2, { message: "Use a language code such as en." }).max(16),
  knowledge_required: z.boolean(),
  knowledge_base_ids: z.array(z.string()),
  model_provider: z.string().min(1),
  model_name: z.string().trim().max(100),
  maximum_output_tokens: z.number().int().min(1, { message: "At least 1 token." }).max(4096),
  temperature: z.number().min(0).max(1.5),
});

type Values = z.infer<typeof schema>;

function splitTopics(value: string): string[] {
  return value
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function toFormValues(assistant: Assistant | undefined, defaultProvider: string): Values {
  return {
    name: assistant?.name ?? "",
    description: assistant?.description ?? "",
    domain_type: assistant?.domain_type ?? "GENERIC",
    allowed_topics: (assistant?.allowed_topics ?? []).join(", "),
    prohibited_topics: (assistant?.prohibited_topics ?? []).join(", "),
    system_instructions: assistant?.system_instructions ?? "",
    fallback_message: assistant?.fallback_message ?? "I can only help with questions about our services.",
    default_language: assistant?.default_language ?? "en",
    knowledge_required: assistant?.knowledge_required ?? false,
    knowledge_base_ids: assistant?.knowledge_base_ids ?? [],
    model_provider: assistant?.model_provider ?? defaultProvider,
    model_name: assistant?.model_name ?? "",
    maximum_output_tokens: assistant?.maximum_output_tokens ?? 600,
    temperature: assistant?.generation_parameters?.temperature ?? 0.2,
  };
}

export function AssistantForm({
  assistant,
  knowledgeBases,
  availableProviders,
  providerLabels,
  defaultProvider,
  defaultModel,
}: {
  assistant?: Assistant;
  knowledgeBases: KnowledgeBase[];
  /** Providers the workspace may use; mirrors the backend registry. */
  availableProviders: string[];
  /** Display names from the API (the gateway vendor, not the wire protocol). */
  providerLabels: Record<string, string>;
  /** Workspace default, used for new assistants. */
  defaultProvider: string;
  defaultModel: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const isEdit = Boolean(assistant);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: toFormValues(assistant, defaultProvider),
  });

  // Populate the form from an AI/template draft. `shouldValidate` keeps the
  // submit button state honest after fields change underneath the user.
  const applyDraft = (draft: AssistantDraft) => {
    form.setValue("name", draft.name, { shouldValidate: true });
    form.setValue("description", draft.description);
    form.setValue("domain_type", draft.domain_type as Values["domain_type"], { shouldValidate: true });
    form.setValue("allowed_topics", draft.allowed_topics.join(", "));
    form.setValue("prohibited_topics", draft.prohibited_topics.join(", "));
    form.setValue("system_instructions", draft.system_instructions);
    form.setValue("fallback_message", draft.fallback_message);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    setPending(true);

    const payload: AssistantWrite = {
      name: values.name,
      description: values.description,
      domain_type: values.domain_type as AssistantDomainType,
      allowed_topics: splitTopics(values.allowed_topics),
      prohibited_topics: splitTopics(values.prohibited_topics),
      system_instructions: values.system_instructions,
      fallback_message: values.fallback_message,
      default_language: values.default_language,
      knowledge_required: values.knowledge_required,
      knowledge_base_ids: values.knowledge_base_ids,
      model_provider: values.model_provider,
      ...(values.model_name ? { model_name: values.model_name } : {}),
      maximum_output_tokens: values.maximum_output_tokens,
      generation_parameters: { temperature: values.temperature },
    };

    try {
      if (isEdit && assistant) {
        await apiPatch<Assistant>(`/assistants/${assistant.id}/`, payload);
        toast.success("Assistant updated.");
        router.refresh();
        return;
      }

      const created = await apiPost<Assistant>("/assistants/", payload);
      toast.success("Assistant created as a draft.");
      router.push(`/dashboard/assistants/${created.id}`);
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError) {
        const fieldErrors = error.fieldErrors;
        for (const [field, messages] of Object.entries(fieldErrors)) {
          if (field in values) {
            form.setError(field as keyof Values, { message: messages[0] });
          }
        }
        toast.error(error.message);
      } else {
        toast.error("Could not save the assistant. Please try again.");
      }
    } finally {
      setPending(false);
    }
  });

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
      {!isEdit ? <AssistantAutofill onApply={applyDraft} /> : null}

      <Card>
        <CardHeader>
          <CardTitle>Identity</CardTitle>
          <CardDescription>How the assistant is presented in the dashboard and in audit trails.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup className="gap-4">
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="assistant-name">Name</FieldLabel>
                  <Input {...field} id="assistant-name" aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="description"
              render={({ field, fieldState }) => (
                <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="assistant-description">Description</FieldLabel>
                  <Textarea {...field} id="assistant-description" rows={2} aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                control={form.control}
                name="domain_type"
                render={({ field }) => (
                  <Field className="gap-1.5">
                    <FieldLabel htmlFor="assistant-domain">Domain</FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="assistant-domain" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DOMAIN_TYPES.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldDescription>The domain frames the default policy.</FieldDescription>
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="default_language"
                render={({ field, fieldState }) => (
                  <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="assistant-language">Default language</FieldLabel>
                    <Input {...field} id="assistant-language" placeholder="en" aria-invalid={fieldState.invalid} />
                    {fieldState.invalid ? (
                      <FieldError errors={[fieldState.error]} />
                    ) : (
                      <FieldDescription>ISO code, for example en or fr.</FieldDescription>
                    )}
                  </Field>
                )}
              />
            </div>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scope</CardTitle>
          <CardDescription>
            Separate topics with a comma or a new line. Matching is lexical and alias-based.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup className="gap-4">
            <Controller
              control={form.control}
              name="allowed_topics"
              render={({ field, fieldState }) => (
                <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="assistant-allowed">Allowed topics</FieldLabel>
                  <Textarea
                    {...field}
                    id="assistant-allowed"
                    rows={3}
                    placeholder="room types, check-in policy, breakfast hours"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="prohibited_topics"
              render={({ field, fieldState }) => (
                <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="assistant-prohibited">Prohibited topics</FieldLabel>
                  <Textarea
                    {...field}
                    id="assistant-prohibited"
                    rows={3}
                    placeholder="competitor pricing, legal advice, medical diagnosis"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="system_instructions"
              render={({ field, fieldState }) => (
                <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="assistant-instructions">System instructions</FieldLabel>
                  <Textarea {...field} id="assistant-instructions" rows={4} aria-invalid={fieldState.invalid} />
                  {fieldState.invalid ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : (
                    <FieldDescription>Required before the assistant can be activated.</FieldDescription>
                  )}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="fallback_message"
              render={({ field, fieldState }) => (
                <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="assistant-fallback">Fallback message</FieldLabel>
                  <Textarea {...field} id="assistant-fallback" rows={2} aria-invalid={fieldState.invalid} />
                  <FieldDescription>Returned verbatim when the assistant refuses a request.</FieldDescription>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Knowledge</CardTitle>
          <CardDescription>Only approved sources are retrieved at answer time.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Controller
            control={form.control}
            name="knowledge_required"
            render={({ field }) => (
              <Field orientation="horizontal" className="items-center justify-between gap-4">
                <div className="flex flex-col gap-0.5">
                  <FieldLabel htmlFor="assistant-knowledge-required">Require grounding</FieldLabel>
                  <FieldDescription>Refuse when no approved source supports an answer.</FieldDescription>
                </div>
                <Switch id="assistant-knowledge-required" checked={field.value} onCheckedChange={field.onChange} />
              </Field>
            )}
          />

          {knowledgeBases.length === 0 ? (
            <FieldDescription>No knowledge bases yet. Create one before attaching sources.</FieldDescription>
          ) : (
            <Controller
              control={form.control}
              name="knowledge_base_ids"
              render={({ field }) => (
                <div className="flex flex-col gap-2">
                  <FieldTitle>Attached knowledge bases</FieldTitle>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {knowledgeBases.map((knowledgeBase) => {
                      const checked = field.value.includes(knowledgeBase.id);
                      return (
                        <div
                          key={knowledgeBase.id}
                          className="flex items-center gap-2.5 rounded-lg border p-3 text-sm transition-colors hover:bg-muted/50"
                        >
                          <Checkbox
                            id={`kb-${knowledgeBase.id}`}
                            checked={checked}
                            onCheckedChange={(next) => {
                              field.onChange(
                                next
                                  ? [...field.value, knowledgeBase.id]
                                  : field.value.filter((id) => id !== knowledgeBase.id),
                              );
                            }}
                          />
                          <label htmlFor={`kb-${knowledgeBase.id}`} className="flex min-w-0 cursor-pointer flex-col">
                            <span className="truncate font-medium">{knowledgeBase.name}</span>
                            <span className="text-muted-foreground text-xs">
                              {knowledgeBase.document_count} document
                              {knowledgeBase.document_count === 1 ? "" : "s"}
                            </span>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Generation</CardTitle>
          <CardDescription>Conservative defaults keep answers predictable.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <Controller
              control={form.control}
              name="model_provider"
              render={({ field }) => (
                <Field className="gap-1.5">
                  <FieldLabel htmlFor="assistant-provider">AI provider</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="assistant-provider" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableProviders.map((name) => (
                        <SelectItem key={name} value={name}>
                          {providerLabels[name] ?? name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldDescription>Credentials are configured by the platform.</FieldDescription>
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="model_name"
              render={({ field, fieldState }) => (
                <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="assistant-model">Model</FieldLabel>
                  <Input {...field} id="assistant-model" placeholder={defaultModel} aria-invalid={fieldState.invalid} />
                  {fieldState.invalid ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : (
                    <FieldDescription>Leave blank to use the workspace default.</FieldDescription>
                  )}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="maximum_output_tokens"
              render={({ field, fieldState }) => (
                <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="assistant-max-tokens">Maximum output tokens</FieldLabel>
                  <Input
                    id="assistant-max-tokens"
                    type="number"
                    min={1}
                    max={4096}
                    value={field.value}
                    onChange={(event) => field.onChange(Number(event.target.value))}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="temperature"
              render={({ field, fieldState }) => (
                <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="assistant-temperature">Temperature</FieldLabel>
                  <Input
                    id="assistant-temperature"
                    type="number"
                    min={0}
                    max={1.5}
                    step={0.1}
                    value={field.value}
                    onChange={(event) => field.onChange(Number(event.target.value))}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : (
                    <FieldDescription>Between 0 and 1.5.</FieldDescription>
                  )}
                </Field>
              )}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={pending}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? <Spinner className="size-4" /> : null}
          {isEdit ? "Save changes" : "Create assistant"}
        </Button>
      </div>
    </form>
  );
}
