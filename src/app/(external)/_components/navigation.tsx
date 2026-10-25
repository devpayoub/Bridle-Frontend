"use client";

import { useEffect, useRef, useState } from "react";

import Image from "next/image";
import Link from "next/link";

import { ChevronDownIcon, Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";

import { DIRECT_LINKS, MENUS } from "../_content/navigation";
import { MegaPanel } from "./mega-panel";

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenMenu(null);
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // The mobile overlay covers the page, so the page behind it must not scroll.
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isMobileMenuOpen]);

  // A small delay stops the panel flickering when the pointer crosses the gap
  // between the trigger and the panel.
  const openWithIntent = (label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenMenu(label);
  };

  const closeWithDelay = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenMenu(null), 140);
  };

  const activeMenu = MENUS.find((menu) => menu.label === openMenu) ?? null;

  return (
    // Hover is a convenience: the same menus open by click and by keyboard focus,
    // so the pointer handler does not need a keyboard twin.
    // biome-ignore lint/a11y/noStaticElementInteractions: hover affordance only
    <header
      className={`fixed z-50 transition-all duration-500 ${isScrolled ? "top-4 right-4 left-4" : "top-0 right-0 left-0"}`}
      onMouseLeave={closeWithDelay}
    >
      <nav
        className={`relative z-50 mx-auto transition-all duration-500 ${
          isScrolled || isMobileMenuOpen
            ? "max-w-[1200px] rounded-2xl border border-foreground/10 bg-background/85 shadow-lg backdrop-blur-xl"
            : "max-w-[1400px] bg-transparent"
        }`}
      >
        <div
          className={`flex items-center justify-between px-6 transition-all duration-500 lg:px-8 ${
            isScrolled ? "h-14" : "h-20"
          }`}
        >
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-2">
            <Image
              src="/brand-mark.png"
              alt=""
              width={72}
              height={72}
              priority
              unoptimized
              className={`shrink-0 transition-all duration-500 ${isScrolled ? "size-7" : "size-8"}`}
            />
            <span
              className={`font-display tracking-tight transition-all duration-500 ${isScrolled ? "text-xl" : "text-2xl"}`}
            >
              Bridle
            </span>
            <span
              className={`font-mono text-muted-foreground transition-all duration-500 ${isScrolled ? "mt-0.5 text-[10px]" : "mt-1 text-xs"}`}
            >
              AI
            </span>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden items-center gap-8 lg:flex">
            {MENUS.map((menu) => {
              const isOpen = openMenu === menu.label;
              return (
                <button
                  key={menu.label}
                  type="button"
                  aria-haspopup="true"
                  aria-expanded={isOpen}
                  onMouseEnter={() => openWithIntent(menu.label)}
                  onFocus={() => openWithIntent(menu.label)}
                  onClick={() => setOpenMenu(isOpen ? null : menu.label)}
                  className={`group relative flex items-center gap-1 text-sm transition-colors duration-300 ${
                    isOpen ? "text-foreground" : "text-foreground/70 hover:text-foreground"
                  }`}
                >
                  {menu.label}
                  <ChevronDownIcon
                    className={`size-3.5 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                  />
                  <span
                    className={`absolute -bottom-1 left-0 h-px bg-foreground transition-all duration-300 ${
                      isOpen ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </button>
              );
            })}

            {DIRECT_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onMouseEnter={closeWithDelay}
                className="group relative text-foreground/70 text-sm transition-colors duration-300 hover:text-foreground"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-foreground transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden items-center gap-4 lg:flex">
            <Link
              href="/auth/login"
              className={`text-foreground/70 transition-all duration-500 hover:text-foreground ${isScrolled ? "text-xs" : "text-sm"}`}
            >
              Sign in
            </Link>
            <Button
              asChild
              size="sm"
              className={`rounded-full bg-foreground text-background transition-all duration-500 hover:bg-foreground/90 ${isScrolled ? "h-8 px-4 text-xs" : "px-6"}`}
            >
              <Link href="/auth/register">Start free</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 lg:hidden"
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {activeMenu ? <MegaPanel menu={activeMenu} /> : null}
      </nav>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 z-40 overflow-y-auto bg-background transition-all duration-500 lg:hidden ${
          isMobileMenuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        style={{ top: 0 }}
      >
        <div className="flex min-h-full flex-col px-6 pt-24 pb-8">
          <div className="flex flex-1 flex-col gap-6">
            {MENUS.map((menu) => (
              <div key={menu.label} className="flex flex-col gap-1.5">
                <Link
                  href={menu.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="font-display text-2xl text-foreground"
                >
                  {menu.label}
                </Link>
                <div className="flex flex-wrap gap-x-4 gap-y-1 pl-0.5">
                  {menu.columns[1].links
                    .filter((link) => link.href !== menu.href)
                    .map((link) => (
                      <Link
                        key={`${menu.label}-${link.href}`}
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-muted-foreground text-sm transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    ))}
                </div>
              </div>
            ))}

            {DIRECT_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="font-display text-2xl text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex gap-3 border-foreground/10 border-t pt-6">
            <Button asChild variant="outline" className="h-12 flex-1 rounded-full">
              <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                Sign in
              </Link>
            </Button>
            <Button asChild className="h-12 flex-1 rounded-full bg-foreground text-background">
              <Link href="/auth/register" onClick={() => setIsMobileMenuOpen(false)}>
                Start free
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
