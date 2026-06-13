"use client";

import { AccountsTable } from "@/components/accounts/accounts-table";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/admin/page-header";
import { useLanguage } from "@/components/language-provider";

export default function AccountsPage() {
  const { dictionary } = useLanguage();

  return (
    <div className="space-y-6">
      <PageHeader title={dictionary.pages.accountsTitle} description={dictionary.pages.accountsDescription} />
      
      <Suspense fallback={<Skeleton className="w-full h-[400px]" />}>
        <AccountsTable />
      </Suspense>
    </div>
  );
}
