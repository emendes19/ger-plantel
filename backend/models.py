from sqlalchemy import Column, Integer, String, Enum, Date, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
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
    # Resumo da lesão ativa, mantido pelo servidor (atletas antigos podem ter texto livre aqui)
    injury = Column(String(255), nullable=True)
    foot = Column(String(20), nullable=False)
    contract_end = Column(String(20), nullable=False)
    nationality = Column(String(50), nullable=True)
    suspension_reason = Column(String(100), nullable=True)
    suspension_games = Column(Integer, nullable=True)

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

class Injury(Base):
    __tablename__ = "injuries"

    id = Column(Integer, primary_key=True, index=True)
    player_id = Column(Integer, ForeignKey("players.id", ondelete="CASCADE"), nullable=False, index=True)
    injury_type = Column(String(50), nullable=False)
    body_part = Column(String(50), nullable=False)
    body_side = Column(String(20), nullable=True)  # Direito ou Esquerdo
    injury_date = Column(Date, nullable=False)
    match_event_id = Column(Integer, ForeignKey("events.id", ondelete="SET NULL"), nullable=True)
    expected_return_training = Column(Date, nullable=True)
    expected_return_play = Column(Date, nullable=True)
    discharge_date = Column(Date, nullable=True)  # preenchida quando o atleta recebe alta
    notes = Column(String(255), nullable=True)

    match = relationship("Event")