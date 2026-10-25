"use client";

import Image from "next/image";
import Link from "next/link";

import { AnimatedWave } from "./animated-wave";

const footerLinks = {
  Product: [
    { name: "Platform", href: "/platform" },
    { name: "Solutions", href: "/solutions" },
    { name: "Pricing", href: "/pricing" },
    { name: "Enterprise", href: "/enterprise" },
  ],
  Platform: [
    { name: "Policy engine", href: "/platform/policy-engine" },
    { name: "Grounded answers", href: "/platform/grounded-answers" },
    { name: "API reference", href: "/resources/api" },
    { name: "Changelog", href: "/resources/changelogs" },
  ],
  Account: [
    { name: "Sign in", href: "/auth/login" },
    { name: "Create account", href: "/auth/register" },
    { name: "Reset password", href: "/auth/forgot-password" },
  ],
};

export function FooterSection() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-foreground/10 border-t">
      {/* Animated wave background */}
      <div className="pointer-events-none absolute inset-0 h-64 overflow-hidden opacity-20">
        <AnimatedWave />
      </div>

      <div className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-12">
        {/* Main Footer */}
        <div className="py-16 lg:py-24">
          <div className="grid grid-cols-2 gap-12 md:grid-cols-5 lg:gap-8">
            {/* Brand Column */}
            <div className="col-span-2">
              <Link href="/" className="mb-6 inline-flex items-center gap-2">
                <Image src="/brand-mark.png" alt="" width={72} height={72} unoptimized className="size-8 shrink-0" />
                <span className="font-display text-2xl">Bridle</span>
                <span className="font-mono text-muted-foreground text-xs">AI</span>
              </Link>

              <p className="mb-8 max-w-xs text-muted-foreground leading-relaxed">
                AI assistants that stay inside an approved domain, with the policies, citations and audit trail to prove
                it.
              </p>

              <p className="font-mono text-muted-foreground text-xs">Built with Django, PostgreSQL and Next.js.</p>
            </div>

            {/* Link Columns */}
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h3 className="mb-6 font-medium text-sm">{title}</h3>
                <ul className="space-y-4">
                  {links.map((link) => (
                    <li key={link.name}>
                      {link.href.startsWith("/") ? (
                        <Link
                          href={link.href}
                          className="inline-flex items-center gap-2 text-muted-foreground text-sm transition-colors hover:text-foreground"
                        >
                          {link.name}
                        </Link>
                      ) : (
                        <a
                          href={link.href}
                          className="inline-flex items-center gap-2 text-muted-foreground text-sm transition-colors hover:text-foreground"
                        >
                          {link.name}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-foreground/10 border-t py-8 md:flex-row">
          <p className="text-muted-foreground text-sm">© {year} Bridle AI. All rights reserved.</p>

          <div className="flex items-center gap-4 text-muted-foreground text-sm">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-foreground/40" />
              Runs on your infrastructure
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
