import type { ConversationEntry } from "@/types/conversations";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { MessageSquare, GitBranch, Sparkles, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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

interface ConversationItemProps {
  conversation: ConversationEntry;
  isSelected: boolean;
  onClick: () => void;
  onSummaryGenerated?: (sessionId: string, summary: string) => void;
}

export function ConversationItem({
  conversation,
  isSelected,
  onClick,
  onSummaryGenerated,
}: ConversationItemProps) {
  const [summarizing, setSummarizing] = useState(false);
  const title = conversation.summary || conversation.firstPrompt;

  const handleSummarize = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setSummarizing(true);
    try {
      const result = await window.api.generateSummary(
        conversation.fullPath,
        conversation.sessionId,
        conversation.projectPath
      );
      if (result.success && result.summary) {
        onSummaryGenerated?.(conversation.sessionId, result.summary);
        toast.success("Summary generated", { description: result.summary });
      } else {
        toast.error("Failed to summarize", { description: result.error });
      }
    } catch (err) {
      toast.error("Failed to summarize");
    } finally {
      setSummarizing(false);
    }
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "group w-full text-left px-3 py-2.5 rounded-lg transition-colors relative",
        isSelected
          ? "bg-accent text-accent-foreground"
          : "hover:bg-accent/50 text-foreground"
      )}
    >
      {/* Summarize button - appears on hover */}
      <span
        role="button"
        tabIndex={-1}
        onClick={handleSummarize}
        className={cn(
          "absolute top-2 right-2 p-1 rounded-md transition-opacity",
          "hover:bg-accent/80",
          summarizing ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}
        title="Generate AI summary"
      >
        {summarizing ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
        ) : (
          <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </span>

      {/* Title - wraps up to 3 lines */}
      <p className="text-sm font-medium line-clamp-3 pr-6">{title}</p>

      {/* Project short name */}
      <p className="text-xs text-muted-foreground truncate mt-0.5 mb-1.5">
        {conversation.projectName}
      </p>

      {/* Metadata row */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
        <span className="shrink-0">
          {formatRelativeDate(conversation.modified)}
        </span>
        {conversation.gitBranch && (
          <Badge
            variant="secondary"
            className="text-[10px] px-1 py-0 gap-0.5 shrink-0"
          >
            <GitBranch className="h-2.5 w-2.5" />
            {conversation.gitBranch}
          </Badge>
        )}
        <div className="flex items-center gap-0.5 ml-auto shrink-0">
          <MessageSquare className="h-3 w-3" />
          <span>{conversation.messageCount}</span>
        </div>
      </div>
    </button>
  );
}
