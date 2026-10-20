from pydantic import BaseModel
from typing import Optional
from enum import Enum

class PlayerStatusSchema(str, Enum):
    AVAILABLE = "AVAILABLE"
    INJURED = "INJURED"
    SUSPENDED = "SUSPENDED"

class PlayerBase(BaseModel):
    name: str
    number: int
    position: str
    status: PlayerStatusSchema = PlayerStatusSchema.AVAILABLE
    age: int
    injury: Optional[str] = None
    foot: str
    contract_end: str

class PlayerCreate(PlayerBase):
    pass

class PlayerResponse(PlayerBase):
    id: int

    class Config:
        from_attributes = True