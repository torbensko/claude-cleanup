import { contextBridge, ipcRenderer } from "electron";

const IPC_CHANNELS = {
  PROJECTS_LIST: "projects:list",
  CONVERSATIONS_LIST: "conversations:list",
  MESSAGES_LIST: "messages:list",
  MESSAGES_DELETE_FROM: "messages:deleteFrom",
  SUMMARY_GENERATE: "summary:generate",
  SETTINGS_GET_API_KEY: "settings:getApiKey",
  SETTINGS_SET_API_KEY: "settings:setApiKey",
} as const;

contextBridge.exposeInMainWorld("api", {
  listProjects: () =>
    ipcRenderer.invoke(IPC_CHANNELS.PROJECTS_LIST),

  listConversations: (projectDir?: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.CONVERSATIONS_LIST, projectDir),

  listMessages: (filePath: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.MESSAGES_LIST, filePath),

  deleteMessagesFrom: (filePath: string, uuid: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.MESSAGES_DELETE_FROM, filePath, uuid),

  generateSummary: (filePath: string, sessionId: string, projectDir: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.SUMMARY_GENERATE, filePath, sessionId, projectDir),

  getApiKey: () =>
    ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_GET_API_KEY),

  setApiKey: (key: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_SET_API_KEY, key),
});
