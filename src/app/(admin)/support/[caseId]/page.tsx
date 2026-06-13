import { SupportCaseDetail } from "@/components/support/support-case-detail";

export default async function SupportCasePage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  return <SupportCaseDetail caseId={caseId} />;
}
