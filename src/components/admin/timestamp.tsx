import { formatDate, formatRelativeDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";

type TimestampProps = {
  value: string | null | undefined;
  className?: string;
};

export function Timestamp({ value, className }: TimestampProps) {
  const absolute = formatDate(value);
  const relative = formatRelativeDate(value);

  return (
    <time
      dateTime={value ?? undefined}
      title={absolute}
      className={cn("whitespace-nowrap text-sm text-muted-foreground", className)}
    >
      {relative}
    </time>
  );
}
