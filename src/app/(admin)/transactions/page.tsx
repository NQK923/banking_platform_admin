import { TransactionsTable } from "@/components/transactions/transactions-table";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/admin/page-header";

export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Transactions" description="View all system transactions." />
      
      <Suspense fallback={<Skeleton className="w-full h-[400px]" />}>
        <TransactionsTable />
      </Suspense>
    </div>
  );
}
