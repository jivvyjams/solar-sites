import type { ReactElement } from "react";
import type { Battery, EnergyTotals } from "../api/types";
import { kwh } from "../lib/format";

const ROWS: { label: string; key: keyof EnergyTotals; bar: string }[] = [
  { label: "Self-used solar", key: "selfUsedKwh", bar: "bg-solar" },
  { label: "Imported from grid", key: "gridImportKwh", bar: "bg-border" },
  { label: "Exported to grid", key: "gridExportKwh", bar: "bg-border" },
];

function ValueCell({
  value,
  total,
  bar,
}: {
  value: number;
  total: number;
  bar: string;
}): ReactElement {
  const share = total > 0 ? Math.min((value / total) * 100, 100) : 0;
  return (
    <td className="py-3.5 pr-6">
      <div className="flex flex-col gap-1.5">
        <span className="font-semibold tabular-nums">{kwh(value)}</span>
        <div className="h-2 rounded-full bg-canvas">
          <div
            className={`h-2 rounded-full ${bar}`}
            style={{ width: `${share}%` }}
          />
        </div>
      </div>
    </td>
  );
}

export default function BatteryResult({
  battery,
}: {
  battery: Battery;
}): ReactElement {
  const { withoutBattery, withBattery, productionKwh } = battery;
  const before = withoutBattery.selfUsedKwh;
  const percent =
    before > 0 ? Math.round((battery.batteryGainKwh / before) * 100) : null;

  return (
    <>
      <div className="flex flex-col gap-1 rounded-card bg-solar-soft px-6 py-5">
        <p>
          <span className="text-3xl font-semibold">
            +{kwh(battery.batteryGainKwh)}
          </span>
          <span className="ml-2">of self-used solar per year</span>
        </p>
        <p className="text-sm">
          A {battery.capacityKwh} kWh battery lifts self-used solar from{" "}
          {kwh(before)} to {kwh(withBattery.selfUsedKwh)}
          {percent !== null && `, ${percent} % more`}.
        </p>
      </div>
      <table className="w-full text-left">
        <thead className="text-sm text-text-muted">
          <tr>
            <td />
            <th scope="col" className="pb-3 font-semibold">
              Without battery
            </th>
            <th scope="col" className="pb-3 font-semibold">
              <span className="rounded-control bg-accent-soft px-2 py-0.5 text-accent-hover">
                With {battery.capacityKwh} kWh battery
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => (
            <tr key={row.key} className="border-t border-border">
              <th scope="row" className="py-3.5 pr-6 text-sm font-semibold">
                {row.label}
              </th>
              <ValueCell
                value={withoutBattery[row.key]}
                total={productionKwh}
                bar={row.bar}
              />
              <ValueCell
                value={withBattery[row.key]}
                total={productionKwh}
                bar={row.bar}
              />
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-sm text-text-muted">
        Bars are shares of the {kwh(productionKwh)} produced in 2023. Household
        use: {kwh(battery.consumptionKwh)} per year.
      </p>
    </>
  );
}
