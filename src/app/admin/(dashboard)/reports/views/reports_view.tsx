"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Table from "@/app/ui/components/table";
import type { WeeklyReport } from "@/app/actions/generate_report";
import { formatSundayKey, parseSundayKey, getNearestSunday } from "@/app/utils/util";
import { formatReportSunday, reportsToCsv } from "@/app/utils/report-utils";
import SundayDatePicker from "@/app/ui/components/sunday_date_picker";

function downloadCsv(rows: WeeklyReport[]) {
  const csv = reportsToCsv(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `wcie-transport-report.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

type Kpi = { label: string; value: string };

export default function ReportsView({
  startKey,
  endKey,
  reports,
  errorMessage,
}: {
  startKey: string;
  endKey: string;
  reports: WeeklyReport[];
  errorMessage?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const startDate = parseSundayKey(startKey) ?? getNearestSunday(new Date());
  const endDate = parseSundayKey(endKey) ?? getNearestSunday(new Date());

  const chartData = useMemo(
    () =>
      reports.map((r) => ({
        sunday: formatReportSunday(r.sundayKey),
        requests: r.totalRequests,
        picked: r.picked,
      })),
    [reports],
  );

  const kpis: Kpi[] = useMemo(() => {
    const total = reports.reduce((s, r) => s + r.totalRequests, 0);
    const picked = reports.reduce((s, r) => s + r.picked, 0);
    const cancelled = reports.reduce((s, r) => s + r.cancelled, 0);
    const passengers = reports.reduce(
      (s, r) => s + r.totalPassengersPicked,
      0,
    );
    const rate = total > 0 ? picked / total : 0;
    return [
      { label: "Total Requests", value: String(total) },
      { label: "Successful", value: String(picked) },
      { label: "Success Rate", value: `${(rate * 100).toFixed(1)}%` },
      { label: "Cancelled", value: String(cancelled) },
      { label: "Passengers Picked", value: String(passengers) },
    ];
  }, [reports]);

  function updateRange(newStart: Date, newEnd: Date) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("start", formatSundayKey(newStart));
    params.set("end", formatSundayKey(newEnd));
    router.push(`?${params.toString()}`);
  }

  const tableBody = reports;

  return (
    <div className="my-8 space-y-8 print:my-2">
      <div className="flex flex-row items-center justify-between print:hidden">
        <h2 className="text-2xl font-bold">Weekly Transportation Report</h2>
        <div className="flex flex-row gap-2">
          <button
            className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer"
            onClick={() => downloadCsv(reports)}
          >
            Export CSV
          </button>
          <button
            className="border border-primary text-primary px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer"
            onClick={() => window.print()}
          >
            Print
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 print:hidden">
        <div className="flex flex-col gap-1">
          <label htmlFor="report-start-sunday" className="text-xs">Start Service Sunday</label>
          <SundayDatePicker
            id="report-start-sunday"
            date={startDate}
            timeZone="America/Edmonton"
            includeLabel={false}
            onDateSelected={(d) => updateRange(d, endDate)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="report-end-sunday" className="text-xs">End Service Sunday</label>
          <SundayDatePicker
            id="report-end-sunday"
            date={endDate}
            timeZone="America/Edmonton"
            includeLabel={false}
            onDateSelected={(d) => updateRange(startDate, d)}
          />
        </div>
      </div>

      <p className="text-sm">
        Reports are grouped by service Sunday. Each Sunday includes requests
        submitted from the previous Sunday through Saturday, in Edmonton time.
        Requests submitted on Sunday belong to the following service Sunday.
      </p>

      {errorMessage && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-4 rounded-lg print:hidden">
          {errorMessage}
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="bg-tertiary rounded-xl p-4 border border-white/5"
          >
            <p className="text-xs uppercase tracking-wider text-gray-400">
              {k.label}
            </p>
            <p className="text-2xl font-bold mt-1">{k.value}</p>
          </div>
        ))}
      </div>

      {/* Trend chart */}
      <div className="bg-tertiary rounded-xl p-4 border border-white/5 print:hidden">
        <h3 className="text-lg font-semibold mb-4">
          Weekly Trend by Service Sunday: Requests vs Picked
        </h3>
        {chartData.length === 0 ? (
          <p className="text-gray-500 py-8 text-center">
            No data for the selected range.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="sunday" stroke="currentColor" fontSize={12} />
              <YAxis
                stroke="currentColor"
                fontSize={12}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--background)",
                  border: "1px solid var(--tertiary)",
                  borderRadius: "8px",
                  color: "var(--foreground)",
                }}
                labelFormatter={(label) => String(label)}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="requests"
                name="Total Requests"
                stroke="var(--primary)"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="picked"
                name="Picked"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Detail table */}
      <div>
        <h3 className="text-xl font-semibold mb-3">Weekly Breakdown</h3>
        {tableBody.length === 0 ? (
          <p className="text-gray-500 py-8 text-center">
            No report data for the selected range.
          </p>
        ) : (
          <Table<WeeklyReport>
            headerMap={{
              sundayKey: "Service Sunday",
              totalRequests: "Total",
              adults: "Adults",
              children: "Children",
              picked: "Picked",
              notPicked: "Not Picked",
              pending: "Pending",
              cancelled: "Cancelled",
              firstService: "1st Service",
              secondService: "2nd Service",
              pickupRate: "Pickup Rate",
              totalPassengersPicked: "Passengers",
            }}
            body={tableBody}
            fieldFormatter={(k, v) => {
              if (k === "sundayKey") return formatReportSunday(v);
              if (k === "pickupRate") {
                const n = parseFloat(v);
                return isNaN(n) ? v : `${(n * 100).toFixed(1)}%`;
              }
              return v;
            }}
          />
        )}
      </div>
    </div>
  );
}
