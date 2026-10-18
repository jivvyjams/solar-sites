import { useEffect, useState, type ReactElement } from "react";
import { getProduction } from "../api/sites";
import type { Production } from "../api/types";
import { formatNumber } from "../lib/format";
import MonthlyChart from "./MonthlyChart";
import Spinner from "../components/Spinner";

type ProductionState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; production: Production };

function ProductionBody({ state }: { state: ProductionState }): ReactElement {
  if (state.status === "loading") {
    return <Spinner label="Asking PVGIS" />;
  }
  if (state.status === "error") {
    return (
      <p
        role="status"
        className="rounded-control bg-accent-soft px-3 py-2 text-sm"
      >
        {state.message}
      </p>
    );
  }

  const { yearlyKwh, monthlyKwh } = state.production;
  return (
    <>
      <p>
        <span className="text-5xl font-semibold">
          {formatNumber(yearlyKwh)}
        </span>
        <span className="ml-2 text-text-muted">kWh per year</span>
      </p>
      <MonthlyChart months={monthlyKwh} />
    </>
  );
}

export default function ProductionSection({
  siteId,
}: {
  siteId: string;
}): ReactElement {
  const [state, setState] = useState<ProductionState>({ status: "loading" });

  useEffect(() => {
    getProduction(siteId)
      .then((data) => setState({ status: "success", production: data }))
      .catch((err: unknown) => {
        setState({
          status: "error",
          message:
            err instanceof Error ? err.message : "Could not load production.",
        });
      });
  }, [siteId]);

  return (
    <section className="flex flex-col gap-6 rounded-card bg-surface p-6 shadow-card">
      <h2 className="font-display text-2xl">Production</h2>
      <ProductionBody state={state} />
    </section>
  );
}
