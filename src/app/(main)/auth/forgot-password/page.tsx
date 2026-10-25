import type { Metadata } from "next";

import { ForgotPasswordForm } from "../_components/forgot-password-form";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Request a password reset link.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1.5">
        <h1 className="font-semibold text-2xl tracking-tight">Reset your password</h1>
        <p className="text-muted-foreground text-sm">
          Enter the email on your account and we will send a single-use reset link.
        </p>
      </header>

      <ForgotPasswordForm />
    </div>
  );
}
