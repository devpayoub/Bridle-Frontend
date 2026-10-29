"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { CopyIcon, MessageCircleIcon, PlusIcon, RefreshCwIcon, ShieldOffIcon, WifiIcon } from "lucide-react";
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
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiDelete, apiPost } from "@/lib/api/client";
import { errorMessage } from "@/lib/api/errors";
import type { Assistant, Channel, ChannelTestResult } from "@/lib/api/types";
import { formatDateTime } from "@/lib/format";

const STATUS_STYLES: Record<Channel["status"], string> = {
  ACTIVE: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  PENDING: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  ERROR: "border-destructive/30 bg-destructive/10 text-destructive",
  DISABLED: "text-muted-foreground",
};

function CopyValue({ value, label }: { value: string; label: string }) {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied.`);
    } catch {
      toast.error("Copy failed. Select the value and copy it manually.");
    }
  };
  return (
    <div className="flex items-center gap-2 rounded-lg border bg-muted/40 p-2.5">
      <code className="min-w-0 flex-1 break-all font-mono text-xs">{value}</code>
      <Button variant="outline" size="icon-sm" onClick={copy} aria-label={`Copy ${label}`}>
        <CopyIcon className="size-4" />
      </Button>
    </div>
  );
}

function ConnectDialog({ assistants }: { assistants: Assistant[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [assistantId, setAssistantId] = useState(assistants[0]?.id ?? "");
  const [token, setToken] = useState("");
  const [name, setName] = useState("");
  const [created, setCreated] = useState<Channel | null>(null);

  const reset = () => {
    setToken("");
    setName("");
    setCreated(null);
    setAssistantId(assistants[0]?.id ?? "");
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!assistantId) {
      toast.error("Pick the assistant this bot should answer as.");
      return;
    }
    if (!token.trim()) {
      toast.error("Paste the bot token from BotFather.");
      return;
    }
    setPending(true);
    try {
      const channel = await apiPost<Channel>("/channels/", {
        type: "TELEGRAM",
        assistant_id: assistantId,
        bot_token: token.trim(),
        name: name.trim(),
      });
      setCreated(channel);
      setToken("");
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
          Connect a bot
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        {created ? (
          <div className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>Bot connected</DialogTitle>
              <DialogDescription>
                Message it on Telegram to test it. The webhook is registered and the token is stored encrypted.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-2">
              <span className="font-medium text-sm">Webhook URL</span>
              {created.webhook_url ? (
                <CopyValue value={created.webhook_url} label="Webhook URL" />
              ) : (
                <p className="text-muted-foreground text-sm">
                  Set <code className="font-mono text-xs">CHANNELS_PUBLIC_BASE_URL</code> on the API so Telegram can
                  reach it.
                </p>
              )}
            </div>

            {created.bot_username ? (
              <p className="text-muted-foreground text-sm">
                Open{" "}
                <a
                  className="font-medium text-foreground underline underline-offset-4"
                  href={`https://t.me/${created.bot_username}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  t.me/{created.bot_username}
                </a>{" "}
                and send a message.
              </p>
            ) : null}

            <DialogFooter>
              <Button onClick={() => setOpen(false)}>Done</Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>Connect a Telegram bot</DialogTitle>
              <DialogDescription>
                Anyone with the bot link can chat with it. The assistant&apos;s policy still decides what it answers.
              </DialogDescription>
            </DialogHeader>

            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel htmlFor="channel-assistant">Assistant</FieldLabel>
                <Select value={assistantId} onValueChange={setAssistantId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose an assistant" />
                  </SelectTrigger>
                  <SelectContent>
                    {assistants.map((assistant) => (
                      <SelectItem key={assistant.id} value={assistant.id}>
                        {assistant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldDescription>Only active assistants can be connected.</FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="channel-token">Bot token</FieldLabel>
                <Input
                  id="channel-token"
                  type="password"
                  autoComplete="off"
                  placeholder="8123456789:AAH…"
                  value={token}
                  onChange={(event) => setToken(event.target.value)}
                />
                <FieldDescription>From @BotFather → /newbot. Stored encrypted and never shown again.</FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="channel-name">Label (optional)</FieldLabel>
                <Input
                  id="channel-name"
                  placeholder="Acme support"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </Field>
            </FieldGroup>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? <Spinner className="size-4" /> : null}
                Connect
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function ChannelsPanel({
  channels,
  assistants,
  canWrite,
}: {
  channels: Channel[];
  assistants: Assistant[];
  canWrite: boolean;
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  const run = async (id: string, task: () => Promise<void>) => {
    setBusyId(id);
    try {
      await task();
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setBusyId(null);
    }
  };

  const test = (channel: Channel) =>
    run(channel.id, async () => {
      const result = await apiPost<ChannelTestResult>(`/channels/${channel.id}/test/`);
      if (result.ok) {
        toast.success(`Reachable as @${result.bot_username} · ${result.latency_ms} ms`);
      } else {
        toast.error(result.error ?? "Telegram rejected the token.");
      }
    });

  const rotate = (channel: Channel) =>
    run(channel.id, async () => {
      await apiPost(`/channels/${channel.id}/rotate-webhook/`);
      toast.success("Webhook key rotated.");
      router.refresh();
    });

  const disconnect = (channel: Channel) =>
    run(channel.id, async () => {
      await apiDelete(`/channels/${channel.id}/`);
      toast.success("Channel disconnected.");
      router.refresh();
    });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-muted-foreground text-sm">
          A bot answers as one assistant. Refusals are sent as normal messages — no reason codes, no internals.
        </p>
        {canWrite && assistants.length > 0 ? <ConnectDialog assistants={assistants} /> : null}
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        {channels.length === 0 ? (
          <Empty className="border-none py-16">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <MessageCircleIcon />
              </EmptyMedia>
              <EmptyTitle>No channels yet</EmptyTitle>
              <EmptyDescription>
                {canWrite
                  ? "Connect a Telegram bot to let customers talk to an assistant from chat."
                  : "Ask an admin or the owner to connect a channel."}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Channel</TableHead>
                <TableHead>Assistant</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last message</TableHead>
                {canWrite ? <TableHead className="pr-4 text-right">Actions</TableHead> : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {channels.map((channel) => (
                <TableRow key={channel.id}>
                  <TableCell className="pl-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{channel.name}</span>
                      <span className="text-muted-foreground text-xs">
                        {channel.bot_username ? `@${channel.bot_username}` : "Telegram"}
                        {channel.token_last4 ? ` · ••••${channel.token_last4}` : ""}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{channel.assistant_name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`font-normal ${STATUS_STYLES[channel.status]}`}>
                      {channel.status.toLowerCase()}
                    </Badge>
                    {channel.status === "ERROR" && channel.webhook_error ? (
                      <span className="mt-1 block text-destructive text-xs">{channel.webhook_error}</span>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {channel.last_event_at ? formatDateTime(channel.last_event_at) : "—"}
                  </TableCell>
                  {canWrite ? (
                    <TableCell className="pr-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Test connection"
                          disabled={busyId === channel.id || !channel.has_credentials}
                          onClick={() => test(channel)}
                        >
                          <WifiIcon className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Rotate webhook"
                          disabled={busyId === channel.id || channel.status !== "ACTIVE"}
                          onClick={() => rotate(channel)}
                        >
                          <RefreshCwIcon className="size-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label="Disconnect channel"
                              className="text-muted-foreground hover:text-destructive"
                              disabled={busyId === channel.id || channel.status === "DISABLED"}
                            >
                              <ShieldOffIcon className="size-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Disconnect {channel.name}?</AlertDialogTitle>
                              <AlertDialogDescription>
                                The bot stops answering immediately and its token is erased. Past conversations stay in
                                the workspace; messages already delivered in Telegram cannot be recalled.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => disconnect(channel)}
                              >
                                Disconnect
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  ) : null}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {canWrite && channels.some((channel) => channel.status === "ACTIVE" && channel.webhook_url) ? (
        <div className="flex flex-col gap-2 rounded-xl border bg-card p-4">
          <span className="font-medium text-sm">Webhook URLs</span>
          <p className="text-muted-foreground text-xs">
            Registered automatically. Only visible to roles that can manage channels.
          </p>
          {channels
            .filter((channel) => channel.status === "ACTIVE" && channel.webhook_url)
            .map((channel) => (
              <CopyValue key={channel.id} value={channel.webhook_url as string} label={`${channel.name} webhook`} />
            ))}
        </div>
      ) : null}
    </div>
  );
}
