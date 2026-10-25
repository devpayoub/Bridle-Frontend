"use client";

import { useEffect, useState } from "react";

/**
 * Design principles, not customer quotes.
 *
 * Every claim here maps to something the codebase actually enforces, so the
 * section stays honest before there are reference customers to quote.
 */
const principles = [
  {
    quote: "A refusal is a feature, not a failure.",
    title: "Policy engine",
    detail: "Deterministic rules run first. The optional classifier may only tighten a decision, never loosen one.",
    metric: "Every refusal carries a reason code",
  },
  {
    quote: "If it isn't grounded, it isn't answered.",
    title: "Retrieval",
    detail: "Only the knowledge bases attached to the assistant are searched, and every claim keeps its source.",
    metric: "Answers cite document and chunk",
  },
  {
    quote: "Tenants never share a query path.",
    title: "Isolation",
    detail: "Queryset, service and permission checks all run before an object is returned to a caller.",
    metric: "Cross-tenant access returns 404",
  },
  {
    quote: "Every decision can be replayed.",
    title: "Audit",
    detail: "Policy version, evaluator version, decision and latency are stored for each request.",
    metric: "730 days of history",
  },
];

export function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % principles.length);
        setIsAnimating(false);
      }, 300);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const activePrinciple = principles[activeIndex];

  return (
    <section className="relative border-foreground/10 border-t py-32 lg:py-40 lg:pb-14">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        {/* Section Label */}
        <div className="mb-16 flex items-center gap-4">
          <span className="font-mono text-muted-foreground text-xs uppercase tracking-widest">Design principles</span>
          <div className="h-px flex-1 bg-foreground/10" />
          <span className="font-mono text-muted-foreground text-xs">
            {String(activeIndex + 1).padStart(2, "0")} / {String(principles.length).padStart(2, "0")}
          </span>
        </div>

        {/* Main Quote */}
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-8">
            <blockquote
              className={`transition-all duration-300 ${
                isAnimating ? "translate-y-4 opacity-0" : "translate-y-0 opacity-100"
              }`}
            >
              <p className="font-display text-4xl text-foreground leading-[1.1] tracking-tight md:text-5xl lg:text-6xl">
                &ldquo;{activePrinciple.quote}&rdquo;
              </p>
            </blockquote>

            {/* Principle */}
            <div
              className={`mt-12 flex items-center gap-6 transition-all delay-100 duration-300 ${
                isAnimating ? "opacity-0" : "opacity-100"
              }`}
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-foreground/10 bg-foreground/5">
                <span className="font-display text-2xl text-foreground">{activePrinciple.title.charAt(0)}</span>
              </div>
              <div>
                <p className="font-medium text-foreground text-lg">{activePrinciple.title}</p>
                <p className="max-w-lg text-muted-foreground">{activePrinciple.detail}</p>
              </div>
            </div>
          </div>

          {/* Metric Highlight */}
          <div className="flex flex-col justify-center lg:col-span-4">
            <div
              className={`border border-foreground/10 p-8 transition-all duration-300 ${
                isAnimating ? "scale-95 opacity-0" : "scale-100 opacity-100"
              }`}
            >
              <span className="mb-4 block font-mono text-muted-foreground text-xs uppercase tracking-widest">
                Enforced by
              </span>
              <p className="font-display text-3xl text-foreground md:text-4xl">{activePrinciple.metric}</p>
            </div>

            {/* Navigation Dots */}
            <div className="mt-8 flex gap-2">
              {principles.map((principle, idx) => (
                <button
                  key={principle.title}
                  type="button"
                  aria-label={`Show ${principle.title}`}
                  onClick={() => {
                    setIsAnimating(true);
                    setTimeout(() => {
                      setActiveIndex(idx);
                      setIsAnimating(false);
                    }, 300);
                  }}
                  className={`h-2 transition-all duration-300 ${
                    idx === activeIndex ? "w-8 bg-foreground" : "w-2 bg-foreground/20 hover:bg-foreground/40"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Keyword marquee label */}
        <div className="mt-24 border-foreground/10 border-t pt-12">
          <p className="mb-8 text-center font-mono text-muted-foreground text-xs uppercase tracking-widest">
            Built on constraints, not vibes
          </p>
        </div>
      </div>

      {/* Full-width marquee outside container */}
      <div className="w-full">
        <div className="marquee flex items-center gap-16">
          {[...Array(2)].map((_, setIdx) => (
            <div key={setIdx} className="flex shrink-0 items-center gap-16">
              {[
                "Policy first",
                "Grounded",
                "Auditable",
                "Multi-tenant",
                "Idempotent",
                "Refusals are answers",
                "Versioned config",
                "Scoped keys",
              ].map((keyword) => (
                <span
                  key={`${setIdx}-${keyword}`}
                  className="whitespace-nowrap font-display text-foreground/30 text-xl transition-colors duration-300 hover:text-foreground md:text-2xl"
                >
                  {keyword}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
