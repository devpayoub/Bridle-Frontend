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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { apiPatch } from "@/lib/api/client";
import { ApiError, errorMessage } from "@/lib/api/errors";
import type { Organization } from "@/lib/api/types";

const TIMEZONES = [
  "UTC",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Madrid",
  "Africa/Casablanca",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
  "Asia/Dubai",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
];

const schema = z.object({
  name: z.string().trim().min(2, { message: "Give the workspace a name." }).max(200),
  timezone: z.string().min(1),
});

type Values = z.infer<typeof schema>;

export function OrganizationForm({ organization, canWrite }: { organization: Organization; canWrite: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: organization.name, timezone: organization.timezone },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setPending(true);
    try {
      await apiPatch<Organization>(`/organizations/${organization.id}/`, values);
      toast.success("Workspace updated.");
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

  const timezones = TIMEZONES.includes(organization.timezone) ? TIMEZONES : [organization.timezone, ...TIMEZONES];

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
      <FieldGroup className="gap-4">
        <Controller
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <Field className="gap-1.5" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="org-settings-name">Workspace name</FieldLabel>
              <Input {...field} id="org-settings-name" disabled={!canWrite} aria-invalid={fieldState.invalid} />
              {fieldState.invalid ? (
                <FieldError errors={[fieldState.error]} />
              ) : (
                <FieldDescription>Shown in the sidebar, the switcher and audit entries.</FieldDescription>
              )}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="timezone"
          render={({ field }) => (
            <Field className="gap-1.5">
              <FieldLabel htmlFor="org-settings-timezone">Timezone</FieldLabel>
              <Select value={field.value} onValueChange={field.onChange} disabled={!canWrite}>
                <SelectTrigger id="org-settings-timezone" className="w-full sm:max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((zone) => (
                    <SelectItem key={zone} value={zone}>
                      {zone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldDescription>Used for billing periods and reporting boundaries.</FieldDescription>
            </Field>
          )}
        />
      </FieldGroup>

      {canWrite ? (
        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? <Spinner className="size-4" /> : null}
            Save changes
          </Button>
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">
          Your role can view these settings but not change them. Ask an admin or the owner.
        </p>
      )}
    </form>
  );
}
