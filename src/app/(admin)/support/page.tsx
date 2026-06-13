import { PageHeader } from "@/components/admin/page-header";
import { SupportCasesTable } from "@/components/support/support-cases-table";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";

export default function SupportPage() {
  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Support Cases"
        description="Review human handoffs from the read-only customer support assistant."
      />
      <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
        <SupportCasesTable />
      </Suspense>
    </div>
  );
}
