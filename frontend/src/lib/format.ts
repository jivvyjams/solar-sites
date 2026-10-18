export function formatNumber(value: number): string {
  return Math.round(value).toLocaleString("en-US");
}

export function kwh(value: number): string {
  return `${formatNumber(value)} kWh`;
}
