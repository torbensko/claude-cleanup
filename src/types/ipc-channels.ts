export const IPC_CHANNELS = {
  PROJECTS_LIST: "projects:list",
  CONVERSATIONS_LIST: "conversations:list",
  MESSAGES_LIST: "messages:list",
  MESSAGES_DELETE_FROM: "messages:deleteFrom",
  SUMMARY_GENERATE: "summary:generate",
  SETTINGS_GET_API_KEY: "settings:getApiKey",
  SETTINGS_SET_API_KEY: "settings:setApiKey",
} as const;
