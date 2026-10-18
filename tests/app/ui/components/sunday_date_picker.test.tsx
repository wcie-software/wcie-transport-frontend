import { describe, expect, test } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import SundayDatePicker from "@/app/ui/components/sunday_date_picker";
import { parseSundayKey } from "@/app/utils/util";

describe("SundayDatePicker Edmonton display", () => {
  test("displays a selected service date without a browser-timezone shift", () => {
    const html = renderToStaticMarkup(
      <SundayDatePicker id="service-sunday" date={parseSundayKey("2-8-2026")!} timeZone="America/Edmonton" />,
    );
    expect(html).toContain('value="2026-02-08"');
    expect(html).toContain('id="service-sunday"');
    expect(html).toContain('for="service-sunday"');
  });

  test("uses the Edmonton calendar date when UTC has advanced to Monday", () => {
    const html = renderToStaticMarkup(
      <SundayDatePicker date={new Date("2026-02-09T06:30:00Z")} timeZone="America/Edmonton" includeLabel={false} />,
    );
    expect(html).toContain('value="2026-02-08"');
    expect(html).not.toContain("<label");
  });

  test("retains local date behavior for existing consumers that do not opt in", () => {
    const html = renderToStaticMarkup(<SundayDatePicker date={new Date(2026, 1, 8, 12)} />);
    expect(html).toContain('value="2026-02-08"');
  });
});
