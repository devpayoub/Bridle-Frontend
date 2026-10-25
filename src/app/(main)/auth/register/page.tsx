import Link from "next/link";

import type { Metadata } from "next";

import { RegisterForm } from "../_components/register-form";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create your workspace and start building a restricted assistant.",
};

export default function RegisterPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1.5">
        <h1 className="font-semibold text-2xl tracking-tight">Create your account</h1>
        <p className="text-muted-foreground text-sm">Start with one workspace, add your team later.</p>
      </header>

      <RegisterForm />

      <p className="text-center text-muted-foreground text-sm">
        Already have an account?{" "}
        <Link href="/auth/login" className="font-medium text-foreground underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
