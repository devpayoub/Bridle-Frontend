"use client";

import { useState } from "react";

import Link from "next/link";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon, MailCheckIcon } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { ApiError } from "@/lib/api/errors";
import { type ForgotPasswordValues, forgotPasswordSchema } from "@/lib/validation/auth";

export function ForgotPasswordForm() {
  const [pending, setPending] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setPending(true);
    try {
      const response = await fetch("/api/auth/password-reset", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: values.email }),
      });

      if (!response.ok) {
        const error = await ApiError.fromResponse(response);
        toast.error(error.message);
        return;
      }

      // The API always answers 202 so it never reveals whether an address exists.
      setSentTo(values.email);
    } catch {
      toast.error("Could not reach the server. Please try again.");
    } finally {
      setPending(false);
    }
  });

  if (sentTo) {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex size-11 items-center justify-center rounded-full bg-muted">
          <MailCheckIcon className="size-5 text-foreground" />
        </div>
        <div className="flex flex-col gap-1.5">
          <h2 className="font-semibold text-lg">Check your inbox</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            If <span className="font-medium text-foreground">{sentTo}</span> belongs to an account, we sent a link to
            reset your password. The link expires in one hour.
          </p>
        </div>
        <Button asChild variant="outline" className="w-full">
          <Link href="/auth/login">
            <ArrowLeftIcon className="size-4" />
            Back to sign in
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
      <FieldGroup className="gap-4">
        <Controller
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <Field className="gap-1.5" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="forgot-email">Email</FieldLabel>
              <Input
                {...field}
                id="forgot-email"
                type="email"
                placeholder="you@company.com"
                autoComplete="email"
                autoFocus
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? <Spinner className="size-4" /> : null}
        {pending ? "Sending…" : "Send reset link"}
      </Button>

      <Button asChild variant="ghost" className="w-full">
        <Link href="/auth/login">
          <ArrowLeftIcon className="size-4" />
          Back to sign in
        </Link>
      </Button>
    </form>
  );
}
