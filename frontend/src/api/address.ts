import { request } from "./client";
import type { FoundAddress } from "./types";

export function lookupAddress(
  postcode: string,
  houseNumber: string,
): Promise<FoundAddress> {
  const query = new URLSearchParams({ postcode, houseNumber });
  return request<FoundAddress>(`/api/address-lookup?${query}`);
}
