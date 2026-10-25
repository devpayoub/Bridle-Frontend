"use client";

import { useState } from "react";

import Link from "next/link";

import { ArrowRight, Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    description: "For a first assistant and a small team",
    price: { monthly: 0, annual: 0 },
    features: [
      "1 assistant",
      "1,000 chat requests / month",
      "3 members",
      "5 API keys",
      "Approved-source retrieval",
      "Per-request audit log",
    ],
    cta: "Start free",
    popular: false,
  },
  {
    name: "Starter",
    description: "For a team running assistants in production",
    price: { monthly: 49, annual: 39 },
    features: [
      "5 assistants",
      "50,000 chat requests / month",
      "10 members",
      "20 API keys",
      "Policy evaluation endpoint",
      "Usage and quota reporting",
      "Email support",
    ],
    cta: "Start free trial",
    popular: true,
  },
  {
    name: "Business",
    description: "For several teams and heavier traffic",
    price: { monthly: 249, annual: 199 },
    features: [
      "50 assistants",
      "500,000 chat requests / month",
      "50 members",
      "100 API keys",
      "Audit history and export",
      "Custom quota overrides",
      "Priority support",
    ],
    cta: "Start free trial",
    popular: false,
  },
];

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <section id="pricing" className="relative py-32 lg:py-40 border-t border-foreground/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="max-w-3xl mb-20">
          <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase block mb-6">Pricing</span>
          <h2 className="font-display text-5xl md:text-6xl lg:text-7xl tracking-tight text-foreground mb-6">
            Simple, transparent
            <br />
            <span className="text-stroke">pricing</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl">
            Start free and scale as you grow. No hidden fees, no surprises.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center gap-4 mb-16">
          <span className={`text-sm transition-colors ${!isAnnual ? "text-foreground" : "text-muted-foreground"}`}>
            Monthly
          </span>
          <button
            type="button"
            aria-label="Toggle annual billing"
            aria-pressed={isAnnual}
            onClick={() => setIsAnnual(!isAnnual)}
            className="relative w-14 h-7 bg-foreground/10 rounded-full p-1 transition-colors hover:bg-foreground/20"
          >
            <div
              className={`w-5 h-5 bg-foreground rounded-full transition-transform duration-300 ${
                isAnnual ? "translate-x-7" : "translate-x-0"
              }`}
            />
          </button>
          <span className={`text-sm transition-colors ${isAnnual ? "text-foreground" : "text-muted-foreground"}`}>
            Annual
          </span>
          {isAnnual && (
            <span className="ml-2 bg-foreground px-2 py-1 font-mono text-primary-foreground text-xs">Save 20%</span>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-px bg-foreground/10">
          {plans.map((plan, idx) => (
            <div
              key={plan.name}
              className={`relative p-8 lg:p-12 bg-background ${
                plan.popular ? "md:-my-4 md:py-12 lg:py-16 border-2 border-foreground" : ""
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-8 px-3 py-1 bg-foreground text-primary-foreground text-xs font-mono uppercase tracking-widest">
                  Most Popular
                </span>
              )}

              {/* Plan Header */}
              <div className="mb-8">
                <span className="font-mono text-xs text-muted-foreground">{String(idx + 1).padStart(2, "0")}</span>
                <h3 className="font-display text-3xl text-foreground mt-2">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="mb-8 pb-8 border-b border-foreground/10">
                {plan.price.monthly !== null ? (
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-5xl lg:text-6xl text-foreground">
                      ${isAnnual ? plan.price.annual : plan.price.monthly}
                    </span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                ) : (
                  <span className="font-display text-4xl text-foreground">Custom</span>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-10">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-foreground mt-0.5 shrink-0" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href="/auth/register"
                className={`group flex w-full items-center justify-center gap-2 py-4 font-medium text-sm transition-all ${
                  plan.popular
                    ? "bg-foreground text-primary-foreground hover:bg-foreground/90"
                    : "border border-foreground/20 text-foreground hover:border-foreground hover:bg-foreground/5"
                }`}
              >
                {plan.cta}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          ))}
        </div>

        {/* Bottom Note */}
        <p className="mt-12 text-center text-muted-foreground text-sm">
          Every plan runs the same policy pipeline and audit trail. Self-host the API when data cannot leave your
          network.{" "}
          <Link href="/docs" className="underline underline-offset-4 transition-colors hover:text-foreground">
            Read the docs
          </Link>
        </p>
      </div>
    </section>
  );
}
