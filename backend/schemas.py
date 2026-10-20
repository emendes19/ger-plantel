from pydantic import BaseModel, Field
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
    nationality: Optional[str] = None

class PlayerCreate(PlayerBase):
    # Camisa válida: de 1 a 99 (só na criação, para não afetar atletas já cadastrados)
    number: int = Field(ge=1, le=99)

class PlayerResponse(PlayerBase):
    id: int

    class Config:
        from_attributes = True