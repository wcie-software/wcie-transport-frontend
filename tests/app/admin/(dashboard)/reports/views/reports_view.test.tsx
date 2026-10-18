import { beforeEach, describe, expect, test, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import ReportsView from "@/app/admin/(dashboard)/reports/views/reports_view";
import type { WeeklyReport } from "@/app/actions/generate_report";
import { parseSundayKey } from "@/app/utils/util";

type PickerProps = {
  id: string;
  date: Date;
  onDateSelected: (date: Date) => void;
  timeZone: string;
};

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  pickers: [] as PickerProps[],
  chartData: [] as unknown[],
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push }),
  useSearchParams: () => new URLSearchParams("start=2-8-2026&end=2-15-2026&keep=value"),
}));
vi.mock("@/app/ui/components/sunday_date_picker", () => ({
  default: (props: PickerProps) => {
    mocks.pickers.push(props);
    return <input id={props.id} />;
  },
}));
vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => children,
  LineChart: ({ data }: { data: unknown[] }) => {
    mocks.chartData = data;
    return null;
  },
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
}));

const report: WeeklyReport = {
  sundayKey: "2-8-2026", totalRequests: 4, adults: 6, children: 2,
  picked: 2, notPicked: 1, pending: 0, cancelled: 1,
  firstService: 1, secondService: 1, pickupRate: 0.5,
  totalPassengersPicked: 3,
};

function render(reports: WeeklyReport[] = [report], errorMessage?: string) {
  return renderToStaticMarkup(
    <ReportsView startKey="2-8-2026" endKey="2-15-2026" reports={reports} errorMessage={errorMessage} />,
  );
}

beforeEach(() => {
  mocks.push.mockReset();
  mocks.pickers = [];
  mocks.chartData = [];
});

describe("ReportsView service Sunday wiring", () => {
  test("chart and table use the selected service Sunday rather than the prior week", () => {
    const html = render();
    expect(mocks.chartData).toEqual([{ sunday: "Feb 8, 2026", requests: 4, picked: 2 }]);
    expect(html).toContain("Service Sunday</th>");
    expect(html).toContain("Feb 8, 2026</td>");
    expect(html).not.toContain("Feb 1, 2026");
    expect(html).toContain("previous Sunday through Saturday, in Edmonton time");
  });

  test("date selectors have distinct associated labels and opt into Edmonton dates", () => {
    const html = render();
    expect(html).toContain('for="report-start-sunday"');
    expect(html).toContain('for="report-end-sunday"');
    expect(mocks.pickers.map(({ id, timeZone, date }) => ({ id, timeZone, date: date.toISOString() })))
      .toEqual([
        { id: "report-start-sunday", timeZone: "America/Edmonton", date: "2026-02-08T19:00:00.000Z" },
        { id: "report-end-sunday", timeZone: "America/Edmonton", date: "2026-02-15T19:00:00.000Z" },
      ]);
  });

  test("changing the start retains the end and unrelated URL parameters", () => {
    render();
    mocks.pickers[0].onDateSelected(parseSundayKey("2-1-2026")!);
    expect(mocks.push).toHaveBeenCalledWith("?start=2-1-2026&end=2-15-2026&keep=value");
  });

  test("changing the end retains the selected start", () => {
    render();
    mocks.pickers[1].onDateSelected(parseSundayKey("2-22-2026")!);
    expect(mocks.push).toHaveBeenCalledWith("?start=2-8-2026&end=2-22-2026&keep=value");
  });

  test("shows empty and error feedback without inventing a current-date chart point", () => {
    const html = render([], "Invalid service Sunday.");
    expect(html).toContain("Invalid service Sunday.");
    expect(html).toContain("No report data for the selected range.");
    expect(mocks.chartData).toEqual([]);
  });
});
