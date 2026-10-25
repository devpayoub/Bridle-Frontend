import Link from "next/link";
import { notFound } from "next/navigation";

import { ArrowRightIcon } from "lucide-react";
import type { Metadata } from "next";

import { Button } from "@/components/ui/button";
import { env } from "@/lib/env";

import { CtaSection } from "../_components/cta-section";
import { DevelopersSection } from "../_components/developers-section";
import { FooterSection } from "../_components/footer-section";
import { Navigation } from "../_components/navigation";
import { PricingSection } from "../_components/pricing-section";
import { PAGE_BY_PATH, PAGES } from "../_content/marketing";

/** Only the paths defined in the content map exist; anything else is a real 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return PAGES.map((page) => ({ slug: page.path.slice(1).split("/") }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = PAGE_BY_PATH.get(`/${slug.join("/")}`);
  if (!page) return { title: "Not found" };

  return {
    title: `${page.nav} — Bridle AI`,
    description: page.summary,
    alternates: { canonical: page.path },
    openGraph: { title: `${page.nav} — Bridle AI`, description: page.summary, type: "website" },
  };
}

export default async function MarketingPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const page = PAGE_BY_PATH.get(`/${slug.join("/")}`);
  if (!page) notFound();

  const docsUrl = `${env.apiBaseUrl}/api/docs/`;

  return (
    <>
      <Navigation />
      <main className="noise-overlay relative min-h-screen overflow-x-hidden">
        <section className="mx-auto max-w-[1400px] px-6 pt-32 pb-16 lg:px-12 lg:pt-40 lg:pb-24">
          <div className="flex max-w-3xl flex-col gap-6">
            <span className="inline-flex items-center gap-3 font-mono text-muted-foreground text-sm">
              <span className="h-px w-8 bg-foreground/30" />
              {page.eyebrow}
            </span>

            <h1 className="font-display text-[clamp(2.4rem,6vw,4.4rem)] leading-[0.98] tracking-tight">{page.title}</h1>

            <p className="max-w-2xl text-lg text-muted-foreground leading-relaxed lg:text-xl">{page.summary}</p>

            <div className="flex flex-col items-start gap-3 pt-2 sm:flex-row">
              <Button asChild size="lg" className="group h-12 rounded-full bg-foreground px-6 text-background">
                <Link href="/auth/register">
                  Start free
                  <ArrowRightIcon className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 rounded-full border-foreground/20 px-6">
                <Link href="/docs">Read the docs</Link>
              </Button>
            </div>
          </div>
        </section>

        {page.sections.length > 0 ? (
          <section className="mx-auto max-w-[1400px] px-6 pb-20 lg:px-12 lg:pb-28">
            <div className="grid gap-px overflow-hidden rounded-2xl border border-foreground/10 bg-foreground/10 md:grid-cols-3">
              {page.sections.map((section, index) => (
                <article key={section.title} className="flex flex-col gap-4 bg-background p-7 lg:p-9">
                  <span className="font-mono text-muted-foreground text-xs">{String(index + 1).padStart(2, "0")}</span>
                  <h2 className="font-display text-2xl leading-tight tracking-tight">{section.title}</h2>
                  <p className="text-muted-foreground text-sm leading-relaxed">{section.body}</p>
                  {section.bullets ? (
                    <ul className="mt-auto flex flex-col gap-2 border-foreground/10 border-t pt-4">
                      {section.bullets.map((bullet) => (
                        <li key={bullet} className="flex items-start gap-2 text-foreground/80 text-sm">
                          <span className="mt-2 size-1 shrink-0 rounded-full bg-foreground/40" />
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {page.block === "pricing" ? <PricingSection /> : null}
        {page.block === "developers" ? <DevelopersSection docsUrl={docsUrl} /> : null}

        {page.related.length > 0 ? (
          <section className="mx-auto max-w-[1400px] px-6 pb-20 lg:px-12">
            <div className="flex flex-col gap-4 border-foreground/10 border-t pt-8">
              <span className="font-mono text-muted-foreground text-xs uppercase tracking-widest">Keep reading</span>
              <div className="flex flex-wrap gap-3">
                {page.related.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group inline-flex items-center gap-2 rounded-full border border-foreground/15 px-4 py-2 text-sm transition-colors hover:border-foreground/40 hover:bg-foreground/5"
                  >
                    {link.label}
                    <ArrowRightIcon className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {page.block === "pricing" ? null : <CtaSection />}
      </main>
      <FooterSection />
    </>
  );
}
