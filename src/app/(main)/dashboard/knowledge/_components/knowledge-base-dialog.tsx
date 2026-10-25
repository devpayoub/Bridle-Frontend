"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

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
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { apiPost } from "@/lib/api/client";
import { ApiError, errorMessage } from "@/lib/api/errors";
import type { KnowledgeBase } from "@/lib/api/types";

const schema = z.object({
  name: z.string().trim().min(2, { message: "Give the knowledge base a name." }).max(150),
  description: z.string().trim().max(1000),
});

type Values = z.infer<typeof schema>;

export function KnowledgeBaseDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", description: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setPending(true);
    try {
      const created = await apiPost<KnowledgeBase>("/knowledge-bases/", values);
      toast.success("Knowledge base created.");
      setOpen(false);
      form.reset();
      router.push(`/dashboard/knowledge/${created.id}`);
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError) {
        const nameError = error.fieldErrors.name?.[0];
        if (nameError) form.setError("name", { message: nameError });
        toast.error(error.message);
      } else {
        toast.error(errorMessage(error));
      }
    } finally {
      setPending(false);
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusIcon className="size-4" />
          New knowledge base
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>New knowledge base</DialogTitle>
            <DialogDescription>
              Group documents that answer the same kind of question, then attach the group to an assistant.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="gap-4">
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="kb-name">Name</FieldLabel>
                  <Input
                    {...field}
                    id="kb-name"
                    placeholder="Guest policies"
                    aria-invalid={fieldState.invalid}
                    autoFocus
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="description"
              render={({ field, fieldState }) => (
                <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="kb-description">Description</FieldLabel>
                  <Textarea
                    {...field}
                    id="kb-description"
                    rows={3}
                    placeholder="What questions should this source answer?"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : (
                    <FieldDescription>Optional, but useful when several bases exist.</FieldDescription>
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? <Spinner className="size-4" /> : null}
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
