import type { ReactElement } from "react";
import type { Site } from "../api/types";

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}): ReactElement {
  return (
    <div>
      <dt className="text-sm text-text-muted">{label}</dt>
      <dd className="font-semibold tabular-nums">{value}</dd>
    </div>
  );
}

export default function SiteFacts({ site }: { site: Site }): ReactElement {
  return (
    <dl className="grid grid-cols-2 gap-4 rounded-card bg-surface px-6 py-5 shadow-card sm:grid-cols-4">
      <Detail label="Latitude" value={String(site.latitude)} />
      <Detail label="Longitude" value={String(site.longitude)} />
      <Detail
        label="Roof area"
        value={site.roofAreaM2 === null ? "Not set" : `${site.roofAreaM2} m²`}
      />
      <Detail label="Peak power" value={`${site.peakKwp} kWp`} />
    </dl>
  );
}
