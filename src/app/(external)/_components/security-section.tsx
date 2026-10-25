"use client";

import { useEffect, useRef, useState } from "react";

import { Eye, FileCheck, Lock, Shield } from "lucide-react";

const securityFeatures = [
  {
    icon: Shield,
    title: "Tenant isolation",
    description:
      "Querysets are organisation-filtered, services reject foreign objects, and a cross-tenant lookup returns 404.",
  },
  {
    icon: Lock,
    title: "Secrets stay server-side",
    description: "Access and refresh tokens live in httpOnly cookies. No API token is ever readable from JavaScript.",
  },
  {
    icon: Eye,
    title: "Screened on both sides",
    description:
      "Requests are checked before generation and answers after. A model classifier may tighten a decision, never loosen one.",
  },
  {
    icon: FileCheck,
    title: "Append-only audit",
    description: "Role changes, key rotations and configuration edits are recorded with the actor and the request id.",
  },
];

const certifications = ["RBAC", "httpOnly", "Tenant-scoped", "Idempotent", "PII blocking"];

export function SecuritySection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 },
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="security" ref={sectionRef} className="relative py-24 lg:py-32 bg-foreground/[0.02] overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Left: Content */}
          <div
            className={`transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
              <span className="w-8 h-px bg-foreground/30" />
              Security
            </span>
            <h2 className="text-4xl lg:text-6xl font-display tracking-tight mb-8">
              Trust is
              <br />
              non-negotiable.
            </h2>
            <p className="mb-12 text-muted-foreground text-xl leading-relaxed">
              The model is the least trusted part of the system. Identity, tenancy and policy are enforced before a
              provider is ever called.
            </p>

            {/* Certifications */}
            <div className="flex flex-wrap gap-3">
              {certifications.map((cert, index) => (
                <span
                  key={cert}
                  className={`px-4 py-2 border border-foreground/10 text-sm font-mono transition-all duration-500 ${
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  }`}
                  style={{ transitionDelay: `${index * 50 + 200}ms` }}
                >
                  {cert}
                </span>
              ))}
            </div>
          </div>

          {/* Right: Features */}
          <div className="grid gap-6">
            {securityFeatures.map((feature, index) => (
              <div
                key={feature.title}
                className={`p-6 border border-foreground/10 hover:border-foreground/20 transition-all duration-500 group ${
                  isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-10 h-10 flex items-center justify-center border border-foreground/10 group-hover:bg-foreground group-hover:text-background transition-colors duration-300">
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-1 group-hover:translate-x-1 transition-transform duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
