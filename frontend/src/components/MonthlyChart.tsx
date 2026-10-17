import type { ReactElement } from "react";
import type { MonthKwh } from "../api/types";

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function MonthlyChart({
  months,
}: {
  months: MonthKwh[];
}): ReactElement {
  const max = Math.max(...months.map((m) => m.kwh));

  return (
    <ol className="flex gap-0.5">
      {months.map((m) => {
        const label = MONTH_LABELS[m.month - 1];
        const kwh = Math.round(m.kwh);
        return (
          <li
            key={m.month}
            tabIndex={0}
            className="group relative flex flex-1 flex-col items-center gap-2 rounded-control pt-8 focus-visible:outline-2 focus-visible:outline-brand"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-0 z-10 whitespace-nowrap rounded-control bg-surface px-2 py-1 text-xs font-semibold opacity-0 shadow-card transition-opacity group-hover:opacity-100 group-focus:opacity-100"
            >
              {kwh} kWh
            </span>
            <div className="flex h-40 w-full items-end justify-center">
              <div
                className="w-full max-w-6 origin-bottom rounded-t bg-linear-to-b from-solar to-solar-soft transition-opacity group-hover:opacity-80 motion-safe:animate-grow"
                style={{ height: `${(m.kwh / max) * 100}%` }}
              />
            </div>
            <span className="text-xs text-text-muted">{label}</span>
            <span className="sr-only">{kwh} kWh</span>
          </li>
        );
      })}
    </ol>
  );
}
