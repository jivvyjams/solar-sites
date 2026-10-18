import "leaflet/dist/leaflet.css";
import type { ReactElement } from "react";
import type { LatLngTuple } from "leaflet";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import { Link } from "react-router";
import type { Site } from "../api/types";

const TILES = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export default function SitesMap({ sites }: { sites: Site[] }): ReactElement {
  const points: LatLngTuple[] = sites.map((site) => [
    site.latitude,
    site.longitude,
  ]);

  return (
    <MapContainer
      bounds={points}
      boundsOptions={{ padding: [32, 32], maxZoom: 14 }}
      scrollWheelZoom={false}
      className="isolate h-96 rounded-card shadow-card"
    >
      <TileLayer url={TILES} attribution={ATTRIBUTION} />
      {sites.map((site) => (
        <CircleMarker
          key={site.id}
          center={[site.latitude, site.longitude]}
          radius={8}
          pathOptions={{
            className: "fill-solar stroke-surface",
            fillOpacity: 1,
            weight: 2,
          }}
        >
          <Popup>
            <div className="flex flex-col gap-1 font-sans">
              <span className="font-semibold">{site.clientName}</span>
              <span className="text-text-muted">{site.address}</span>
              <Link to={`/sites/${site.id}`} className="font-semibold">
                View site
              </Link>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
