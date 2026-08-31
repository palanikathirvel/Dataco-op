import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface VintageSectionProps {
  id?: string;
  children: ReactNode;
  className?: string;
  background?: "default" | "muted" | "dark" | "parchment" | "grey-dark" | "grey-medium";
}

export function VintageSection({
  id,
  children,
  className,
  background = "default",
}: VintageSectionProps) {
  const bgClass = {
    default: "",
    muted: "bg-muted/30",
    dark: "bg-grey-dark",
    parchment: "bg-parchment",
    "grey-dark": "bg-grey-dark",
    "grey-medium": "bg-grey-medium",
  }[background];

  return (
    <section
      id={id}
      className={cn("vintage-section vintage-paper-textured relative", bgClass, className)}
    >
      <div className="vintage-container">{children}</div>
    </section>
  );
}

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  accent?: string;
}

export function VintageSectionHeader({ title, subtitle, accent }: SectionHeaderProps) {
  return (
    <div className="vintage-section-header">
      {accent && (
        <p className="script-accent text-xl text-primary mb-2">{accent}</p>
      )}
      <h2 className="vintage-title">{title}</h2>
      {subtitle && <p className="vintage-body mt-4">{subtitle}</p>}
    </div>
  );
}