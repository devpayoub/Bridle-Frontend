"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "cn";

const ITEMS = [
  { href: "/dashboard/settings", label: "General" },
  { href: "/dashboard/settings/account", label: "Account" },
  { href: "/dashboard/settings/security", label: "Security" },
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Settings sections" className="flex items-center gap-1 border-b">
      {ITEMS.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "-mb-px border-b-2 px-3 py-2 text-sm transition-colors",
              active
                ? "border-foreground font-medium text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
