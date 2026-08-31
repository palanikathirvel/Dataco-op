"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function VintageHeader() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      setIsScrolled(scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 border-b border-muted/50 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-500",
        isScrolled
          ? "bg-background/95 shadow-lg border-primary/20"
          : "bg-background/80"
      )}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo with subtle animation */}
        <Link
          href="/"
          className="flex items-center gap-2 group"
        >
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-md group-hover:bg-primary/90">
            <span className="text-primary-foreground font-bold text-lg transition-transform duration-300 group-hover:scale-110">
              DC
            </span>
          </div>
          <span className="font-semibold text-xl tracking-tight transition-colors duration-300 group-hover:text-primary">
            DataCoop
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {[
            { href: "#how-it-works", label: "How It Works" },
            { href: "#for-users", label: "For Users" },
            { href: "#for-brands", label: "For Brands" },
            { href: "#trust", label: "Trust" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-300 relative py-1"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}