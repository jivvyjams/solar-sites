import type { ReactElement } from "react";
import type { Site } from "../api/types";

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

export default function SiteFacts({ site }: { site: Site }): ReactElement {
  return (
    <dl className="grid gap-4 rounded-card bg-surface p-6 shadow-card sm:grid-cols-2">
      <Detail label="Address" value={site.address} className="sm:col-span-2" />
      <Detail label="Latitude" value={String(site.latitude)} />
      <Detail label="Longitude" value={String(site.longitude)} />
      <Detail label="Peak power" value={`${site.peakKwp} kWp`} />
      <Detail
        label="Roof area"
        value={site.roofAreaM2 === null ? "Not set" : `${site.roofAreaM2} m²`}
      />
    </dl>
  );
}
