import { createContext, useContext, useState, type ReactNode } from "react";
import type { ConversationEntry, PlanEntry } from "@/types/conversations";

const STORAGE_KEY = "claude-cleanup-selected-project";

export type ViewMode = "conversations" | "plans";

interface AppState {
  viewMode: ViewMode;
  selectedProject: string | null; // null = "All Projects"
  selectedConversation: ConversationEntry | null;
  selectedPlan: PlanEntry | null;
  searchQuery: string;
  setViewMode: (mode: ViewMode) => void;
  setSelectedProject: (project: string | null) => void;
  setSelectedConversation: (conversation: ConversationEntry | null) => void;
  setSelectedPlan: (plan: PlanEntry | null) => void;
  setSearchQuery: (query: string) => void;
}

const AppStateContext = createContext<AppState | null>(null);

function loadSavedProject(): string | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [viewMode, setViewMode] = useState<ViewMode>("conversations");
  const [selectedProject, setSelectedProject] = useState<string | null>(loadSavedProject);
  const [selectedConversation, setSelectedConversation] =
    useState<ConversationEntry | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PlanEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSetProject = (project: string | null) => {
    setSelectedProject(project);
    setSelectedConversation(null);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
    } catch {
      // ignore
    }
  };

  const handleSetViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    setSearchQuery("");
  };

  return (
    <AppStateContext.Provider
      value={{
        viewMode,
        selectedProject,
        selectedConversation,
        selectedPlan,
        searchQuery,
        setViewMode: handleSetViewMode,
        setSelectedProject: handleSetProject,
        setSelectedConversation,
        setSelectedPlan,
        setSearchQuery,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppState must be used within AppStateProvider");
  }
  return context;
}
