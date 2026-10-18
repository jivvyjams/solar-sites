import type { ReactElement } from "react";
import type { Battery, EnergyTotals } from "../api/types";
import { kwh } from "../lib/format";

const ROWS: { label: string; key: keyof EnergyTotals }[] = [
  { label: "Self-used solar", key: "selfUsedKwh" },
  { label: "Imported from grid", key: "gridImportKwh" },
  { label: "Exported to grid", key: "gridExportKwh" },
];

export default function BatteryResult({
  battery,
}: {
  battery: Battery;
}): ReactElement {
  const { withoutBattery, withBattery } = battery;
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
          {kwh(withoutBattery.selfUsedKwh)} to {kwh(withBattery.selfUsedKwh)}.
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
              <th scope="row" className="py-3.5 text-sm font-semibold">
                {row.label}
              </th>
              <td className="py-3.5 font-semibold tabular-nums">
                {kwh(withoutBattery[row.key])}
              </td>
              <td className="py-3.5 font-semibold tabular-nums">
                {kwh(withBattery[row.key])}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-sm text-text-muted">
        Based on {kwh(battery.productionKwh)} of solar production in 2023 and{" "}
        {kwh(battery.consumptionKwh)} of household use per year.
      </p>
    </>
  );
}
