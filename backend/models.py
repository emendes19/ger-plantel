from sqlalchemy import Column, Integer, String, Enum, UniqueConstraint
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