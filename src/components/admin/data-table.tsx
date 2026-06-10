import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type DataTableShellProps = {
  children: ReactNode;
  toolbar?: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function DataTableShell({ children, toolbar, footer, className }: DataTableShellProps) {
  return (
    <div className={cn("min-w-0 overflow-hidden rounded-lg border border-border/70 bg-card shadow-sm", className)}>
      {toolbar ? <div className="border-b bg-muted/25 p-3">{toolbar}</div> : null}
      {children}
      {footer ? <div className="border-t bg-muted/25 px-3 py-2">{footer}</div> : null}
    </div>
  );
}
