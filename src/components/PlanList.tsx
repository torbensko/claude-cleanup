import { usePlans } from "@/hooks/usePlans";
import { useAppState } from "@/contexts/AppStateContext";
import { PlanItem } from "./PlanItem";
import { Skeleton } from "@/components/ui/skeleton";

export function PlanList() {
  const { searchQuery, selectedPlan, setSelectedPlan } = useAppState();
  const { plans, loading } = usePlans();

  const filtered = searchQuery
    ? plans.filter((p) => p.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : plans;

  if (loading) {
    return (
      <div className="space-y-2 p-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-sm text-muted-foreground">
        No plans found
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="space-y-1 p-2">
          {filtered.map((plan) => (
            <PlanItem
              key={plan.fileName}
              plan={plan}
              isSelected={selectedPlan?.fileName === plan.fileName}
              onClick={() => setSelectedPlan(plan)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
