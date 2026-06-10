import type { ComponentType } from "react";
import { AlertCircle, Inbox } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

type TableSkeletonRowsProps = {
  rows?: number;
  columns: number;
  actionColumn?: boolean;
};

export function TableSkeletonRows({ rows = 5, columns, actionColumn }: TableSkeletonRowsProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <TableRow key={rowIndex}>
          {Array.from({ length: columns }).map((_, columnIndex) => (
            <TableCell key={columnIndex}>
              <Skeleton
                className={cn(
                  "h-4",
                  columnIndex === columns - 1 && actionColumn ? "ml-auto h-8 w-24" : columnIndex === columns - 1 ? "ml-auto w-24" : "w-32",
                  columnIndex === 0 ? "w-40" : null
                )}
              />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

type EmptyTableRowProps = {
  colSpan: number;
  title: string;
  description?: string;
  icon?: ComponentType<{ className?: string }>;
};

export function EmptyTableRow({ colSpan, title, description, icon: Icon = Inbox }: EmptyTableRowProps) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="py-12">
        <div className="mx-auto flex max-w-sm flex-col items-center gap-2 text-center text-muted-foreground">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border bg-muted/40">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
          <p className="font-medium text-foreground">{title}</p>
          {description ? <p className="text-sm">{description}</p> : null}
        </div>
      </TableCell>
    </TableRow>
  );
}

type ErrorTableRowProps = {
  colSpan: number;
  title: string;
  onRetry: () => void;
};

export function ErrorTableRow({ colSpan, title, onRetry }: ErrorTableRowProps) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="py-12">
        <div className="mx-auto flex max-w-sm flex-col items-center gap-3 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-destructive/30 bg-destructive/10 text-destructive">
            <AlertCircle className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <p className="font-medium text-foreground">{title}</p>
            <p className="text-sm text-muted-foreground">The request failed. Try again when the service is reachable.</p>
          </div>
          <Button variant="outline" size="sm" onClick={onRetry}>
            Retry
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
