import { LucideIcon } from "lucide-react";

interface VintageStepProps {
  number: string;
  title: string;
  description: string;
  icon: LucideIcon;
  isLast?: boolean;
}

export function VintageStep({ number, title, description, icon: Icon, isLast }: VintageStepProps) {
  return (
    <div className="relative group/step h-full">
      <div className="vintage-card h-full cursor-default">
        {/* Step number badge */}
        <div className="absolute -top-4 -left-4 h-12 w-12 flex items-center justify-center bg-primary text-primary-foreground font-bold text-lg shadow-md transition-all duration-300 group-hover/step:scale-110 group-hover/step:rotate-3 group-hover/step:shadow-lg group-hover/step:bg-primary/90 z-10">
          {number}
        </div>

        {/* Top shine effect */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="vintage-card-header pt-4">
          <div className="relative inline-block">
            <Icon className="h-10 w-10 text-primary mb-3 transform group-hover/step:scale-110 group-hover/step:text-primary/80 transition-all duration-300" />
            {/* Icon glow on hover */}
            <div className="absolute inset-0 blur-xl opacity-0 group-hover/step:opacity-40 transition-opacity duration-300">
              <Icon className="h-10 w-10 text-primary" />
            </div>
          </div>
          <h3 className="vintage-card-title group-hover/step:text-primary/80 transition-colors duration-300">
            {title}
          </h3>
        </div>
        <p className="vintage-body text-muted-foreground group-hover/step:text-foreground transition-colors duration-300">
          {description}
        </p>
      </div>

      {!isLast && (
        <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary to-transparent transition-all duration-300 group-hover/step:from-primary/80 group-hover/step:to-primary/30 group-hover/step:w-12" />
      )}
    </div>
  );
}