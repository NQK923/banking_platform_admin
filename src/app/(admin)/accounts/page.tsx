import { AccountsTable } from "@/components/accounts/accounts-table";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/admin/page-header";

export default function AccountsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Accounts" description="Manage user accounts and balances." />
      
      <Suspense fallback={<Skeleton className="w-full h-[400px]" />}>
        <AccountsTable />
      </Suspense>
    </div>
  );
}
