"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { ApiError } from "@/lib/api/errors";
import type { SessionPayload } from "@/lib/auth/session-server";
import { PASSWORD_MIN_LENGTH, type RegisterValues, registerSchema } from "@/lib/validation/auth";

export function RegisterForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { full_name: "", email: "", password: "", confirm_password: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setPending(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          full_name: values.full_name,
          email: values.email,
          password: values.password,
        }),
      });

      if (!response.ok) {
        const error = await ApiError.fromResponse(response);

        if (error.code === "email_already_registered") {
          form.setError("email", { message: error.message });
          return;
        }

        const fieldErrors = error.fieldErrors;
        let handled = false;
        for (const [field, messages] of Object.entries(fieldErrors)) {
          if (field === "email" || field === "full_name" || field === "password") {
            form.setError(field as keyof RegisterValues, { message: messages[0] });
            handled = true;
          }
        }

        if (!handled) {
          toast.error(error.message);
        }
        return;
      }

      const session = (await response.json()) as SessionPayload;
      toast.success("Account created. Check your inbox to verify your email.");

      router.replace(session.organizationId ? "/dashboard/overview" : "/onboarding");
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
          name="full_name"
          render={({ field, fieldState }) => (
            <Field className="gap-1.5" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="register-name">Full name</FieldLabel>
              <Input
                {...field}
                id="register-name"
                placeholder="Ada Lovelace"
                autoComplete="name"
                autoFocus
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <Field className="gap-1.5" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="register-email">Work email</FieldLabel>
              <Input
                {...field}
                id="register-email"
                type="email"
                placeholder="you@company.com"
                autoComplete="email"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="password"
          render={({ field, fieldState }) => (
            <Field className="gap-1.5" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="register-password">Password</FieldLabel>
              <Input
                {...field}
                id="register-password"
                type="password"
                placeholder="••••••••••"
                autoComplete="new-password"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid ? (
                <FieldError errors={[fieldState.error]} />
              ) : (
                <FieldDescription>At least {PASSWORD_MIN_LENGTH} characters.</FieldDescription>
              )}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="confirm_password"
          render={({ field, fieldState }) => (
            <Field className="gap-1.5" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="register-confirm">Confirm password</FieldLabel>
              <Input
                {...field}
                id="register-confirm"
                type="password"
                placeholder="••••••••••"
                autoComplete="new-password"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? <Spinner className="size-4" /> : null}
        {pending ? "Creating account…" : "Create account"}
      </Button>

      <p className="text-muted-foreground text-xs leading-relaxed">
        By creating an account you agree to keep your workspace data accurate. You can deactivate the account at any
        time from settings.
      </p>
    </form>
  );
}
