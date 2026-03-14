import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import type { PlanEntry, PlanDetail } from "../types/conversations";

const PLANS_DIR = path.join(os.homedir(), ".claude", "plans");

export function listPlans(): PlanEntry[] {
  if (!fs.existsSync(PLANS_DIR)) return [];

  const files = fs.readdirSync(PLANS_DIR).filter((f) => f.endsWith(".md"));
  const plans: PlanEntry[] = [];

  for (const file of files) {
    const fullPath = path.join(PLANS_DIR, file);
    try {
      const stat = fs.statSync(fullPath);
      const content = fs.readFileSync(fullPath, "utf-8");
      const title = extractTitle(content, file);

      plans.push({
        fileName: file,
        fullPath,
        title,
        modified: stat.mtime.toISOString(),
        sizeBytes: stat.size,
      });
    } catch {
      // skip unreadable files
    }
  }

  plans.sort((a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime());
  return plans;
}

export function readPlan(fullPath: string): PlanDetail | null {
  try {
    const stat = fs.statSync(fullPath);
    const content = fs.readFileSync(fullPath, "utf-8");
    const title = extractTitle(content, path.basename(fullPath));

    return {
      fileName: path.basename(fullPath),
      title,
      content,
      modified: stat.mtime.toISOString(),
    };
  } catch {
    return null;
  }
}

function extractTitle(content: string, fallbackName: string): string {
  const match = content.match(/^#\s+(.+)$/m);
  if (match) return match[1].trim();

  // Use filename without extension as fallback
  return fallbackName.replace(/\.md$/, "").replace(/[-_]/g, " ");
}
