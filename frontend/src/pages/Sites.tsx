import { useEffect, useState, type ReactElement } from "react";
import { Link } from "react-router";
import { CaretRightIcon, PlusIcon } from "@phosphor-icons/react";
import { listSites } from "../api/sites";
import type { Site } from "../api/types";
import { buttonClasses } from "../components/buttonClasses";
import EmptyState from "../components/EmptyState";
import ErrorBanner from "../components/ErrorBanner";
import PageHeader from "../components/PageHeader";
import SitesMap from "../components/SitesMap";
import Spinner from "../components/Spinner";

type PageState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; sites: Site[] };

export default function Sites(): ReactElement {
  const [state, setState] = useState<PageState>({ status: "loading" });

  useEffect(() => {
    listSites()
      .then((sites) => setState({ status: "success", sites }))
      .catch((err: unknown) => {
        setState({
          status: "error",
          message: err instanceof Error ? err.message : "Could not load sites.",
        });
      });
  }, []);

  const addSite = (
    <Link to="/sites/new" className={buttonClasses("primary")}>
      <PlusIcon size={16} aria-hidden="true" />
      Add site
    </Link>
  );

  let content: ReactElement;
  if (state.status === "error") {
    content = <ErrorBanner message={state.message} />;
  } else if (state.status === "loading") {
    content = <Spinner label="Loading sites" />;
  } else if (state.sites.length === 0) {
    content = (
      <EmptyState
        title="No sites yet"
        message="Add a client site to see its solar production."
        action={addSite}
      />
    );
  } else {
    content = (
      <div className="grid gap-6 lg:min-h-0 lg:flex-1 lg:grid-cols-2 lg:grid-rows-1">
        <ul className="divide-y divide-border overflow-hidden rounded-card bg-surface shadow-card lg:overflow-y-auto">
          {state.sites.map((site) => (
            <li key={site.id}>
              <Link
                to={`/sites/${site.id}`}
                className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-canvas focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand transition-colors"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold">{site.clientName}</p>
                  <p className="truncate text-sm text-text-muted">
                    {site.address}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3 text-sm text-text-muted">
                  <span className="tabular-nums">
                    {site.peakKwp} kWp
                    {site.roofAreaM2 !== null && ` · ${site.roofAreaM2} m²`}
                  </span>
                  <CaretRightIcon size={20} aria-hidden="true" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
        <SitesMap sites={state.sites} />
      </div>
    );
  }

  const count = state.status === "success" ? state.sites.length : 0;
  const subtitle =
    count > 0 ? `${count} client ${count === 1 ? "site" : "sites"}` : undefined;

  return (
    <div className="flex flex-col gap-6 lg:h-pane">
      <PageHeader title="Sites" subtitle={subtitle} action={addSite} />
      {content}
    </div>
  );
}
