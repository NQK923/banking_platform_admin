"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { useLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/formatters";

type PaginationControlsProps = {
  page: number;
  totalPages?: number;
  totalElements?: number;
  isLoading?: boolean;
  onPrevious: () => void;
  onNext: () => void;
};

export function PaginationControls({
  page,
  totalPages = 1,
  totalElements = 0,
  isLoading,
  onPrevious,
  onNext,
}: PaginationControlsProps) {
  const { dictionary: t } = useLanguage();
  const summary = t.pagination.showing
    .replace("{page}", String(page))
    .replace("{totalPages}", String(totalPages || 1))
    .replace("{totalElements}", formatNumber(totalElements || 0));

  return (
    <div className="flex min-w-0 flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <div className="truncate">{summary}</div>
      <div className="flex shrink-0 items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevious}
          disabled={page === 1 || isLoading}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          {t.pagination.previous}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={page >= (totalPages || 1) || isLoading}
        >
          {t.pagination.next}
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
