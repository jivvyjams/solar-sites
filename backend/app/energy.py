# PVGIS default household profile: the share of a day's use in each hour,
# hours 0 to 23 in Dutch standard time, the 24 shares add up to 1.
PROFILE = [
    0.0505, 0.0350, 0.0270, 0.0250, 0.0245, 0.0265,
    0.0345, 0.0295, 0.0230, 0.0180, 0.0180, 0.0205,
    0.0265, 0.0350, 0.0415, 0.0505, 0.0455, 0.0340,
    0.0250, 0.0300, 0.0650, 0.1095, 0.1175, 0.0880,
]  # fmt: skip
UTC_OFFSET = 1  # PVGIS hours are UTC, Dutch standard time is one hour ahead
EFFICIENCY = 0.9  # typical round-trip efficiency of a home battery


def hourly_use(annual_use_kwh: float, hours: int) -> list[float]:
    daily_use_kwh = annual_use_kwh / 365
    return [daily_use_kwh * PROFILE[(hour + UTC_OFFSET) % 24] for hour in range(hours)]


def simulate(production: list[float], use: list[float], capacity_kwh: float) -> dict:
    charge = 0.0
    self_used = 0.0
    grid_import = 0.0
    grid_export = 0.0
    for produced, needed in zip(production, use):
        if produced >= needed:
            surplus = produced - needed
            stored = min(surplus, capacity_kwh - charge)
            charge += stored
            self_used += needed
            grid_export += surplus - stored
        else:
            shortfall = needed - produced
            delivered = min(shortfall, charge * EFFICIENCY)
            charge -= delivered / EFFICIENCY
            self_used += produced + delivered
            grid_import += shortfall - delivered
    return {
        "self_used_kwh": round(self_used, 1),
        "grid_import_kwh": round(grid_import, 1),
        "grid_export_kwh": round(grid_export, 1),
    }
