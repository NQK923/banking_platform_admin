import { PageHeader } from "@/components/admin/page-header";
import { RiskTable } from "@/components/risk/risk-table";
import { Suspense } from "react";

export default function RiskPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Risk reviews"
        description="Review deterministic fraud and scam risk evaluations before money is debited."
      />
      <Suspense fallback={<div className="rounded-md border bg-card p-6 text-sm text-muted-foreground">Loading risk reviews...</div>}>
        <RiskTable />
      </Suspense>
    </div>
  );
}
