"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { ApiError } from "@/lib/api/errors";
import type { Organization } from "@/lib/api/types";

const schema = z.object({
  name: z.string().trim().min(2, { message: "Give your workspace a name." }).max(200),
  timezone: z.string().trim().min(1).max(64),
});

type Values = z.infer<typeof schema>;

const TIMEZONES = ["UTC", "Europe/London", "Europe/Paris", "Africa/Casablanca", "America/New_York", "Asia/Dubai"];

export function OnboardingForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", timezone: "UTC" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setPending(true);
    try {
      const createResponse = await fetch("/api/bff/organizations/", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!createResponse.ok) {
        const error = await ApiError.fromResponse(createResponse);
        if (error.code === "validation_error") {
          form.setError("name", { message: error.fieldErrors.name?.[0] ?? error.message });
        } else {
          toast.error(error.message);
        }
        return;
      }

      const organization = (await createResponse.json()) as Organization;

      await fetch("/api/org/select", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ organizationId: organization.id }),
      });

      toast.success("Workspace created.");
      router.replace("/dashboard/overview");
      router.refresh();
    } catch {
      toast.error("Could not reach the server. Please try again.");
    } finally {
      setPending(false);
    }
  });

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
      <FieldGroup className="gap-4">
        <Controller
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <Field className="gap-1.5" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="org-name">Workspace name</FieldLabel>
              <Input
                {...field}
                id="org-name"
                placeholder="Acme Hotel Group"
                autoFocus
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid ? (
                <FieldError errors={[fieldState.error]} />
              ) : (
                <FieldDescription>Shown in the sidebar and on the workspace switcher.</FieldDescription>
              )}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="timezone"
          render={({ field, fieldState }) => (
            <Field className="gap-1.5" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="org-timezone">Timezone</FieldLabel>
              <select
                id="org-timezone"
                value={field.value}
                onChange={field.onChange}
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                {TIMEZONES.map((zone) => (
                  <option key={zone} value={zone}>
                    {zone}
                  </option>
                ))}
              </select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? <Spinner className="size-4" /> : null}
        {pending ? "Creating workspace…" : "Create workspace"}
      </Button>
    </form>
  );
}
