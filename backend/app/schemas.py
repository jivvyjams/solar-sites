from pydantic import BaseModel, ConfigDict, EmailStr, Field
from pydantic.alias_generators import to_camel


class CamelModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


class Credentials(CamelModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class MeOut(CamelModel):
    email: str
    csrf_token: str

class SiteIn(CamelModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    client_name: str = Field(min_length=1, max_length=200)
    address: str = Field(min_lenght=1, max_length=500)
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    roof_area_m2: float | None = Field(default=None, gt=0)
    peak_kwp: float = Field(gt=0, le=1000)

class SiteOut(SiteIn):
    id: str