"use client";

import { DlqTable } from "@/components/dlq/dlq-table";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/admin/page-header";
import { useLanguage } from "@/components/language-provider";

export default function DlqPage() {
  const { dictionary } = useLanguage();

  return (
    <div className="space-y-6">
      <PageHeader title={dictionary.pages.dlqTitle} description={dictionary.pages.dlqDescription} />
      <Suspense fallback={<Skeleton className="w-full h-[400px]" />}>
        <DlqTable />
      </Suspense>
    </div>
  );
}
