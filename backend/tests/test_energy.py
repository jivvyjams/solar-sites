import json

import pytest
from test_production import SERIES_FIXTURE

from app.energy import PROFILE, hourly_use, simulate
from app.pvgis import to_hourly_kwh

SUN = [0, 3, 0, 0]
NEED = [1, 1, 1, 1]


def test_hourly_use_follows_the_profile_one_hour_ahead() -> None:
    use = hourly_use(365, 24)

    assert use[0] == PROFILE[1]
    assert use[23] == PROFILE[0]
    assert sum(use) == pytest.approx(1)


def test_without_battery_the_surplus_is_exported() -> None:
    result = simulate(SUN, NEED, 0)

    assert result == {
        "self_used_kwh": 1.0,
        "grid_import_kwh": 3.0,
        "grid_export_kwh": 2.0,
    }


def test_battery_fills_to_capacity_and_loses_ten_percent() -> None:
    result = simulate(SUN, NEED, 1)

    assert result == {
        "self_used_kwh": 1.9,
        "grid_import_kwh": 2.1,
        "grid_export_kwh": 1.0,
    }


def test_energy_balance_holds_on_a_real_day() -> None:
    production = to_hourly_kwh(json.loads(SERIES_FIXTURE.read_text()))
    use = hourly_use(3500, 24)

    result = simulate(production, use, 5)

    self_used = result["self_used_kwh"]
    assert self_used + result["grid_import_kwh"] == pytest.approx(sum(use), abs=0.1)
    assert self_used + result["grid_export_kwh"] < sum(production)
