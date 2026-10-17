import { useEffect, useState, type ReactElement } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react";
import { deleteSite, getProduction, getSite } from "../api/sites";
import type { Production, Site } from "../api/types";
import Button from "../components/Button";
import { buttonClasses } from "../components/buttonClasses";
import ErrorBanner from "../components/ErrorBanner";
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
    </div>
  );
}
