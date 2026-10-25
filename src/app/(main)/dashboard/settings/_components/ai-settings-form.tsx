"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { CircleAlertIcon, CircleCheckIcon, KeyRoundIcon, PlugZapIcon } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { apiDelete, apiPost, apiPut } from "@/lib/api/client";
import { errorMessage } from "@/lib/api/errors";
import type { AISettings, AISettingsTestResult } from "@/lib/api/types";
import { formatDateTime } from "@/lib/format";

/** Fallback when the API does not send a label for a provider. */
const FALLBACK_LABELS: Record<string, string> = {
  mock: "Mock (no API calls)",
  openai: "OpenAI-compatible",
};

export function AISettingsForm({
  organizationId,
  settings,
  canWrite,
}: {
  organizationId: string;
  settings: AISettings;
  canWrite: boolean;
}) {
  const router = useRouter();
  const [provider, setProvider] = useState(settings.provider);
  const [model, setModel] = useState(settings.model);
  const [apiKey, setApiKey] = useState("");
  const [pending, setPending] = useState<"save" | "test" | "clear" | null>(null);
  const [result, setResult] = useState<AISettingsTestResult | null>(null);

  const base = `/organizations/${organizationId}/ai-settings`;
  const labelFor = (name: string) => settings.provider_labels?.[name] ?? FALLBACK_LABELS[name] ?? name;

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setPending("save");
    try {
      await apiPut<AISettings>(base, {
        provider,
        model,
        // Only send the key when the operator typed one; omitting it keeps the stored key.
        ...(apiKey.trim() ? { api_key: apiKey.trim() } : {}),
      });
      setApiKey("");
      toast.success("AI settings saved.");
      router.refresh();
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setPending(null);
    }
  };

  const test = async () => {
    setPending("test");
    try {
      const response = await apiPost<AISettingsTestResult>(`${base}/test`);
      setResult(response);
      if (response.ok) {
        toast.success(`Connected to ${response.provider} in ${response.latency_ms ?? 0} ms.`);
      } else {
        toast.error(response.error ?? "The provider rejected the request.");
      }
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setPending(null);
    }
  };

  const clear = async () => {
    setPending("clear");
    try {
      await apiDelete(base);
      setApiKey("");
      setResult(null);
      toast.success("Stored key removed. The workspace falls back to the environment configuration.");
      router.refresh();
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <Card>
        <CardHeader>
          <CardTitle>Provider</CardTitle>
          <CardDescription>
            Used for chat answers and for drafting assistant configurations. The key is encrypted at rest and never
            returned by the API.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form noValidate onSubmit={save} className="flex flex-col gap-4">
            <FieldGroup className="gap-4">
              <Field className="gap-1.5">
                <FieldLabel htmlFor="ai-provider">Provider</FieldLabel>
                <Select value={provider} onValueChange={setProvider} disabled={!canWrite}>
                  <SelectTrigger id="ai-provider" className="w-full sm:max-w-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {settings.available_providers.map((name) => (
                      <SelectItem key={name} value={name}>
                        {labelFor(name)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {provider === "mock" ? (
                  <FieldDescription>
                    Deterministic local answers — useful for testing the pipeline without spending tokens.
                  </FieldDescription>
                ) : null}
              </Field>

              <Field className="gap-1.5">
                <FieldLabel htmlFor="ai-model">Default model</FieldLabel>
                <Input
                  id="ai-model"
                  value={model}
                  onChange={(event) => setModel(event.target.value)}
                  disabled={!canWrite}
                  placeholder={settings.environment.model || "gpt-4o-mini"}
                  className="sm:max-w-xs"
                />
                <FieldDescription>
                  Applied to new assistants. Each assistant can still override its own model.
                </FieldDescription>
              </Field>

              <Separator />

              <Field className="gap-1.5">
                <FieldLabel htmlFor="ai-key">API key</FieldLabel>
                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    id="ai-key"
                    type="password"
                    autoComplete="off"
                    value={apiKey}
                    onChange={(event) => setApiKey(event.target.value)}
                    disabled={!canWrite}
                    placeholder={settings.has_key ? `Stored: ••••${settings.key_last4}` : "Paste the provider key"}
                    className="sm:max-w-xs"
                  />
                  <Badge variant="outline" className="font-normal">
                    <KeyRoundIcon className="size-3" />
                    {settings.has_key ? `••••${settings.key_last4}` : "Not set"}
                  </Badge>
                </div>
                <FieldDescription>
                  {settings.has_key
                    ? "Leave blank to keep the current key. Saving a new key replaces it."
                    : "Paste the key from your provider dashboard. It is write-only."}
                </FieldDescription>
              </Field>
            </FieldGroup>

            <div className="flex flex-wrap items-center gap-2">
              {canWrite ? (
                <>
                  <Button type="submit" size="sm" disabled={pending !== null}>
                    {pending === "save" ? <Spinner className="size-4" /> : null}
                    Save
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={test} disabled={pending !== null}>
                    {pending === "test" ? <Spinner className="size-4" /> : <PlugZapIcon className="size-4" />}
                    Test connection
                  </Button>
                  {settings.has_key ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={clear}
                      disabled={pending !== null}
                    >
                      Remove key
                    </Button>
                  ) : null}
                </>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Your role can view these settings but not change them. Ask an admin or the owner.
                </p>
              )}
            </div>
          </form>

          {result ? (
            <div
              className={`mt-4 flex items-start gap-3 rounded-lg border p-3 text-sm ${
                result.ok ? "border-emerald-600/20 bg-emerald-500/10" : "border-destructive/30 bg-destructive/10"
              }`}
            >
              {result.ok ? (
                <CircleCheckIcon className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <CircleAlertIcon className="mt-0.5 size-4 shrink-0 text-destructive" />
              )}
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="font-medium">
                  {result.ok
                    ? `Connected · ${result.provider}${result.model ? ` · ${result.model}` : ""}`
                    : `Failed · ${result.error_code ?? "error"}`}
                </span>
                <span className="text-muted-foreground">
                  {result.ok ? `${result.latency_ms ?? 0} ms · source: ${result.source}` : result.error}
                </span>
                {result.ok && result.sample ? (
                  <span className="mt-1 truncate font-mono text-muted-foreground text-xs">{result.sample}</span>
                ) : null}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle>In use</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Source</span>
            <Badge variant="outline" className="font-normal">
              {settings.source === "workspace" ? "This workspace" : "Environment"}
            </Badge>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Provider</span>
            <span className="font-medium">{labelFor(settings.provider)}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Model</span>
            <span className="font-mono text-xs">{settings.model || settings.environment.model}</span>
          </div>
          <Separator />
          <div className="flex flex-col gap-1 text-muted-foreground text-xs">
            <span>
              Environment default: {settings.environment.provider}
              {settings.environment.has_key ? " · key configured" : " · no key"}
            </span>
            {settings.updated_at ? (
              <span>
                Updated {formatDateTime(settings.updated_at)}
                {settings.updated_by ? ` by ${settings.updated_by}` : ""}
              </span>
            ) : (
              <span>No workspace override stored.</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
