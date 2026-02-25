import { useState, useEffect, useCallback } from "react";
import type { ConversationEntry } from "@/types/conversations";

export function useConversations(projectDirName: string | null) {
  const [conversations, setConversations] = useState<ConversationEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    window.api
      .listConversations(projectDirName ?? undefined)
      .then((data) => {
        setConversations(data);
        setLoading(false);
      });
  }, [projectDirName]);

  const updateSummary = useCallback((sessionId: string, summary: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.sessionId === sessionId ? { ...c, summary } : c))
    );
  }, []);

  return { conversations, loading, updateSummary };
}
