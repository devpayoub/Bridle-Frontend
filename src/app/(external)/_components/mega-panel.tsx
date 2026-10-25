"use client";

import Link from "next/link";

import { ArrowRightIcon } from "lucide-react";

import type { FeatureColumn, ListColumn, MegaMenu, StoryColumn } from "../_content/navigation";
import { MenuArt } from "./menu-art";

function FeaturePanel({ column }: { column: FeatureColumn }) {
  return (
    <div className="flex flex-col gap-4 rounded-xl bg-[#f4f0e4] p-5">
      <span className="font-mono text-[11px] text-foreground/55 uppercase tracking-widest">{column.eyebrow}</span>

      <div className="h-[104px] overflow-hidden rounded-lg">
        <MenuArt variant={column.art} className="h-full w-full" />
      </div>

      <p className="font-display text-[21px] text-foreground leading-[1.15] tracking-tight">{column.title}</p>

      <div className="mt-auto flex flex-col gap-3 border-foreground/10 border-t pt-3">
        <Link
          href={column.href}
          className="inline-flex items-center gap-1.5 font-medium text-[13px] text-foreground/70 transition-colors hover:text-foreground"
        >
          {column.cta}
          <ArrowRightIcon className="size-3.5" />
        </Link>

        <ul className="flex flex-col">
          {column.links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="block py-1 text-[13px] text-foreground/75 transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ListPanel({ column }: { column: ListColumn }) {
  return (
    <div className="flex flex-col gap-4 rounded-xl bg-foreground p-5 text-background">
      <span className="font-mono text-[11px] text-background/50 uppercase tracking-widest">{column.eyebrow}</span>
      <ul className="flex flex-col">
        {column.links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="group flex items-center justify-between gap-3 border-background/10 border-b py-2.5 text-[14px] text-background/80 transition-colors last:border-b-0 hover:text-background"
            >
              {link.label}
              <ArrowRightIcon className="size-3.5 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-70" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StoryPanel({ column }: { column: StoryColumn }) {
  return (
    <div className="flex flex-col gap-4 rounded-xl bg-[#e8eef2] p-5">
      <span className="font-mono text-[11px] text-foreground/55 uppercase tracking-widest">{column.eyebrow}</span>

      <div className="h-[104px] overflow-hidden rounded-lg">
        <MenuArt variant={column.art} className="h-full w-full" />
      </div>

      <p className="font-display text-[19px] text-foreground leading-[1.2] tracking-tight">{column.title}</p>

      <Link
        href={column.href}
        className="mt-auto inline-flex items-center justify-end gap-1.5 font-medium text-[12px] text-foreground/70 transition-colors hover:text-foreground"
      >
        {column.cta}
        <ArrowRightIcon className="size-3.5" />
      </Link>
    </div>
  );
}

/**
 * Mega menu panel.
 *
 * Three columns like a newspaper page: a feature card that carries the section's
 * own sub-links, a high-contrast index of everything in the section, and a small
 * "from the docs" card. Rendered inside the nav so it stays centred on the bar
 * rather than on whichever trigger opened it.
 */
export function MegaPanel({ menu }: { menu: MegaMenu }) {
  const [feature, list, story] = menu.columns;

  return (
    <div className="absolute top-[calc(100%+10px)] left-1/2 w-[min(1060px,calc(100vw-2rem))] -translate-x-1/2 rounded-2xl border border-foreground/10 bg-background p-2.5 shadow-[0_28px_70px_-30px_rgba(0,0,0,0.45)]">
      <div className="grid grid-cols-1 gap-2.5 md:grid-cols-[1.05fr_0.78fr_1fr]">
        <FeaturePanel column={feature} />
        <ListPanel column={list} />
        <StoryPanel column={story} />
      </div>
    </div>
  );
}
