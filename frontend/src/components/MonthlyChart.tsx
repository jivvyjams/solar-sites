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

const TICK_STEPS = [
  10, 20, 50, 100, 200, 500, 1_000, 2_000, 5_000, 10_000, 20_000, 50_000,
  100_000,
];

const compact = new Intl.NumberFormat("en-US", { notation: "compact" });

export default function MonthlyChart({
  months,
}: {
  months: MonthKwh[];
}): ReactElement {
  const max = Math.max(...months.map((m) => m.kwh));
  const step = TICK_STEPS.find((s) => max / s <= 5) ?? 100_000;
  const ticks = Array.from(
    { length: Math.floor(max / step) + 1 },
    (_, i) => i * step,
  );

  return (
    <div className="flex gap-2">
      <div className="relative mt-8 h-40 w-10 shrink-0" aria-hidden="true">
        {ticks.map((t) => (
          <span
            key={t}
            className="absolute right-0 translate-y-1/2 text-xs text-text-muted"
            style={{ bottom: `${(t / max) * 100}%` }}
          >
            {compact.format(t)}
          </span>
        ))}
      </div>
      <div className="relative flex-1">
        <div className="absolute inset-x-0 top-8 h-40" aria-hidden="true">
          {ticks
            .filter((t) => t > 0)
            .map((t) => (
              <div
                key={t}
                className="absolute inset-x-0 border-t border-border"
                style={{ bottom: `${(t / max) * 100}%` }}
              />
            ))}
        </div>
        <ol className="relative flex gap-0.5">
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
      </div>
    </div>
  );
}
