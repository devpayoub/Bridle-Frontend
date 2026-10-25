"use client";

import { useState } from "react";

import { SparklesIcon } from "lucide-react";
import { toast } from "sonner";

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
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { apiPost } from "@/lib/api/client";
import { ApiError, errorMessage } from "@/lib/api/errors";
import type { AssistantDraft } from "@/lib/api/types";

const EXAMPLES = [
  "A boutique hotel in Lisbon: check-in times, breakfast, room service and local tips.",
  "An online electronics store answering shipping, returns and warranty questions.",
  "A university admissions office handling application deadlines and entry requirements.",
];

/**
 * "Describe it and we'll fill the form" helper.
 *
 * The draft comes from the workspace's configured provider. When no model is
 * configured the API returns a deterministic template and says so, so the UI never
 * implies AI involvement that did not happen.
 */
export function AssistantAutofill({ onApply }: { onApply: (draft: AssistantDraft) => void }) {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [pending, setPending] = useState(false);

  const generate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (description.trim().length < 10) {
      toast.error("Describe the domain in a sentence or two first.");
      return;
    }

    setPending(true);
    try {
      const draft = await apiPost<AssistantDraft>("/assistants/draft/", { description: description.trim() });
      onApply(draft);
      setOpen(false);

      if (draft.generated) {
        toast.success(`Draft generated with ${draft.provider}${draft.model ? ` · ${draft.model}` : ""}.`);
      } else {
        toast("Filled from a template", {
          description:
            "No model is configured for the platform, so the fields came from a template. Ask your administrator to connect an AI provider for model-written drafts.",
        });
      }
    } catch (error) {
      if (error instanceof ApiError && error.code === "validation_error") {
        toast.error(Object.values(error.fieldErrors)[0]?.[0] ?? error.message);
      } else {
        toast.error(errorMessage(error));
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-background">
          <SparklesIcon className="size-4" />
        </span>
        <div className="flex flex-col gap-0.5">
          <span className="font-medium text-sm">Start from a description</span>
          <span className="text-muted-foreground text-sm">
            Describe the domain and let the configured model fill the fields below. You can edit everything after.
          </span>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button type="button" size="sm" className="shrink-0">
            <SparklesIcon className="size-4" />
            Autofill with AI
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Describe the domain</DialogTitle>
            <DialogDescription>
              One or two sentences about the business and what customers ask. Nothing is saved until you create the
              assistant.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={generate} className="flex flex-col gap-4">
            <Field className="gap-1.5">
              <FieldLabel htmlFor="autofill-description">Domain description</FieldLabel>
              <Textarea
                id="autofill-description"
                rows={4}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder={EXAMPLES[0]}
                autoFocus
              />
              <FieldDescription>Try: “{EXAMPLES[1]}”</FieldDescription>
            </Field>

            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => setDescription(example)}
                  className="rounded-full border px-2.5 py-1 text-muted-foreground text-xs transition-colors hover:bg-muted hover:text-foreground"
                >
                  {example.split(":")[0]}
                </button>
              ))}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={pending}>
                Cancel
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? <Spinner className="size-4" /> : <SparklesIcon className="size-4" />}
                Generate
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
