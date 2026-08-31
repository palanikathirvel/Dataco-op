"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VintageHeroProps {
  eyebrow?: string;
  title: string;
  highlightedText: string;
  subtitle: string;
  primaryCta: {
    text: string;
    href: string;
  };
  secondaryCta?: {
    text: string;
    href: string;
  };
}

export function VintageHero({
  eyebrow,
  title,
  highlightedText,
  subtitle,
  primaryCta,
  secondaryCta,
}: VintageHeroProps) {
  return (
    <section className="relative pt-24 pb-20 md:pt-32 md:pb-32 overflow-hidden vintage-paper-textured page-veil">
      {/* Animated background ornaments */}
      <div className="absolute inset-0 -z-10 opacity-20 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 border-4 border-primary/30 rounded-full -translate-y-1/2 translate-x-1/2 animate-slow-rotate" />
        <div className="absolute bottom-0 left-0 w-72 h-72 border-2 border-primary/20 rounded-full translate-y-1/2 -translate-x-1/2 animate-slow-rotate" style={{ animationDirection: "reverse" }} />
        <div className="absolute top-1/3 right-1/4 w-4 h-4 bg-primary/40 rounded-full animate-float" />
        <div className="absolute bottom-1/3 left-1/3 w-3 h-3 bg-primary/30 rounded-full animate-float" style={{ animationDelay: "1s" }} />
      </div>

      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          {eyebrow && (
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 mb-6 text-sm font-medium tracking-wide animate-fade-in-up border border-primary/20 hover:border-primary/40 hover:bg-primary/15 transition-all duration-300 cursor-default">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary animate-pulse-vintage"></span>
              </span>
              <span className="vintage-title-small">{eyebrow}</span>
            </div>
          )}

          <h1 className="vintage-title text-4xl md:text-6xl mb-6 animate-fade-in-up delay-100">
            {title}{" "}
            <span className="text-primary italic script-accent font-normal inline-block hover:scale-105 transition-transform duration-300">
              {highlightedText}
            </span>
          </h1>

          <p className="vintage-body text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in-up delay-200">
            {subtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-300">
            <Link href={primaryCta.href}>
              <Button size="lg" className="w-full sm:w-auto gap-2 group">
                {primaryCta.text}
                <ArrowRight className="h-4 w-4 transform group-hover:translate-x-2 transition-transform duration-300" />
              </Button>
            </Link>
            {secondaryCta && (
              <Link href={secondaryCta.href}>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  {secondaryCta.text}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}