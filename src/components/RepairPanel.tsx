import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  FileSearch,
  FolderOpen,
} from "lucide-react";
import { toast } from "sonner";
import type { IndexHealthResult, ProjectHealth } from "@/types/conversations";

export function RepairPanel() {
  const [health, setHealth] = useState<IndexHealthResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [repairing, setRepairing] = useState(false);
  const [repaired, setRepaired] = useState(false);

  useEffect(() => {
    window.api
      .checkIndexHealth()
      .then(setHealth)
      .finally(() => setLoading(false));
  }, []);

  const handleRepair = async () => {
    setRepairing(true);
    try {
      const result = await window.api.repairIndexes();
      setRepaired(true);
      setHealth({ missingCount: 0, projects: [] });
      toast.success(`Repaired ${result.repairedProjects} project(s)`, {
        description: `Fixed ${result.addedEntries} conversation(s)`,
      });
    } catch {
      toast.error("Failed to repair indexes");
    } finally {
      setRepairing(false);
    }
  };

  const totalIssues = health?.missingCount ?? 0;

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

        {/* Status + action */}
        <div className="rounded-lg border border-border p-4">
          {loading ? (
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Checking index health...
              </p>
            </div>
          ) : repaired || totalIssues === 0 ? (
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {repaired ? "Repair complete" : "All indexes are healthy"}
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {repaired
                    ? "All issues have been fixed."
                    : "No issues detected."}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {totalIssues} issue{totalIssues !== 1 ? "s" : ""} found across{" "}
                  {health!.projects.length} project
                  {health!.projects.length !== 1 ? "s" : ""}
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Review the breakdown below, then repair.
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
                    `Repair ${totalIssues} issue${totalIssues !== 1 ? "s" : ""}`
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Breakdown by project */}
        {!loading && !repaired && health && health.projects.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-foreground">
              Issues by project
            </h2>
            {health.projects.map((project) => (
              <ProjectIssues key={project.dirName} project={project} />
            ))}
          </div>
        )}

        {/* Explanation */}
        <div className="space-y-6 border-t border-border pt-8">
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
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-foreground mb-2">
              What does repair do?
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Repair scans all project directories, finds conversation files
              missing from the index, and adds them with the correct metadata
              (first prompt, message count, timestamps). The original
              conversation files are never modified — only the index is updated.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectIssues({ project }: { project: ProjectHealth }) {
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 border-b border-border">
        <FolderOpen className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <span className="text-sm font-medium text-foreground truncate">
          {project.projectName}
        </span>
        <span className="ml-auto text-xs text-muted-foreground shrink-0">
          {project.issues.length} missing
        </span>
      </div>
      <div className="divide-y divide-border">
        {project.issues.map((issue) => (
          <div
            key={issue.sessionId}
            className="flex items-start gap-2.5 px-3 py-2"
          >
            <FileSearch className="h-3.5 w-3.5 text-yellow-500 mt-0.5 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-foreground truncate">
                {issue.firstPrompt}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {issue.detail}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
