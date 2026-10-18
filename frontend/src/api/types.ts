export type Credentials = {
  email: string;
  password: string;
};

export type Me = {
  email: string;
  csrfToken: string;
};

export type SiteInput = {
  clientName: string;
  address: string;
  latitude: number;
  longitude: number;
  roofAreaM2: number | null;
  peakKwp: number;
};

export type Site = SiteInput & {
  id: string;
};

export type MonthKwh = {
  month: number;
  kwh: number;
};

export type Production = {
  yearlyKwh: number;
  monthlyKwh: MonthKwh[];
};

export type EnergyTotals = {
  selfUsedKwh: number;
  gridImportKwh: number;
  gridExportKwh: number;
};

export type Battery = {
  productionKwh: number;
  consumptionKwh: number;
  capacityKwh: number;
  withoutBattery: EnergyTotals;
  withBattery: EnergyTotals;
  batteryGainKwh: number;
};
