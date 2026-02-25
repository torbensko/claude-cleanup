import type { ProjectInfo, ConversationEntry, Message, DeleteResult } from "./conversations";

export interface ElectronAPI {
  listProjects: () => Promise<ProjectInfo[]>;
  listConversations: (projectDir?: string) => Promise<ConversationEntry[]>;
  listMessages: (filePath: string) => Promise<Message[]>;
  deleteMessagesFrom: (filePath: string, uuid: string) => Promise<DeleteResult>;
  generateSummary: (filePath: string, sessionId: string, projectDir: string) => Promise<{ success: boolean; summary?: string; error?: string }>;
  getApiKey: () => Promise<string | null>;
  setApiKey: (key: string) => Promise<void>;
}

declare global {
  interface Window {
    api: ElectronAPI;
  }
}
