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
