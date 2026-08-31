import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface VintageCardProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  className?: string;
  children?: ReactNode;
}

export function VintageCard({
  icon: Icon,
  title,
  description,
  className,
  children,
}: VintageCardProps) {
  return (
    <div className={cn("vintage-card group h-full relative overflow-hidden", className)}>
      {/* Corner flourish decoration */}
      <div className="absolute top-0 right-0 w-16 h-16 opacity-0 group-hover:opacity-20 transition-opacity duration-500">
        <svg viewBox="0 0 100 100" className="w-full h-full text-primary transform translate-x-4 -translate-y-4 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-500">
          <path
            d="M0,100 Q50,50 100,0 Q50,50 100,100"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
        </svg>
      </div>

      {/* Top shine effect */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="vintage-card-header relative z-10">
        {Icon && (
          <div className="relative inline-block">
            <Icon className="h-10 w-10 text-primary mb-3 transform group-hover:scale-110 group-hover:text-primary/80 transition-all duration-300" />
            {/* Icon glow effect */}
            <div className="absolute inset-0 blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300">
              <Icon className="h-10 w-10 text-primary" />
            </div>
          </div>
        )}
        <h3 className="vintage-card-title group-hover:text-primary/80 transition-colors duration-300">
          {title}
        </h3>
      </div>
      <p className="vintage-body text-muted-foreground relative z-10 group-hover:text-foreground transition-colors duration-300">
        {description}
      </p>
      {children}
    </div>
  );
}

interface VintageBenefitListProps {
  items: string[];
  title: string;
}

export function VintageBenefitList({ items, title }: VintageBenefitListProps) {
  return (
    <div className="vintage-benefit-list">
      <h3 className="vintage-title-small mb-4">{title}</h3>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li
            key={i}
            className="flex items-center gap-3 vintage-body text-muted-foreground group"
          >
            <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0 group-hover:scale-150 group-hover:bg-primary/70 transition-all duration-300" />
            <span className="group-hover:translate-x-2 transition-transform duration-300">
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}