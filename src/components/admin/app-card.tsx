import type { ComponentProps } from "react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function AppCard({ className, ...props }: ComponentProps<typeof Card>) {
  return (
    <Card
      className={cn(
        "rounded-xl border border-border/60 bg-card/75 backdrop-blur-md shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 ease-in-out dark:bg-card/40 dark:border-border/30 dark:shadow-[0_4px_30px_rgba(0,0,0,0.2)] hover:dark:shadow-[0_8px_45px_rgba(0,0,0,0.35)] hover:-translate-y-0.5",
        className
      )}
      {...props}
    />
  );
}
