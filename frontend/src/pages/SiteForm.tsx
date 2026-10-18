import {
  useEffect,
  useState,
  type ReactElement,
  type SubmitEvent,
} from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ApiError } from "../api/client";
import { createSite, getSite, updateSite } from "../api/sites";
import type { FoundAddress, Site, SiteInput } from "../api/types";
import AddressLookup from "../components/AddressLookup";
import Button from "../components/Button";
import { buttonClasses } from "../components/buttonClasses";
import ErrorBanner from "../components/ErrorBanner";
import Field from "../components/Field";
import PageHeader from "../components/PageHeader";
import Spinner from "../components/Spinner";

type FormValues = Record<keyof SiteInput, string>;

type PageState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success" };

const EMPTY: FormValues = {
  clientName: "",
  address: "",
  latitude: "",
  longitude: "",
  roofAreaM2: "",
  peakKwp: "",
};

function toValues(site: Site): FormValues {
  return {
    clientName: site.clientName,
    address: site.address,
    latitude: String(site.latitude),
    longitude: String(site.longitude),
    roofAreaM2: site.roofAreaM2 === null ? "" : String(site.roofAreaM2),
    peakKwp: String(site.peakKwp),
  };
}

function toNumber(value: string): number {
  const normalized = value.trim().replace(",", ".");
  return normalized === "" ? Number.NaN : Number(normalized);
}

function toInput(values: FormValues): SiteInput {
  return {
    clientName: values.clientName,
    address: values.address,
    latitude: toNumber(values.latitude),
    longitude: toNumber(values.longitude),
    roofAreaM2:
      values.roofAreaM2.trim() === "" ? null : toNumber(values.roofAreaM2),
    peakKwp: toNumber(values.peakKwp),
  };
}

export default function SiteForm(): ReactElement {
  const { id } = useParams();
  const navigate = useNavigate();
  const [values, setValues] = useState<FormValues>(EMPTY);
  const [page, setPage] = useState<PageState>(
    id === undefined ? { status: "success" } : { status: "loading" },
  );
  const [error, setError] = useState<ApiError | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id === undefined) {
      return;
    }
    getSite(id)
      .then((site) => {
        setValues(toValues(site));
        setPage({ status: "success" });
      })
      .catch((err: unknown) => {
        setPage({
          status: "error",
          message: err instanceof Error ? err.message : "Could not load site.",
        });
      });
  }, [id]);

  function setField(name: keyof FormValues, value: string): void {
    setValues((current) => ({ ...current, [name]: value }));
  }

  function fillFromLookup(found: FoundAddress): void {
    setValues((current) => ({
      ...current,
      address: found.address,
      latitude: String(found.latitude),
      longitude: String(found.longitude),
    }));
  }

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const input = toInput(values);
      const saved =
        id === undefined
          ? await createSite(input)
          : await updateSite(id, input);
      navigate(`/sites/${saved.id}`);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err
          : new ApiError(0, "Could not reach the server. Try again."),
      );
      setIsSubmitting(false);
    }
  }

  const title = id === undefined ? "Add site" : "Edit site";
  const cancelTo = id === undefined ? "/" : `/sites/${id}`;

  let content: ReactElement;
  if (page.status === "error") {
    content = <ErrorBanner message={page.message} />;
  } else if (page.status === "loading") {
    content = <Spinner label="Loading site" />;
  } else {
    content = (
      <div className="flex max-w-2xl flex-col gap-6 rounded-card bg-surface p-6 shadow-card">
        <AddressLookup onFound={fillFromLookup} />
        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-6 border-t border-border pt-6"
        >
          {error && <ErrorBanner message={error.message} />}
          <Field
            label="Client name"
            id="clientName"
            value={values.clientName}
            onChange={(e) => setField("clientName", e.target.value)}
            error={error?.fieldErrors.clientName}
          />
          <Field
            label="Address"
            id="address"
            value={values.address}
            onChange={(e) => setField("address", e.target.value)}
            error={error?.fieldErrors.address}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Latitude"
              id="latitude"
              value={values.latitude}
              onChange={(e) => setField("latitude", e.target.value)}
              error={error?.fieldErrors.latitude}
            />
            <Field
              label="Longitude"
              id="longitude"
              value={values.longitude}
              onChange={(e) => setField("longitude", e.target.value)}
              error={error?.fieldErrors.longitude}
            />
            <Field
              label="Peak power (kWp)"
              id="peakKwp"
              value={values.peakKwp}
              onChange={(e) => setField("peakKwp", e.target.value)}
              error={error?.fieldErrors.peakKwp}
            />
            <Field
              label="Roof area (m², optional)"
              id="roofAreaM2"
              value={values.roofAreaM2}
              onChange={(e) => setField("roofAreaM2", e.target.value)}
              error={error?.fieldErrors.roofAreaM2}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Link to={cancelTo} className={buttonClasses("secondary")}>
              Cancel
            </Link>
            <Button type="submit" loading={isSubmitting}>
              Save site
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={title} />
      {content}
    </div>
  );
}
