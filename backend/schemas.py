import datetime
from pydantic import BaseModel, Field
from typing import Literal, Optional
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


EventType = Literal["TRAINING", "REST", "MATCH"]
CompetitionFormat = Literal["LEAGUE", "CUP", "FRIENDLY"]
CompetitionScope = Literal["STATE", "NATIONAL", "CONTINENTAL"]

class EventBase(BaseModel):
    date: datetime.date
    type: EventType
    training_type: Optional[str] = None
    competition_format: Optional[CompetitionFormat] = None
    competition_scope: Optional[CompetitionScope] = None
    competition_name: Optional[str] = None
    opponent: Optional[str] = None
    stage: Optional[str] = None
    notes: Optional[str] = None

class EventCreate(EventBase):
    pass

class EventResponse(EventBase):
    id: int

    class Config:
        from_attributes = True