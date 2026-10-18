import { generateReports } from "@/app/actions/generate_report";
import { getReportRange } from "@/app/utils/report-utils";
import ReportsView from "@/app/admin/(dashboard)/reports/views/reports_view";

export const dynamic = "force-dynamic";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; end?: string }>;
}) {
  const params = await searchParams;

  const { startKey, endKey } = getReportRange(params);

  const result = await generateReports(startKey, endKey);

  return (
    <div className="w-full px-8">
      <ReportsView
        startKey={startKey}
        endKey={endKey}
        reports={result.success ? result.data ?? [] : []}
        errorMessage={result.success ? undefined : result.message}
      />
    </div>
  );
}
