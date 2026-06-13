import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  PauseCircle,
  RefreshCcw,
  ShieldAlert,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  status: string;
  className?: string;
};

const styles: Record<string, string> = {
  ACTIVE: "border-emerald-600/25 bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
  COMPLETED: "border-emerald-600/25 bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
  SUCCESS: "border-emerald-600/25 bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
  BALANCED: "border-emerald-600/25 bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
  SUSPENDED: "border-amber-600/25 bg-amber-500/14 text-amber-800 dark:text-amber-300",
  PENDING: "border-sky-600/25 bg-sky-500/12 text-sky-700 dark:text-sky-300",
  PROCESSING: "border-blue-600/25 bg-blue-500/12 text-blue-700 dark:text-blue-300",
  COMPENSATING: "border-violet-600/25 bg-violet-500/12 text-violet-700 dark:text-violet-300",
  REFUNDED: "border-emerald-600/25 bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
  FAILED: "border-red-600/25 bg-red-500/12 text-red-700 dark:text-red-300",
  CANCELLED: "border-zinc-500/25 bg-zinc-500/12 text-zinc-700 dark:text-zinc-300",
  CLOSED: "border-zinc-500/25 bg-zinc-500/12 text-zinc-700 dark:text-zinc-300",
  DRIFT: "border-red-600/25 bg-red-500/12 text-red-700 dark:text-red-300",
  DRIFT_DETECTED: "border-red-600/25 bg-red-500/12 text-red-700 dark:text-red-300",
  CREDIT: "border-emerald-600/25 bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
  DEBIT: "border-sky-600/25 bg-sky-500/12 text-sky-700 dark:text-sky-300",
  LOW: "border-emerald-600/25 bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
  MEDIUM: "border-amber-600/25 bg-amber-500/14 text-amber-800 dark:text-amber-300",
  HIGH: "border-orange-600/25 bg-orange-500/14 text-orange-800 dark:text-orange-300",
  CRITICAL: "border-red-600/25 bg-red-500/12 text-red-700 dark:text-red-300",
  ALLOW: "border-emerald-600/25 bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
  WARN_USER: "border-amber-600/25 bg-amber-500/14 text-amber-800 dark:text-amber-300",
  STEP_UP_AUTH: "border-orange-600/25 bg-orange-500/14 text-orange-800 dark:text-orange-300",
  MANUAL_REVIEW: "border-red-600/25 bg-red-500/12 text-red-700 dark:text-red-300",
  MANUAL_REVIEW_REQUIRED: "border-red-600/25 bg-red-500/12 text-red-700 dark:text-red-300",
  MANUAL_APPROVED: "border-emerald-600/25 bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
  MANUAL_REJECTED: "border-zinc-500/25 bg-zinc-500/12 text-zinc-700 dark:text-zinc-300",
  BLOCK: "border-red-600/25 bg-red-500/12 text-red-700 dark:text-red-300",
  BLOCKED: "border-red-600/25 bg-red-500/12 text-red-700 dark:text-red-300",
};

const icons: Record<string, typeof CheckCircle2> = {
  ACTIVE: CheckCircle2,
  COMPLETED: CheckCircle2,
  SUCCESS: CheckCircle2,
  BALANCED: CheckCircle2,
  SUSPENDED: ShieldAlert,
  PENDING: Clock3,
  PROCESSING: RefreshCcw,
  COMPENSATING: RefreshCcw,
  REFUNDED: RefreshCcw,
  FAILED: AlertCircle,
  CANCELLED: XCircle,
  CLOSED: PauseCircle,
  DRIFT: AlertCircle,
  DRIFT_DETECTED: AlertCircle,
  CREDIT: CheckCircle2,
  DEBIT: RefreshCcw,
  LOW: CheckCircle2,
  MEDIUM: ShieldAlert,
  HIGH: ShieldAlert,
  CRITICAL: AlertCircle,
  ALLOW: CheckCircle2,
  WARN_USER: ShieldAlert,
  STEP_UP_AUTH: ShieldAlert,
  MANUAL_REVIEW: ShieldAlert,
  MANUAL_REVIEW_REQUIRED: ShieldAlert,
  MANUAL_APPROVED: CheckCircle2,
  MANUAL_REJECTED: XCircle,
  BLOCK: AlertCircle,
  BLOCKED: AlertCircle,
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalized = status.toUpperCase();
  const Icon = icons[normalized] ?? Clock3;

  return (
    <Badge
      variant="outline"
      className={cn("h-6 rounded-md border px-2 font-medium tracking-normal", styles[normalized], className)}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      {status}
    </Badge>
  );
}
