"use client";

import { AuditTable } from "@/components/audit/audit-table";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/admin/page-header";
import { useLanguage } from "@/components/language-provider";

export default function AuditPage() {
  const { dictionary } = useLanguage();

  return (
    <div className="space-y-6">
      <PageHeader title={dictionary.pages.auditTitle} description={dictionary.pages.auditDescription} />
      <Suspense fallback={<Skeleton className="w-full h-[600px]" />}>
        <AuditTable />
      </Suspense>
    </div>
  );
}
