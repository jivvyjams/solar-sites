from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator
from pydantic.alias_generators import to_camel


class CamelModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


class Credentials(CamelModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class RegisterIn(Credentials):
    @field_validator("password")
    @classmethod
    def check_composition(cls, value: str) -> str:
        has_upper = any(c.isupper() for c in value)
        has_digit = any(c.isdigit() for c in value)
        has_symbol = any(not c.isalnum() for c in value)
        if not (has_upper and has_digit and has_symbol):
            raise ValueError(
                "Use at least one capital letter, one number and one symbol"
            )
        return value


class MeOut(CamelModel):
    email: str
    csrf_token: str


class SiteIn(CamelModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    client_name: str = Field(min_length=1, max_length=200)
    address: str = Field(min_length=1, max_length=500)
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    roof_area_m2: float | None = Field(default=None, gt=0, le=1_000_000)
    peak_kwp: float = Field(gt=0, le=1000)


class SiteOut(SiteIn):
    id: str


class MonthKwh(CamelModel):
    month: int
    kwh: float


class ProductionOut(CamelModel):
    yearly_kwh: float
    monthly_kwh: list[MonthKwh]


class EnergyTotals(CamelModel):
    self_used_kwh: float
    grid_import_kwh: float
    grid_export_kwh: float


class BatteryOut(CamelModel):
    production_kwh: float
    consumption_kwh: float
    capacity_kwh: float
    without_battery: EnergyTotals
    with_battery: EnergyTotals
    battery_gain_kwh: float


class AddressOut(CamelModel):
    address: str
    latitude: float
    longitude: float
