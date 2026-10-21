from sqlalchemy import Column, Integer, String, Enum, Date, UniqueConstraint
from database import Base
import enum

class PlayerStatus(str, enum.Enum):
    AVAILABLE = "AVAILABLE"
    INJURED = "INJURED"
    SUSPENDED = "SUSPENDED"

class Player(Base):
    __tablename__ = "players"
    __table_args__ = (
        UniqueConstraint("number", name="uq_players_number"),
    )

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    number = Column(Integer, nullable=False)
    position = Column(String(50), nullable=False)
    status = Column(Enum(PlayerStatus), default=PlayerStatus.AVAILABLE)
    age = Column(Integer, nullable=False)
    injury = Column(String(255), nullable=True)
    foot = Column(String(20), nullable=False)
    contract_end = Column(String(20), nullable=False)
    nationality = Column(String(50), nullable=True)

class Event(Base):
    __tablename__ = "events"
    __table_args__ = (
        # Um evento por dia
        UniqueConstraint("date", name="uq_events_date"),
    )

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False)
    type = Column(String(20), nullable=False)  # TRAINING, REST ou MATCH
    training_type = Column(String(50), nullable=True)
    competition_format = Column(String(20), nullable=True)  # LEAGUE, CUP ou FRIENDLY
    competition_scope = Column(String(20), nullable=True)   # STATE, NATIONAL ou CONTINENTAL
    competition_name = Column(String(100), nullable=True)
    opponent = Column(String(100), nullable=True)
    stage = Column(String(50), nullable=True)  # número da rodada (liga) ou nome da fase (copa)
    notes = Column(String(255), nullable=True)