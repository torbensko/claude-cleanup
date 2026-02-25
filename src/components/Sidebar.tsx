import { ProjectSelector } from "./ProjectSelector";
import { ConversationList } from "./ConversationList";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search, Settings, Eye, EyeOff } from "lucide-react";
import { useAppState } from "@/contexts/AppStateContext";
import { useState, useEffect } from "react";

export function Sidebar() {
  const { searchQuery, setSearchQuery } = useAppState();
  const [apiKeyDisplay, setApiKeyDisplay] = useState<string | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    window.api.getApiKey().then(setApiKeyDisplay);
  }, []);

  const handleSaveKey = async () => {
    if (!apiKeyInput.trim()) return;
    setSaving(true);
    await window.api.setApiKey(apiKeyInput.trim());
    const display = await window.api.getApiKey();
    setApiKeyDisplay(display);
    setApiKeyInput("");
    setSaving(false);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* App title + project selector */}
      <div className="px-3 pt-3 pb-1 shrink-0 space-y-1">
        <div className="flex items-center justify-between px-1">
          <h1 className="text-sm font-semibold text-foreground">
            Claude Cleanup
          </h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Settings className="h-3.5 w-3.5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Settings</DialogTitle>
                <DialogDescription>
                  Configure your Anthropic API key for AI-powered conversation summaries.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Anthropic API Key</label>
                  {apiKeyDisplay && !apiKeyInput && (
                    <p className="text-xs text-muted-foreground font-mono">{apiKeyDisplay}</p>
                  )}
                  <div className="relative">
                    <Input
                      type={showKey ? "text" : "password"}
                      placeholder="sk-ant-..."
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      className="pr-9"
                      onKeyDown={(e) => e.key === "Enter" && handleSaveKey()}
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                    >
                      {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Also auto-detected from <code className="bg-muted px-1 rounded text-[11px]">ANTHROPIC_API_KEY</code> environment variable.
                  </p>
                </div>
                <div className="flex justify-end pt-2 border-t border-border">
                  <Button
                    onClick={handleSaveKey}
                    disabled={!apiKeyInput.trim() || saving}
                  >
                    {saving ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <ProjectSelector />
      </div>

      <Separator className="my-1" />

      {/* Search */}
      <div className="px-3 py-2 shrink-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ConversationList />
      </div>
    </div>
  );
}
