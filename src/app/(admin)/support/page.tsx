"use client";

import { PageHeader } from "@/components/admin/page-header";
import { SupportCasesTable } from "@/components/support/support-cases-table";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";
import { useLanguage } from "@/components/language-provider";

export default function SupportPage() {
  const { dictionary } = useLanguage();

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title={dictionary.pages.supportTitle}
        description={dictionary.pages.supportDescription}
      />
      <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
        <SupportCasesTable />
      </Suspense>
    </div>
  );
}
