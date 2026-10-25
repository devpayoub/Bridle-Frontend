"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { CopyIcon, KeyRoundIcon, PlusIcon, RotateCwIcon, ShieldOffIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldTitle } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiDelete, apiPost } from "@/lib/api/client";
import { errorMessage } from "@/lib/api/errors";
import type { ApiKey, ApiKeyCreated, ApiKeyEnvironment, Assistant } from "@/lib/api/types";
import { formatDateTime } from "@/lib/format";

const SCOPES = [
  { value: "chat:write", label: "Run chat completions" },
  { value: "assistant:read", label: "Read assistants" },
  { value: "assistant:write", label: "Manage assistants" },
  { value: "policy:read", label: "Read policies" },
  { value: "policy:write", label: "Manage policies" },
  { value: "policy:evaluate", label: "Evaluate policies" },
  { value: "knowledge:read", label: "Read knowledge" },
  { value: "knowledge:write", label: "Manage knowledge" },
  { value: "conversation:read", label: "Read conversations" },
  { value: "usage:read", label: "Read usage" },
  { value: "apikey:read", label: "Read API keys" },
  { value: "*", label: "Everything (not recommended)" },
];

const ENVIRONMENTS: { value: ApiKeyEnvironment; label: string }[] = [
  { value: "DEVELOPMENT", label: "Development" },
  { value: "STAGING", label: "Staging" },
  { value: "PRODUCTION", label: "Production" },
];

function SecretPanel({ apiKey, onDone }: { apiKey: ApiKeyCreated; onDone: () => void }) {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(apiKey.key);
      toast.success("Key copied to clipboard.");
    } catch {
      toast.error("Copy failed. Select the key and copy it manually.");
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-muted-foreground text-sm">
        This is the only time the secret is shown. Store it in your secret manager now.
      </p>
      <div className="flex items-center gap-2 rounded-lg border bg-muted/40 p-2.5">
        <code className="min-w-0 flex-1 break-all font-mono text-xs">{apiKey.key}</code>
        <Button variant="outline" size="icon-sm" onClick={copy} aria-label="Copy key">
          <CopyIcon className="size-4" />
        </Button>
      </div>
      <div className="flex justify-end">
        <Button size="sm" onClick={onDone}>
          Done
        </Button>
      </div>
    </div>
  );
}

function CreateKeyDialog({ assistants }: { assistants: Assistant[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [name, setName] = useState("");
  const [environment, setEnvironment] = useState<ApiKeyEnvironment>("DEVELOPMENT");
  const [scopes, setScopes] = useState<string[]>(["chat:write"]);
  const [assistantId, setAssistantId] = useState("all");
  const [expiresInDays, setExpiresInDays] = useState("90");
  const [created, setCreated] = useState<ApiKeyCreated | null>(null);

  const reset = () => {
    setName("");
    setEnvironment("DEVELOPMENT");
    setScopes(["chat:write"]);
    setAssistantId("all");
    setExpiresInDays("90");
    setCreated(null);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (name.trim().length < 2) {
      toast.error("Give the key a name.");
      return;
    }

    setPending(true);
    try {
      const payload: Record<string, unknown> = {
        name: name.trim(),
        environment,
        scopes,
      };
      if (assistantId !== "all") payload.assistant_id = assistantId;
      const days = Number(expiresInDays);
      if (Number.isFinite(days) && days > 0) payload.expires_in_days = days;

      const apiKey = await apiPost<ApiKeyCreated>("/api-keys/", payload);
      setCreated(apiKey);
      router.refresh();
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusIcon className="size-4" />
          New API key
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        {created ? (
          <>
            <DialogHeader>
              <DialogTitle>Key created</DialogTitle>
              <DialogDescription>{created.name}</DialogDescription>
            </DialogHeader>
            <SecretPanel
              apiKey={created}
              onDone={() => {
                setOpen(false);
                reset();
              }}
            />
          </>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>New API key</DialogTitle>
              <DialogDescription>
                Keys are scoped to this workspace. Grant the narrowest set of permissions that works.
              </DialogDescription>
            </DialogHeader>

            <FieldGroup className="gap-4">
              <Field className="gap-1.5">
                <FieldLabel htmlFor="key-name">Name</FieldLabel>
                <Input
                  id="key-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Backend production"
                  autoFocus
                />
              </Field>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field className="gap-1.5">
                  <FieldLabel htmlFor="key-environment">Environment</FieldLabel>
                  <Select value={environment} onValueChange={(value) => setEnvironment(value as ApiKeyEnvironment)}>
                    <SelectTrigger id="key-environment" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ENVIRONMENTS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field className="gap-1.5">
                  <FieldLabel htmlFor="key-expiry">Expires in (days)</FieldLabel>
                  <Input
                    id="key-expiry"
                    type="number"
                    min={1}
                    max={3650}
                    value={expiresInDays}
                    onChange={(event) => setExpiresInDays(event.target.value)}
                  />
                </Field>
              </div>

              <Field className="gap-1.5">
                <FieldLabel htmlFor="key-assistant">Restrict to assistant</FieldLabel>
                <Select value={assistantId} onValueChange={setAssistantId}>
                  <SelectTrigger id="key-assistant" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All assistants</SelectItem>
                    {assistants.map((assistant) => (
                      <SelectItem key={assistant.id} value={assistant.id}>
                        {assistant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldDescription>A restricted key cannot act on other assistants.</FieldDescription>
              </Field>

              <Field className="gap-1.5">
                <FieldTitle>Scopes</FieldTitle>
                <div className="grid max-h-56 gap-1 overflow-y-auto rounded-lg border p-2 sm:grid-cols-2">
                  {SCOPES.map((scope) => {
                    const checked = scopes.includes(scope.value);
                    return (
                      <div
                        key={scope.value}
                        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/60"
                      >
                        <Checkbox
                          id={`scope-${scope.value}`}
                          checked={checked}
                          onCheckedChange={(next) =>
                            setScopes((current) =>
                              next ? [...current, scope.value] : current.filter((item) => item !== scope.value),
                            )
                          }
                        />
                        <label htmlFor={`scope-${scope.value}`} className="min-w-0 flex-1 cursor-pointer truncate">
                          {scope.label}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </Field>
            </FieldGroup>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={pending}>
                Cancel
              </Button>
              <Button type="submit" disabled={pending || scopes.length === 0}>
                {pending ? <Spinner className="size-4" /> : null}
                Create key
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function ApiKeysPanel({
  apiKeys,
  assistants,
  canWrite,
}: {
  apiKeys: ApiKey[];
  assistants: Assistant[];
  canWrite: boolean;
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rotated, setRotated] = useState<ApiKeyCreated | null>(null);

  const revoke = async (apiKey: ApiKey) => {
    setBusyId(apiKey.id);
    try {
      await apiPost(`/api-keys/${apiKey.id}/revoke/`);
      toast.success("Key revoked.");
      router.refresh();
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (apiKey: ApiKey) => {
    setBusyId(apiKey.id);
    try {
      // Hard delete: removes the record and its audit trail link. Revoking is the
      // safer option for a key that is still in use, so this stays a separate action.
      await apiDelete(`/api-keys/${apiKey.id}/`);
      toast.success("Key deleted.");
      router.refresh();
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setBusyId(null);
    }
  };

  const rotate = async (apiKey: ApiKey) => {
    setBusyId(apiKey.id);
    try {
      const next = await apiPost<ApiKeyCreated>(`/api-keys/${apiKey.id}/rotate/`);
      setRotated(next);
      router.refresh();
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end">
        {canWrite ? <CreateKeyDialog assistants={assistants} /> : null}
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        {apiKeys.length === 0 ? (
          <Empty className="border-none py-16">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <KeyRoundIcon />
              </EmptyMedia>
              <EmptyTitle>No API keys yet</EmptyTitle>
              <EmptyDescription>
                Create a key so your application can call the chat completions endpoint without a browser session.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Key</TableHead>
                <TableHead>Environment</TableHead>
                <TableHead>Scopes</TableHead>
                <TableHead>Last used</TableHead>
                <TableHead>Status</TableHead>
                {canWrite ? <TableHead className="pr-4 text-right">Actions</TableHead> : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiKeys.map((apiKey) => {
                const revoked = Boolean(apiKey.revoked_at);
                return (
                  <TableRow key={apiKey.id}>
                    <TableCell className="pl-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium">{apiKey.name}</span>
                        <span className="font-mono text-muted-foreground text-xs">{apiKey.prefix}…</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal">
                        {apiKey.environment}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[22ch] truncate text-muted-foreground text-xs">
                      {apiKey.scopes.join(", ")}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm tabular-nums">
                      {apiKey.last_used_at ? formatDateTime(apiKey.last_used_at) : "Never"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          revoked
                            ? "border-destructive/30 bg-destructive/10 font-normal text-destructive"
                            : "border-emerald-600/20 bg-emerald-500/10 font-normal text-emerald-700 dark:text-emerald-300"
                        }
                      >
                        {revoked ? "Revoked" : "Active"}
                      </Badge>
                    </TableCell>
                    {canWrite ? (
                      <TableCell className="pr-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Rotate key"
                            disabled={revoked || busyId === apiKey.id}
                            onClick={() => rotate(apiKey)}
                          >
                            <RotateCwIcon className="size-4" />
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label="Revoke key"
                                className="text-muted-foreground hover:text-destructive"
                                disabled={revoked || busyId === apiKey.id}
                              >
                                <ShieldOffIcon className="size-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Revoke this key?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Requests using <span className="font-mono">{apiKey.prefix}…</span> fail immediately.
                                  This cannot be undone — create a new key instead.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => revoke(apiKey)}>Revoke key</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>

                          {revoked ? (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  aria-label="Delete key"
                                  className="text-muted-foreground hover:text-destructive"
                                  disabled={busyId === apiKey.id}
                                >
                                  <Trash2Icon className="size-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete this key?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    <span className="font-mono">{apiKey.prefix}…</span> is removed from the workspace
                                    permanently. If it is still in use, revoke it instead so the failure is visible in
                                    the audit log.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => remove(apiKey)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete key
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          ) : null}
                        </div>
                      </TableCell>
                    ) : null}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={Boolean(rotated)} onOpenChange={(next) => (next ? undefined : setRotated(null))}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Key rotated</DialogTitle>
            <DialogDescription>The previous secret is invalid. Update your application now.</DialogDescription>
          </DialogHeader>
          {rotated ? <SecretPanel apiKey={rotated} onDone={() => setRotated(null)} /> : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
