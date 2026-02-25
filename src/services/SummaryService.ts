import * as fs from "fs";
import * as path from "path";
import Anthropic from "@anthropic-ai/sdk";

function stripXmlTags(text: string): string {
  return text.replace(/<[^>]+>/g, "").trim();
}

const IDE_NOISE_PATTERNS = [
  /^The user opened the file .+$/,
  /^This may or may not be related to the current task\.?$/,
  /^The user is currently viewing/,
  /^The user's cursor is/,
  /^The user has the following file/,
  /^The user selected the lines/,
];

function isIdeNoise(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return true;
  return IDE_NOISE_PATTERNS.some((p) => p.test(trimmed));
}

function extractUserMessages(filePath: string, maxMessages = 5): string[] {
  if (!fs.existsSync(filePath)) return [];

  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const messages: string[] = [];

  for (const line of lines) {
    if (messages.length >= maxMessages) break;
    if (!line.trim()) continue;

    try {
      const parsed = JSON.parse(line);
      if (parsed.type !== "user" || parsed.isMeta || parsed.isSidechain) continue;

      const c = parsed.message?.content;
      if (!c) continue;

      if (typeof c === "string") {
        const cleaned = stripXmlTags(c);
        if (cleaned && !isIdeNoise(cleaned)) {
          messages.push(cleaned.slice(0, 500));
        }
      } else if (Array.isArray(c)) {
        for (const block of c) {
          if (block.type !== "text" || !block.text) continue;
          const cleaned = stripXmlTags(block.text);
          const lines = cleaned.split(/\n+/).filter((l: string) => !isIdeNoise(l));
          const text = lines.join(" ").trim();
          if (text) {
            messages.push(text.slice(0, 500));
            break;
          }
        }
      }
    } catch {
      // skip
    }
  }

  return messages;
}

export async function generateSummary(
  apiKey: string,
  filePath: string,
  sessionId: string,
  projectDir: string
): Promise<{ success: boolean; summary?: string; error?: string }> {
  const userMessages = extractUserMessages(filePath);

  if (userMessages.length === 0) {
    return { success: false, error: "No user messages found" };
  }

  const prompt = userMessages
    .map((m, i) => `Message ${i + 1}: ${m}`)
    .join("\n\n");

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 30,
      system:
        "Summarize this conversation in 5-10 words. Be specific about what was discussed. Return only the summary, nothing else.",
      messages: [{ role: "user", content: prompt }],
    });

    const summary =
      response.content[0]?.type === "text"
        ? response.content[0].text.trim()
        : "";

    if (!summary) {
      return { success: false, error: "Empty response from API" };
    }

    // Write summary back to sessions-index.json
    writeSummaryToIndex(projectDir, sessionId, summary, filePath);

    return { success: true, summary };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}

function writeSummaryToIndex(
  projectDir: string,
  sessionId: string,
  summary: string,
  filePath: string
): void {
  const indexPath = path.join(projectDir, "sessions-index.json");

  let indexData: Record<string, unknown> = { version: 1, entries: [] };

  if (fs.existsSync(indexPath)) {
    try {
      indexData = JSON.parse(fs.readFileSync(indexPath, "utf-8"));
    } catch {
      // If corrupt, start fresh but preserve what we can
    }
  }

  const entries = (indexData.entries || []) as Array<Record<string, unknown>>;
  const existing = entries.find((e) => e.sessionId === sessionId);

  if (existing) {
    existing.customTitle = summary;
  } else {
    // Add a minimal entry for sessions missing from the index
    const stat = fs.existsSync(filePath) ? fs.statSync(filePath) : null;
    entries.push({
      sessionId,
      fullPath: filePath,
      customTitle: summary,
      messageCount: 0,
      created: stat?.birthtime.toISOString() || new Date().toISOString(),
      modified: stat?.mtime.toISOString() || new Date().toISOString(),
      isSidechain: false,
    });
  }

  indexData.entries = entries;
  fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2), "utf-8");
}
