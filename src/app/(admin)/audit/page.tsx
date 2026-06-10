import { AuditTable } from "@/components/audit/audit-table";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/admin/page-header";

export default function AuditPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Audit Logs" description="Review audited admin and system activity." />
      <Suspense fallback={<Skeleton className="w-full h-[600px]" />}>
        <AuditTable />
      </Suspense>
    </div>
  );
}
