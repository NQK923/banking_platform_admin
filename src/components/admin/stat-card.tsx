import type { ComponentType } from "react";

import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AppCard } from "@/components/admin/app-card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
  delta?: string;
  isLoading?: boolean;
};

const toneClasses = {
  neutral: "text-muted-foreground bg-muted/60",
  success: "text-emerald-700 bg-emerald-500/12 dark:text-emerald-300",
  warning: "text-amber-800 bg-amber-500/14 dark:text-amber-300",
  danger: "text-red-700 bg-red-500/12 dark:text-red-300",
  info: "text-sky-700 bg-sky-500/12 dark:text-sky-300",
};

export function StatCard({ label, value, icon: Icon, tone = "neutral", delta, isLoading }: StatCardProps) {
  return (
    <AppCard className="min-h-32">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-1">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <span className={cn("flex h-8 w-8 items-center justify-center rounded-md", toneClasses[tone])}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <div className="numbers break-words text-2xl font-semibold tracking-tight sm:text-3xl">{value}</div>
        )}
        {delta ? <p className="mt-1 text-xs text-muted-foreground">{delta}</p> : null}
      </CardContent>
    </AppCard>
  );
}
