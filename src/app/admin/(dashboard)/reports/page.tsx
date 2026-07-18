import { generateReports } from "@/app/actions/generate_report";
import {
  formatSundayKey,
  getNearestSunday,
  parseSundayKey,
} from "@/app/utils/util";
import ReportsView from "@/app/admin/(dashboard)/reports/views/reports_view";

export const dynamic = "force-dynamic";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; end?: string }>;
}) {
  const params = await searchParams;

  const nearestSunday = getNearestSunday(new Date());

  const endSunday = params.end ? parseSundayKey(params.end) : nearestSunday;
  const startSunday = params.start
    ? parseSundayKey(params.start)
    : (() => {
        const s = new Date(endSunday ?? nearestSunday);
        s.setDate(s.getDate() - 7 * 7);
        return s;
      })();

  const endKey = formatSundayKey(endSunday ?? nearestSunday);
  const startKey = formatSundayKey(startSunday ?? nearestSunday);

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