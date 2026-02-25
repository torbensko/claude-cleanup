import { ipcMain, safeStorage } from "electron";
import * as fs from "fs";
import * as path from "path";
import { app } from "electron";
import { IPC_CHANNELS } from "../types/ipc-channels";
import { listProjects } from "../services/ProjectService";
import { listConversations } from "../services/ConversationService";
import { listMessages, deleteMessagesFrom } from "../services/MessageService";
import { generateSummary } from "../services/SummaryService";

function getApiKeyPath(): string {
  return path.join(app.getPath("userData"), "api-key");
}

function readStoredApiKey(): string | null {
  // Check env var first
  if (process.env.ANTHROPIC_API_KEY) {
    return process.env.ANTHROPIC_API_KEY;
  }

  const keyPath = getApiKeyPath();
  if (!fs.existsSync(keyPath)) return null;

  try {
    const raw = fs.readFileSync(keyPath);
    if (safeStorage.isEncryptionAvailable()) {
      return safeStorage.decryptString(raw);
    }
    return raw.toString("utf-8");
  } catch {
    return null;
  }
}

function writeStoredApiKey(key: string): void {
  const keyPath = getApiKeyPath();
  if (safeStorage.isEncryptionAvailable()) {
    fs.writeFileSync(keyPath, safeStorage.encryptString(key));
  } else {
    fs.writeFileSync(keyPath, key, "utf-8");
  }
}

export function registerIpc() {
  ipcMain.handle(IPC_CHANNELS.PROJECTS_LIST, () => {
    return listProjects();
  });

  ipcMain.handle(
    IPC_CHANNELS.CONVERSATIONS_LIST,
    (_event, projectDir?: string) => {
      return listConversations(projectDir);
    }
  );

  ipcMain.handle(IPC_CHANNELS.MESSAGES_LIST, (_event, filePath: string) => {
    return listMessages(filePath);
  });

  ipcMain.handle(
    IPC_CHANNELS.MESSAGES_DELETE_FROM,
    (_event, filePath: string, uuid: string) => {
      return deleteMessagesFrom(filePath, uuid);
    }
  );

  ipcMain.handle(
    IPC_CHANNELS.SUMMARY_GENERATE,
    async (_event, filePath: string, sessionId: string, projectDir: string) => {
      const apiKey = readStoredApiKey();
      if (!apiKey) {
        return { success: false, error: "No API key configured" };
      }
      return generateSummary(apiKey, filePath, sessionId, projectDir);
    }
  );

  ipcMain.handle(IPC_CHANNELS.SETTINGS_GET_API_KEY, () => {
    const key = readStoredApiKey();
    // Return masked version for display, or null
    if (!key) return null;
    return key.slice(0, 7) + "..." + key.slice(-4);
  });

  ipcMain.handle(
    IPC_CHANNELS.SETTINGS_SET_API_KEY,
    (_event, key: string) => {
      writeStoredApiKey(key);
    }
  );
}
