import type { ReactNode } from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ToolbarProps = {
  searchValue?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  children?: ReactNode;
  className?: string;
};

export function Toolbar({
  searchValue,
  searchPlaceholder = "Search...",
  onSearchChange,
  children,
  className,
}: ToolbarProps) {
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", className)}>
      {onSearchChange ? (
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            aria-label={searchPlaceholder}
            placeholder={searchPlaceholder}
            className="h-9 pl-8"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>
      ) : (
        <div />
      )}
      {children ? <div className="flex flex-wrap items-center gap-2">{children}</div> : null}
    </div>
  );
}
