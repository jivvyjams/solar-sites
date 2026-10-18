import { request } from "./client";
import type { Battery, Production, Site, SiteInput } from "./types";

function sitePath(id: string): string {
  return `/api/sites/${encodeURIComponent(id)}`;
}

export function listSites(): Promise<Site[]> {
  return request<Site[]>("/api/sites");
}

export function getSite(id: string): Promise<Site> {
  return request<Site>(`${sitePath(id)}`);
}

export function createSite(input: SiteInput): Promise<Site> {
  return request<Site>("/api/sites", { method: "POST", body: input });
}

export function updateSite(id: string, input: SiteInput): Promise<Site> {
  return request<Site>(sitePath(id), { method: "PUT", body: input });
}

export function deleteSite(id: string): Promise<void> {
  return request<void>(sitePath(id), { method: "DELETE" });
}

export function getProduction(id: string): Promise<Production> {
  return request<Production>(`${sitePath(id)}/production`);
}

export function getBattery(
  id: string,
  capacityKwh: string,
  annualUseKwh: string,
): Promise<Battery> {
  const query = new URLSearchParams({ capacityKwh, annualUseKwh });
  return request<Battery>(`${sitePath(id)}/battery?${query}`);
}
