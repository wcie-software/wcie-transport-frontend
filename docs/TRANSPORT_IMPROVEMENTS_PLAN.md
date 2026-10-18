# WCIE Transport improvements plan

## Scope and execution

Only Phase 1 is authorized for implementation in this branch. Phases 2 and 3
remain planned work. “Java Society” is dropped from scope.

## Phase 1 — Reports: selected Sundays and displayed data

- Use service Sunday consistently in date selectors, chart, table, and CSV.
- Replace the chart's previous-Sunday labels with service-Sunday labels.
- Explain that each service Sunday includes requests submitted during the
  preceding Sunday–Saturday window, in Edmonton time.
- Investigate date defaults, URL parameters, formatting, and iteration for
  timezone-related shifts; keep calculations anchored to Edmonton.
- Correct passenger-count enrichment so confirmations recorded on service
  Sunday contribute to the corresponding requests' passenger totals.
- Preserve the rule that Sunday submissions belong to the following Sunday's
  service.
- Unit-test adjacent Sundays, current-Sunday selection, submission boundaries,
  passenger totals and fallback, timezone/DST boundaries, and report export.

Acceptance: selected service dates, chart points, table rows, and exports agree;
request windows remain unchanged; actual pickup counts are used when available.

## Phase 2 — Driver pickups: separate services (deferred)

- Display clearly labeled 1st Service and 2nd Service sections for assigned pickups.
- Keep pending and completed pickups within their respective service sections.
- Preserve route order within each service and make the next-pickup highlight
  service-specific.
- Show counts and empty states clearly.
- Ensure confirming/failing a pickup updates only the correct record.
- Verify drivers with one service, both services, or no pickups, status changes,
  and date navigation; unit-test grouping and ordering.

## Phase 3 — Location controls: both themes (deferred)

- Check driver pickup, completed-pickup, and admin-request map/location controls.
- Verify icon, text, background, and focus visibility in light and dark modes.
- Confirm correct map destinations, keyboard operation, and accessible labels.
- Make only targeted fixes supported by verification.
- Preserve device-controlled theming; no theme toggle or redesign.

## Verification and guardrails

- Use mocked Firestore for report unit tests; no production data writes.
- Run `npm test`, `npx tsc --noEmit`, and `npm run build`.
- Perform browser regression checks when authentication/test data are available;
  explicitly report blocked checks.
- Update relevant documentation when shared helpers or behavior change.
- No unrelated features, authentication changes, or schema changes are planned.
- Work on a feature branch and commit incrementally.
