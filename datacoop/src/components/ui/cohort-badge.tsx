"use client";

import { cn } from "@/lib/utils";

const cohortColors: Record<string, string> = {
  premium_skincare_buyer: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
  frequent_foodie: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  premium_electronics_buyer: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  default: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
};

interface CohortBadgeProps {
  tag: string;
  className?: string;
  removable?: boolean;
  onRemove?: () => void;
}

export function CohortBadge({ tag, className, removable, onRemove }: CohortBadgeProps) {
  const colorClass = cohortColors[tag] || cohortColors.default;
  const displayName = tag
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium", colorClass, className)}>
      {displayName}
      {removable && onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        >
          <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
            <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
          </svg>
        </button>
      )}
    </span>
  );
}

export function CohortBadgeGroup({ tags, className, maxVisible = 3, removable, onRemove }: { tags: string[]; className?: string; maxVisible?: number; removable?: boolean; onRemove?: (tag: string) => void }) {
  const visibleTags = tags.slice(0, maxVisible);
  const remaining = tags.length - maxVisible;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {visibleTags.map((tag) => (
        <CohortBadge key={tag} tag={tag} removable={removable} onRemove={() => onRemove?.(tag)} />
      ))}
      {remaining > 0 && (
        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
          +{remaining} more
        </span>
      )}
    </div>
  );
}