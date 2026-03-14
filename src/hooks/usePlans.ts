import { useState, useEffect } from "react";
import type { PlanEntry, PlanDetail } from "@/types/conversations";

export function usePlans() {
  const [plans, setPlans] = useState<PlanEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    window.api.listPlans().then((data) => {
      setPlans(data);
      setLoading(false);
    });
  }, []);

  return { plans, loading };
}

export function usePlanDetail(fullPath: string | null) {
  const [plan, setPlan] = useState<PlanDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!fullPath) {
      setPlan(null);
      return;
    }
    setLoading(true);
    window.api.readPlan(fullPath).then((data) => {
      setPlan(data);
      setLoading(false);
    });
  }, [fullPath]);

  return { plan, loading };
}
