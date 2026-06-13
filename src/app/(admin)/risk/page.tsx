"use client";

import { PageHeader } from "@/components/admin/page-header";
import { RiskTable } from "@/components/risk/risk-table";
import { Suspense } from "react";
import { useLanguage } from "@/components/language-provider";

export default function RiskPage() {
  const { dictionary } = useLanguage();

  return (
    <div className="space-y-6">
      <PageHeader
        title={dictionary.pages.riskTitle}
        description={dictionary.pages.riskDescription}
      />
      <Suspense fallback={<div className="rounded-md border bg-card p-6 text-sm text-muted-foreground">{dictionary.pages.riskLoading}</div>}>
        <RiskTable />
      </Suspense>
    </div>
  );
}
