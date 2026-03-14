import { useAppState } from "@/contexts/AppStateContext";
import { usePlanDetail } from "@/hooks/usePlans";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText } from "lucide-react";
import Markdown from "react-markdown";

export function PlanPanel() {
  const { selectedPlan } = useAppState();
  const { plan, loading } = usePlanDetail(selectedPlan?.fullPath ?? null);

  if (!selectedPlan) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Select a plan to view</p>
        </div>
      </div>
    );
  }

  if (loading || !plan) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-2/3" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="p-6 pb-12 max-w-4xl">
          <div className="text-sm prose-sm prose-neutral dark:prose-invert break-words">
            <Markdown
              components={{
                p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                code: ({ children, className }) => {
                  const isBlock = className?.includes("language-");
                  if (isBlock) {
                    return (
                      <pre className="bg-muted/50 rounded p-3 overflow-x-auto my-3">
                        <code className="text-[12px]">{children}</code>
                      </pre>
                    );
                  }
                  return (
                    <code className="bg-muted/50 rounded px-1 py-0.5 text-[12px]">
                      {children}
                    </code>
                  );
                },
                pre: ({ children }) => <>{children}</>,
                ul: ({ children }) => <ul className="list-disc pl-4 mb-3 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-4 mb-3 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="text-sm">{children}</li>,
                h1: ({ children }) => <h1 className="text-lg font-bold mb-2 mt-6 first:mt-0">{children}</h1>,
                h2: ({ children }) => <h2 className="text-base font-bold mb-2 mt-5">{children}</h2>,
                h3: ({ children }) => <h3 className="text-sm font-semibold mb-1.5 mt-4">{children}</h3>,
                h4: ({ children }) => <h4 className="text-sm font-semibold mb-1 mt-3">{children}</h4>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-muted-foreground/30 pl-3 italic text-muted-foreground my-3">
                    {children}
                  </blockquote>
                ),
                a: ({ children, href }) => (
                  <a href={href} className="text-primary underline" target="_blank" rel="noopener noreferrer">
                    {children}
                  </a>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto my-3">
                    <table className="text-xs border-collapse w-full">{children}</table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="border border-border px-2 py-1 text-left font-semibold bg-muted/50">{children}</th>
                ),
                td: ({ children }) => (
                  <td className="border border-border px-2 py-1">{children}</td>
                ),
                hr: () => <hr className="border-border my-4" />,
              }}
            >
              {plan.content}
            </Markdown>
          </div>
        </div>
      </div>
    </div>
  );
}
