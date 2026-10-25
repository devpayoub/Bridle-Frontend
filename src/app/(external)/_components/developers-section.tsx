"use client";

import { useEffect, useRef, useState } from "react";

import Link from "next/link";

import { Check, Copy } from "lucide-react";

const codeExamples = [
  {
    label: "curl",
    code: `curl -X POST "$API/v1/chat/completions/" \\
  -H "Authorization: Bearer bb-..." \\
  -H "Content-Type: application/json" \\
  -H "Idempotency-Key: 4f9c2a" \\
  -d '{
    "assistant_id": "9d2c...",
    "message": "What time is check-in?"
  }'`,
  },
  {
    label: "TypeScript",
    code: `const response = await fetch(\`\${API}/v1/chat/completions/\`, {
  method: "POST",
  headers: {
    Authorization: \`Bearer \${process.env.GUARDRAIL_KEY}\`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    assistant_id: assistantId,
    message: "What time is check-in?",
  }),
})

const result = await response.json()
// result.decision   -> "ALLOW"
// result.citations  -> [{ document_title, chunk_index }]`,
  },
  {
    label: "Python",
    code: `import requests

response = requests.post(
    f"{API}/v1/chat/completions/",
    headers={"Authorization": f"Bearer {KEY}"},
    json={
        "assistant_id": assistant_id,
        "message": "What time is check-in?",
    },
    timeout=60,
)

result = response.json()
print(result["decision"], result["reason_code"])`,
  },
];

const features = [
  {
    title: "REST + OpenAPI",
    description: "The schema is generated from the views, not hand-written.",
  },
  {
    title: "Idempotency keys",
    description: "A retry returns the original response for 24 hours.",
  },
  {
    title: "Typed responses",
    description: "Decision, reason code, citations and usage in one payload.",
  },
  {
    title: "No SDK required",
    description: "Any HTTP client works. The console is optional.",
  },
];

export function DevelopersSection({ docsUrl }: { docsUrl: string }) {
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(codeExamples[activeTab].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
    <section id="developers" ref={sectionRef} className="relative py-24 lg:py-32 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          {/* Left: Content */}
          <div
            className={`transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
              <span className="w-8 h-px bg-foreground/30" />
              For developers
            </span>
            <h2 className="mb-8 font-display text-4xl tracking-tight lg:text-6xl">
              An API you can
              <br />
              <span className="text-muted-foreground">reason about.</span>
            </h2>
            <p className="mb-12 text-muted-foreground text-xl leading-relaxed">
              One endpoint returns the answer, the decision that produced it, the sources behind it and what it cost.
              Refusals are responses, not exceptions.
            </p>

            {/* Features */}
            <div className="grid grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className={`transition-all duration-500 ${
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  }`}
                  style={{ transitionDelay: `${index * 50 + 200}ms` }}
                >
                  <h3 className="font-medium mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Code block */}
          <div
            className={`lg:sticky lg:top-32 transition-all duration-700 delay-200 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
            }`}
          >
            <div className="border border-foreground/10">
              {/* Tabs */}
              <div className="flex items-center border-b border-foreground/10">
                {codeExamples.map((example, idx) => (
                  <button
                    key={example.label}
                    type="button"
                    onClick={() => setActiveTab(idx)}
                    className={`px-6 py-4 text-sm font-mono transition-colors relative ${
                      activeTab === idx ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {example.label}
                    {activeTab === idx && <span className="absolute bottom-0 left-0 right-0 h-px bg-foreground" />}
                  </button>
                ))}
                <div className="flex-1" />
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-4 py-4 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Copy code"
                >
                  {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Code content */}
              <div className="p-8 font-mono text-sm bg-foreground/[0.01] min-h-[220px]">
                <pre className="text-foreground/80">
                  {codeExamples[activeTab].code.split("\n").map((line, lineIndex) => (
                    <div
                      key={`${activeTab}-${lineIndex}`}
                      className="leading-loose dev-code-line"
                      style={{ animationDelay: `${lineIndex * 80}ms` }}
                    >
                      <span className="inline-flex">
                        {line.split("").map((char, charIndex) => (
                          <span
                            key={`${activeTab}-${lineIndex}-${charIndex}`}
                            className="dev-code-char"
                            style={{
                              animationDelay: `${lineIndex * 80 + charIndex * 15}ms`,
                            }}
                          >
                            {char === " " ? "\u00A0" : char}
                          </span>
                        ))}
                      </span>
                    </div>
                  ))}
                </pre>
              </div>
            </div>

            {/* Links */}
            <div className="mt-6 flex items-center gap-6 text-sm">
              <a
                href={docsUrl}
                className="text-foreground underline-offset-4 hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                API reference
              </a>
              <span className="text-foreground/20">|</span>
              <Link href="/auth/register" className="text-muted-foreground hover:text-foreground">
                Get a key
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
