"use client";

import { useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { ApiError } from "@/lib/api/errors";
import { PASSWORD_MIN_LENGTH, type ResetPasswordValues, resetPasswordSchema } from "@/lib/validation/auth";

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirm_password: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setPending(true);
    try {
      const response = await fetch("/api/auth/password-reset/confirm", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, new_password: values.password }),
      });

      if (!response.ok) {
        const error = await ApiError.fromResponse(response);
        if (error.code === "invalid_token") {
          toast.error("This reset link is invalid or has expired. Request a new one.");
        } else {
          toast.error(error.message);
        }
        return;
      }

      toast.success("Password updated. Sign in with your new password.");
      router.replace("/auth/login");
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
          name="password"
          render={({ field, fieldState }) => (
            <Field className="gap-1.5" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="reset-password">New password</FieldLabel>
              <Input
                {...field}
                id="reset-password"
                type="password"
                placeholder="••••••••••"
                autoComplete="new-password"
                autoFocus
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
              <FieldLabel htmlFor="reset-confirm">Confirm new password</FieldLabel>
              <Input
                {...field}
                id="reset-confirm"
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
        {pending ? "Updating…" : "Update password"}
      </Button>

      <Button asChild variant="ghost" className="w-full">
        <Link href="/auth/forgot-password">Request a new link</Link>
      </Button>
    </form>
  );
}
