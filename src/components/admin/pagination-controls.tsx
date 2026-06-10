import { ChevronLeft, ChevronRight } from "lucide-react";

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
  return (
    <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <div>
        Showing page {page} of {totalPages || 1} (Total: {formatNumber(totalElements || 0)})
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevious}
          disabled={page === 1 || isLoading}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={page >= (totalPages || 1) || isLoading}
        >
          Next
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
