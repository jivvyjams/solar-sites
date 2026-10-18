import { useEffect, useState, type ReactElement } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react";
import { deleteSite, getSite } from "../api/sites";
import type { Site } from "../api/types";
import BatterySection from "../components/BatterySection";
import Button from "../components/Button";
import { buttonClasses } from "../components/buttonClasses";
import ErrorBanner from "../components/ErrorBanner";
import PageHeader from "../components/PageHeader";
import ProductionSection from "../components/ProductionSection";
import SiteFacts from "../components/SiteFacts";
import Spinner from "../components/Spinner";

type PageState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; site: Site };

export default function SiteDetail(): ReactElement {
  const id = useParams().id!;
  const navigate = useNavigate();
  const [page, setPage] = useState<PageState>({ status: "loading" });
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
      <SiteFacts site={site} />
      <ProductionSection siteId={id} />
      <BatterySection siteId={id} />
    </div>
  );
}
