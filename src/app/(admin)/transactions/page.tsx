"use client";

import { TransactionsTable } from "@/components/transactions/transactions-table";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/admin/page-header";
import { useLanguage } from "@/components/language-provider";

export default function TransactionsPage() {
  const { dictionary } = useLanguage();

  return (
    <div className="space-y-6">
      <PageHeader title={dictionary.pages.transactionsTitle} description={dictionary.pages.transactionsDescription} />
      
      <Suspense fallback={<Skeleton className="w-full h-[400px]" />}>
        <TransactionsTable />
      </Suspense>
    </div>
  );
}
