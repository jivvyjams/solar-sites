import {
  useEffect,
  useState,
  type ReactElement,
  type SubmitEvent,
} from "react";
import { Link, useNavigate, useParams } from "react-router";
import { PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react";
import { ApiError } from "../api/client";
import { deleteSite, getBattery, getProduction, getSite } from "../api/sites";
import type { Battery, EnergyTotals, Production, Site } from "../api/types";
import Button from "../components/Button";
import { buttonClasses } from "../components/buttonClasses";
import ErrorBanner from "../components/ErrorBanner";
import Field from "../components/Field";
import MonthlyChart from "../components/MonthlyChart";
import PageHeader from "../components/PageHeader";
import Spinner from "../components/Spinner";

type PageState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; site: Site };

type ProductionState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; production: Production };

type BatteryState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; error: ApiError }
  | { status: "success"; battery: Battery };

const ROWS: { label: string; key: keyof EnergyTotals }[] = [
  { label: "Self-used solar", key: "selfUsedKwh" },
  { label: "Imported from grid", key: "gridImportKwh" },
  { label: "Exported to grid", key: "gridExportKwh" },
];

function kwh(value: number): string {
  return `${Math.round(value).toLocaleString("en-US")} kWh`;
}

function Detail({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}): ReactElement {
  return (
    <div className={className}>
      <dt className="text-sm text-text-muted">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}

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
          {Math.round(yearlyKwh).toLocaleString("en-US")}
        </span>
        <span className="ml-2 text-text-muted">kWh per year</span>
      </p>
      <MonthlyChart months={monthlyKwh} />
    </>
  );
}

function BatteryResult({
  state,
}: {
  state: BatteryState;
}): ReactElement | null {
  if (state.status === "idle") {
    return null;
  }
  if (state.status === "loading") {
    return <Spinner label="Asking PVGIS" />;
  }
  if (state.status === "error") {
    return <ErrorBanner message={state.error.message} />;
  }

  const { battery } = state;
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

function BatterySection({ siteId }: { siteId: string }): ReactElement {
  const [capacityKwh, setCapacityKwh] = useState("5");
  const [annualUseKwh, setAnnualUseKwh] = useState("3500");
  const [state, setState] = useState<BatteryState>({ status: "idle" });

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setState({ status: "loading" });
    try {
      const battery = await getBattery(
        siteId,
        capacityKwh.trim().replace(",", "."),
        annualUseKwh.trim().replace(",", "."),
      );
      setState({ status: "success", battery });
    } catch (err) {
      setState({
        status: "error",
        error:
          err instanceof ApiError
            ? err
            : new ApiError(0, "Could not reach the server. Try again."),
      });
    }
  }

  const fieldErrors = state.status === "error" ? state.error.fieldErrors : {};

  return (
    <section className="flex flex-col gap-6 rounded-card bg-surface p-6 shadow-card">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-2xl">
          Self-consumption with a battery
        </h2>
        <p className="text-sm text-text-muted">
          PVGIS household profile, hourly simulation, 90 % round-trip
          efficiency, 2023 weather
        </p>
      </div>
      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-wrap items-end gap-4"
      >
        <Field
          label="Battery capacity (kWh)"
          id="capacityKwh"
          className="w-50"
          value={capacityKwh}
          onChange={(e) => setCapacityKwh(e.target.value)}
          error={fieldErrors.capacityKwh}
        />
        <Field
          label="Annual electricity use (kWh)"
          id="annualUseKwh"
          className="w-60"
          value={annualUseKwh}
          onChange={(e) => setAnnualUseKwh(e.target.value)}
          error={fieldErrors.annualUseKwh}
        />
        <Button type="submit" loading={state.status === "loading"}>
          Calculate
        </Button>
      </form>
      <BatteryResult state={state} />
    </section>
  );
}

export default function SiteDetail(): ReactElement {
  const id = useParams().id!;
  const navigate = useNavigate();
  const [page, setPage] = useState<PageState>({ status: "loading" });
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [production, setProduction] = useState<ProductionState>({
    status: "loading",
  });

  useEffect(() => {
    getSite(id)
      .then((site) => setPage({ status: "success", site }))
      .catch((err: unknown) => {
        setPage({
          status: "error",
          message: err instanceof Error ? err.message : "Could not load site.",
        });
      });
  }, [id]);

  useEffect(() => {
    getProduction(id)
      .then((data) => setProduction({ status: "success", production: data }))
      .catch((err: unknown) => {
        setProduction({
          status: "error",
          message:
            err instanceof Error ? err.message : "Could not load production.",
        });
      });
  }, [id]);

  async function handleDelete(): Promise<void> {
    if (!window.confirm("Delete this site? This cannot be undone.")) {
      return;
    }
    setDeleteError(null);
    setIsDeleting(true);
    try {
      await deleteSite(id);
      navigate("/", { replace: true });
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : "Could not delete the site.",
      );
      setIsDeleting(false);
    }
  }
  if (page.status === "error") {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Site" />
        <ErrorBanner message={page.message} />
      </div>
    );
  }
  if (page.status === "loading") {
    return <Spinner label="Loading site" />;
  }

  const { site } = page;
  const actions = (
    <div className="flex gap-3">
      <Link to={`/sites/${id}/edit`} className={buttonClasses("secondary")}>
        <PencilSimpleIcon size={16} aria-hidden="true" />
        Edit
      </Link>
      <Button variant="danger" loading={isDeleting} onClick={handleDelete}>
        <TrashIcon size={16} aria-hidden="true" />
        Delete
      </Button>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={site.clientName} action={actions} />
      {deleteError && <ErrorBanner message={deleteError} />}
      <dl className="grid gap-4 rounded-card bg-surface p-6 shadow-card sm:grid-cols-2">
        <Detail
          label="Address"
          value={site.address}
          className="sm:col-span-2"
        />
        <Detail label="Latitude" value={String(site.latitude)} />
        <Detail label="Longitude" value={String(site.longitude)} />
        <Detail label="Peak power" value={`${site.peakKwp} kWp`} />
        <Detail
          label="Roof area"
          value={site.roofAreaM2 === null ? "Not set" : `${site.roofAreaM2} m²`}
        />
      </dl>
      <section className="flex flex-col gap-6 rounded-card bg-surface p-6 shadow-card">
        <h2 className="font-display text-2xl">Production</h2>
        <ProductionBody state={production} />
      </section>
      <BatterySection siteId={id} />
    </div>
  );
}
