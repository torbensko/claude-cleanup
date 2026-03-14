import type { PlanEntry } from "@/types/conversations";
import { cn } from "@/lib/utils";
import { FileText } from "lucide-react";

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  return `${(bytes / 1024).toFixed(1)}KB`;
}

interface PlanItemProps {
  plan: PlanEntry;
  isSelected: boolean;
  onClick: () => void;
}

export function PlanItem({ plan, isSelected, onClick }: PlanItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-3 py-2.5 rounded-lg transition-colors",
        isSelected
          ? "bg-accent text-accent-foreground"
          : "hover:bg-accent/50 text-foreground"
      )}
    >
      <p className="text-sm font-medium line-clamp-2">{plan.title}</p>

      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
        <span className="shrink-0">{formatRelativeDate(plan.modified)}</span>
        <div className="flex items-center gap-0.5 ml-auto shrink-0">
          <FileText className="h-3 w-3" />
          <span>{formatSize(plan.sizeBytes)}</span>
        </div>
      </div>
    </button>
  );
}
