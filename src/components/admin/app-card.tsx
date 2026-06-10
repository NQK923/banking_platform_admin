import type { ComponentProps } from "react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function AppCard({ className, ...props }: ComponentProps<typeof Card>) {
  return (
    <Card
      className={cn(
        "rounded-lg border border-border/70 bg-card shadow-sm ring-0 transition-colors dark:bg-card/95",
        className
      )}
      {...props}
    />
  );
}
