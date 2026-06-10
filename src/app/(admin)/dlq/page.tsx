import { DlqTable } from "@/components/dlq/dlq-table";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/admin/page-header";

export default function DlqPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Dead-Letter Queue" description="Inspect failed events and replay only after remediation." />
      <Suspense fallback={<Skeleton className="w-full h-[400px]" />}>
        <DlqTable />
      </Suspense>
    </div>
  );
}
