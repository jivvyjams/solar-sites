import "leaflet/dist/leaflet.css";
import type { ReactElement } from "react";
import {
  divIcon,
  type LatLngBoundsExpression,
  type LatLngTuple,
} from "leaflet";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  ZoomControl,
} from "react-leaflet";
import { Link } from "react-router";
import type { Site } from "../api/types";

const TILES = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

// The Netherlands with a margin: the map never pans or zooms out of it.
const NETHERLANDS: LatLngBoundsExpression = [
  [50.5, 2.8],
  [53.8, 7.6],
];

const PIN = divIcon({
  className:
    "site-pin rounded-full border-3 border-danger-soft bg-danger-bright shadow-card",
  iconSize: [22, 22],
  popupAnchor: [0, -14],
});

export default function SitesMap({ sites }: { sites: Site[] }): ReactElement {
  const points: LatLngTuple[] = sites.map((site) => [
    site.latitude,
    site.longitude,
  ]);

  return (
    <MapContainer
      bounds={points}
      boundsOptions={{ padding: [48, 48], maxZoom: 13 }}
      maxBounds={NETHERLANDS}
      maxBoundsViscosity={1}
      minZoom={7}
      maxZoom={16}
      zoomControl={false}
      scrollWheelZoom={false}
      className="sites-map isolate order-first h-64 rounded-card shadow-card lg:order-none lg:h-full"
    >
      <TileLayer url={TILES} attribution={ATTRIBUTION} />
      <ZoomControl position="bottomright" />
      {sites.map((site) => (
        <Marker
          key={site.id}
          position={[site.latitude, site.longitude]}
          icon={PIN}
          title={site.clientName}
        >
          <Popup closeButton={false}>
            <div className="flex w-56 flex-col gap-3">
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold">{site.clientName}</span>
                <span className="text-sm text-text-muted">{site.address}</span>
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-border pt-3">
                <span className="text-sm text-text-muted tabular-nums">
                  {site.peakKwp} kWp
                  {site.roofAreaM2 !== null && ` · ${site.roofAreaM2} m²`}
                </span>
                <Link
                  to={`/sites/${site.id}`}
                  className="rounded-control text-sm font-semibold hover:text-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  View site →
                </Link>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
