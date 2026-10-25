"use client";

import { useEffect, useRef, useState } from "react";

const stages = [
  { name: "Screen request", stage: "Policy engine", result: "allow · refuse · clarify" },
  { name: "Retrieve", stage: "Approved sources only", result: "top 5 chunks" },
  { name: "Generate", stage: "Configured provider", result: "mock · openai · anthropic" },
  { name: "Validate response", stage: "Constraints and grounding", result: "cited or refused" },
  { name: "Persist", stage: "Conversation and usage", result: "single transaction" },
  { name: "Audit", stage: "Append-only trail", result: "730 days" },
];

export function InfrastructureSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeStage, setActiveStage] = useState(0);
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

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStage((prev) => (prev + 1) % stages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section ref={sectionRef} className="relative overflow-hidden py-24 lg:py-32">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
          {/* Left: Content */}
          <div
            className={`transition-all duration-700 ${
              isVisible ? "translate-x-0 opacity-100" : "-translate-x-8 opacity-0"
            }`}
          >
            <span className="mb-6 inline-flex items-center gap-3 font-mono text-muted-foreground text-sm">
              <span className="h-px w-8 bg-foreground/30" />
              Pipeline
            </span>
            <h2 className="mb-8 font-display text-4xl tracking-tight lg:text-6xl">
              Every request,
              <br />
              end to end.
            </h2>
            <p className="mb-12 text-muted-foreground text-xl leading-relaxed">
              A single call runs six deterministic stages. Nothing is retrieved outside the attached sources, and
              nothing reaches the user without passing the response check.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8">
              <div>
                <div className="mb-2 font-display text-4xl lg:text-5xl">6</div>
                <div className="text-muted-foreground text-sm">Stages per call</div>
              </div>
              <div>
                <div className="mb-2 font-display text-4xl lg:text-5xl">5</div>
                <div className="text-muted-foreground text-sm">Sources retrieved</div>
              </div>
              <div>
                <div className="mb-2 font-display text-4xl lg:text-5xl">730</div>
                <div className="text-muted-foreground text-sm">Days of audit</div>
              </div>
            </div>
          </div>

          {/* Right: Stage list */}
          <div
            className={`transition-all delay-200 duration-700 ${
              isVisible ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
            }`}
          >
            <div className="border border-foreground/10">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-foreground/10 px-6 py-4">
                <span className="font-mono text-muted-foreground text-sm">Request pipeline</span>
                <span className="flex items-center gap-2 font-mono text-green-600 text-xs">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                  All checks active
                </span>
              </div>

              {/* Stages */}
              <div>
                {stages.map((stage, index) => (
                  <div
                    key={stage.name}
                    className={`flex items-center justify-between border-foreground/5 border-b px-6 py-5 transition-all duration-300 last:border-b-0 ${
                      activeStage === index ? "bg-foreground/[0.02]" : ""
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className={`h-2 w-2 rounded-full transition-colors duration-300 ${
                          activeStage === index ? "bg-foreground" : "bg-foreground/20"
                        }`}
                      />
                      <div>
                        <div className="font-medium">{stage.name}</div>
                        <div className="text-muted-foreground text-sm">{stage.stage}</div>
                      </div>
                    </div>
                    <span className="font-mono text-muted-foreground text-sm">{stage.result}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
