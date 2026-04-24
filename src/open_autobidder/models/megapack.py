"""Tesla Megapack reference models and helper constructors."""

from pydantic import BaseModel, Field


class MegapackSpec(BaseModel):
    """Reference specification for a Megapack-class asset."""

    name: str = Field(default="Tesla Megapack 2XL")
    usable_capacity_mwh: float = Field(default=3.9, gt=0)
    max_power_mw: float = Field(default=1.95, gt=0)
    round_trip_efficiency: float = Field(default=0.92, gt=0, le=1)


def megapack_2xl_spec() -> MegapackSpec:
    """Return a default Tesla Megapack 2XL-style specification."""
    return MegapackSpec()
