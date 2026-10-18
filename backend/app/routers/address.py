import sqlite3
from typing import Annotated

from fastapi import APIRouter, Depends, Query

from app import pdok
from app.auth import current_user
from app.schemas import AddressOut

router = APIRouter(prefix="/api")


@router.get("/address-lookup")
def address_lookup(
    postcode: Annotated[str, Query(pattern=r"^[1-9][0-9]{3} ?[A-Za-z]{2}$")],
    house_number: Annotated[int, Query(alias="houseNumber", ge=1, le=99999)],
    user: Annotated[sqlite3.Row, Depends(current_user)],
) -> AddressOut:
    return AddressOut.model_validate(pdok.lookup_address(postcode, house_number))
