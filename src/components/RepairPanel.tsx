import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  FileSearch,
  Hash,
} from "lucide-react";
import { toast } from "sonner";

export function RepairPanel() {
  const [missingCount, setMissingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [repairing, setRepairing] = useState(false);
  const [lastResult, setLastResult] = useState<{
    repairedProjects: number;
    addedEntries: number;
  } | null>(null);

  useEffect(() => {
    window.api
      .checkIndexHealth()
      .then((r) => setMissingCount(r.missingCount))
      .finally(() => setLoading(false));
  }, []);

  const handleRepair = async () => {
    setRepairing(true);
    try {
      const result = await window.api.repairIndexes();
      setLastResult(result);
      setMissingCount(0);
      toast.success(`Repaired ${result.repairedProjects} project(s)`, {
        description: `Fixed ${result.addedEntries} conversation(s)`,
      });
    } catch {
      toast.error("Failed to repair indexes");
    } finally {
      setRepairing(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-8 py-10 space-y-8">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            VS Code Index Repair
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Fix out-of-sync conversation indexes used by the Claude Code VS Code
            extension.
          </p>
        </div>

        {/* Status */}
        <div className="rounded-lg border border-border p-4">
          {loading ? (
            <p className="text-sm text-muted-foreground">
              Checking index health...
            </p>
          ) : lastResult ? (
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Repair complete
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Fixed {lastResult.addedEntries} conversation(s) across{" "}
                  {lastResult.repairedProjects} project(s).
                </p>
              </div>
            </div>
          ) : missingCount > 0 ? (
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {missingCount} conversation{missingCount !== 1 ? "s" : ""}{" "}
                  need repair
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  These conversations exist on disk but are missing from or
                  incorrect in the VS Code index.
                </p>
                <Button
                  onClick={handleRepair}
                  disabled={repairing}
                  size="sm"
                  className="mt-3"
                >
                  {repairing ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                      Repairing...
                    </>
                  ) : (
                    "Repair now"
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  All indexes are healthy
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  No issues detected.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Explanation */}
        <div className="space-y-6">
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-2">
              What is the VS Code index?
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Claude Code stores each conversation as a JSONL file in{" "}
              <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                ~/.claude/projects/
              </code>
              . The VS Code extension maintains a separate index file (
              <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                sessions-index.json
              </code>
              ) per project that tracks which conversations exist and their
              metadata. This index is what lets the extension quickly list your
              conversations without scanning every file.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-foreground mb-3">
              What can go wrong?
            </h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3 rounded-lg border border-border p-3">
                <FileSearch className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Missing entries
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    Conversation files exist on disk but aren't listed in the
                    index. This happens when conversations are created by the CLI
                    but the VS Code extension hasn't picked them up, or if the
                    index was reset.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-border p-3">
                <Hash className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Stale message counts
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    The index records how many messages each conversation has,
                    but this count can drift if messages are added or removed
                    outside the extension. This causes the conversation list to
                    show incorrect counts.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-foreground mb-2">
              What does repair do?
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Repair scans all project directories, finds conversation files
              missing from the index, and adds them with the correct metadata
              (first prompt, message count, timestamps). It also recounts
              messages in existing entries and corrects any stale counts. The
              original conversation files are never modified — only the index is
              updated.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
