from datetime import date
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from typing import List, Optional

import models
import schemas
from database import engine, get_db

# Cria as tabelas automaticamente no MySQL
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Plantel Manager API", version="1.0.0")

# Permite chamadas do React (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "API do Gerenciador de Plantel está rodando!"}

def invalid(message: str) -> HTTPException:
    return HTTPException(status_code=422, detail=message)

def parse_text(value) -> Optional[str]:
    return value.strip() if isinstance(value, str) and value.strip() else None

# ------------------------------------------------------------ Lesões (apoio)

def status_of(player) -> str:
    return getattr(player.status, "value", player.status)

def to_model_status(value) -> models.PlayerStatus:
    return models.PlayerStatus(getattr(value, "value", value))

def active_injuries_of(db: Session, player_id: int) -> list:
    db.flush()  # garante que alterações pendentes já valem na consulta
    return (
        db.query(models.Injury)
        .filter(models.Injury.player_id == player_id, models.Injury.discharge_date.is_(None))
        .order_by(models.Injury.injury_date.desc(), models.Injury.id.desc())
        .all()
    )

def describe_injury(injury: models.Injury) -> str:
    text = f"{injury.injury_type} — {injury.body_part}"
    if injury.body_side:
        text += f" (lado {injury.body_side.lower()})"
    if injury.expected_return_play:
        text += f" · liberação para jogo em {injury.expected_return_play.strftime('%d/%m/%Y')}"
    return text[:255]

def refresh_player_summary(db: Session, player: models.Player):
    """Mantém players.injury como resumo da lesão ativa mais recente."""
    active = active_injuries_of(db, player.id)
    if active:
        player.injury = describe_injury(active[0])
    elif status_of(player) != "INJURED":
        player.injury = None
    # Lesionado sem registro detalhado: mantém o texto antigo, se houver

def close_active_injuries(db: Session, player_id: int):
    today = date.today()
    for injury in active_injuries_of(db, player_id):
        injury.discharge_date = today

def sync_player_after_injury_change(db: Session, player: Optional[models.Player]):
    """Usar só quando uma lesão ATIVA foi encerrada ou removida."""
    if player is None:
        return
    if not active_injuries_of(db, player.id) and status_of(player) == "INJURED":
        player.status = models.PlayerStatus.AVAILABLE
    refresh_player_summary(db, player)

# ---------------------------------------------------------------- Atletas

def prepare_player_data(player: schemas.PlayerCreate) -> dict:
    data = player.model_dump()
    data["status"] = to_model_status(data["status"])
    data.pop("injury", None)  # o resumo da lesão é calculado pelo servidor

    if data["status"] == models.PlayerStatus.SUSPENDED:
        data["suspension_reason"] = parse_text(data.get("suspension_reason"))
    else:
        data["suspension_reason"] = None
        data["suspension_games"] = None
    return data

@app.get("/players", response_model=List[schemas.PlayerResponse])
def list_players(db: Session = Depends(get_db)):
    return db.query(models.Player).all()

@app.post("/players", response_model=schemas.PlayerResponse)
def create_player(player: schemas.PlayerCreate, db: Session = Depends(get_db)):
    # 1. Verificação amigável: informa quem já usa a camisa
    owner = db.query(models.Player).filter(models.Player.number == player.number).first()
    if owner:
        raise HTTPException(
            status_code=409,
            detail=f"A camisa {player.number} já pertence a {owner.name}.",
        )

    db_player = models.Player(**prepare_player_data(player))
    db.add(db_player)

    # 2. Trava final: se dois cadastros simultâneos passarem pela verificação acima,
    #    a restrição única do banco barra o segundo
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail=f"A camisa {player.number} já está em uso por outro atleta.",
        )

    db.refresh(db_player)
    return db_player

@app.put("/players/{player_id}", response_model=schemas.PlayerResponse)
def update_player(player_id: int, player: schemas.PlayerCreate, db: Session = Depends(get_db)):
    db_player = db.query(models.Player).filter(models.Player.id == player_id).first()
    if not db_player:
        raise HTTPException(status_code=404, detail="Atleta não encontrado")

    # A camisa só conflita com OUTRO atleta (o próprio pode manter o número)
    owner = (
        db.query(models.Player)
        .filter(models.Player.number == player.number, models.Player.id != player_id)
        .first()
    )
    if owner:
        raise HTTPException(
            status_code=409,
            detail=f"A camisa {player.number} já pertence a {owner.name}.",
        )

    for field, value in prepare_player_data(player).items():
        setattr(db_player, field, value)

    try:
        # Marcar o atleta como Disponível pelo Plantel equivale a dar alta nas lesões abertas
        if status_of(db_player) == "AVAILABLE":
            close_active_injuries(db, db_player.id)
        refresh_player_summary(db, db_player)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail=f"A camisa {player.number} já está em uso por outro atleta.",
        )

    db.refresh(db_player)
    return db_player

@app.delete("/players/{player_id}")
def delete_player(player_id: int, db: Session = Depends(get_db)):
    db_player = db.query(models.Player).filter(models.Player.id == player_id).first()
    if not db_player:
        raise HTTPException(status_code=404, detail="Atleta não encontrado")
    db.delete(db_player)  # as lesões do atleta são removidas junto (ON DELETE CASCADE)
    db.commit()
    return {"message": "Atleta excluído com sucesso"}

# ----------------------------------------------------------------- Calendário

EVENT_TEXT_FIELDS = [
    "training_type", "competition_format", "competition_scope",
    "competition_name", "opponent", "stage", "notes",
]

def clean_event(event: schemas.EventCreate) -> dict:
    """Valida as regras de cada tipo de evento e descarta os campos que não se aplicam."""
    data = event.model_dump()

    for field in EVENT_TEXT_FIELDS:
        data[field] = parse_text(data.get(field))

    allowed = {"notes"}

    if data["type"] == "TRAINING":
        if not data["training_type"]:
            raise invalid("Informe o tipo de treino.")
        allowed.add("training_type")

    elif data["type"] == "MATCH":
        if not data["opponent"]:
            raise invalid("Informe o adversário.")
        if not data["competition_format"]:
            raise invalid("Informe o tipo de competição (liga, copa ou amistoso).")
        allowed.update({"opponent", "competition_format", "competition_name"})

        if data["competition_format"] != "FRIENDLY":
            if not data["competition_scope"]:
                raise invalid("Informe a abrangência da competição (estadual, nacional ou continental).")
            if not data["stage"]:
                raise invalid("Informe a rodada (liga) ou a fase (copa).")
            if data["competition_format"] == "LEAGUE" and not data["stage"].isdigit():
                raise invalid("A rodada deve ser um número.")
            allowed.update({"competition_scope", "stage"})

    for field in EVENT_TEXT_FIELDS:
        if field not in allowed:
            data[field] = None

    return data

def ensure_date_free(db: Session, day: date, ignore_id: Optional[int] = None):
    query = db.query(models.Event).filter(models.Event.date == day)
    if ignore_id is not None:
        query = query.filter(models.Event.id != ignore_id)
    if query.first():
        raise HTTPException(
            status_code=409,
            detail=f"Já existe um evento marcado em {day.strftime('%d/%m/%Y')}.",
        )

@app.get("/events", response_model=List[schemas.EventResponse])
def list_events(start: Optional[date] = None, end: Optional[date] = None, db: Session = Depends(get_db)):
    query = db.query(models.Event)
    if start:
        query = query.filter(models.Event.date >= start)
    if end:
        query = query.filter(models.Event.date <= end)
    return query.order_by(models.Event.date).all()

@app.post("/events", response_model=schemas.EventResponse)
def create_event(event: schemas.EventCreate, db: Session = Depends(get_db)):
    data = clean_event(event)
    ensure_date_free(db, data["date"])

    db_event = models.Event(**data)
    db.add(db_event)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Já existe um evento marcado nesta data.")

    db.refresh(db_event)
    return db_event

@app.put("/events/{event_id}", response_model=schemas.EventResponse)
def update_event(event_id: int, event: schemas.EventCreate, db: Session = Depends(get_db)):
    db_event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Evento não encontrado")

    data = clean_event(event)
    ensure_date_free(db, data["date"], ignore_id=event_id)

    for field, value in data.items():
        setattr(db_event, field, value)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Já existe um evento marcado nesta data.")

    db.refresh(db_event)
    return db_event

@app.delete("/events/{event_id}")
def delete_event(event_id: int, db: Session = Depends(get_db)):
    db_event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Evento não encontrado")
    db.delete(db_event)
    db.commit()
    return {"message": "Evento removido com sucesso"}

# --------------------------------------------------------- Departamento médico

def clean_injury(db: Session, data: dict) -> dict:
    for field in ("injury_type", "body_part", "body_side", "notes"):
        data[field] = parse_text(data.get(field))

    if not data["injury_type"]:
        raise invalid("Informe o tipo da lesão.")
    if not data["body_part"]:
        raise invalid("Informe o local da lesão.")

    injury_date = data["injury_date"]
    training = data.get("expected_return_training")
    play = data.get("expected_return_play")
    discharge = data.get("discharge_date")

    if injury_date > date.today():
        raise invalid("A data da lesão não pode ser futura.")
    if training and training < injury_date:
        raise invalid("O retorno aos treinos não pode ser anterior à data da lesão.")
    if play and play < injury_date:
        raise invalid("A liberação para jogar não pode ser anterior à data da lesão.")
    if training and play and play < training:
        raise invalid("A liberação para jogar não pode ser anterior ao retorno aos treinos.")
    if discharge:
        if discharge < injury_date:
            raise invalid("A alta não pode ser anterior à data da lesão.")
        if discharge > date.today():
            raise invalid("A data da alta não pode ser futura.")

    match_id = data.get("match_event_id")
    if match_id is not None:
        match = db.query(models.Event).filter(models.Event.id == match_id).first()
        if not match or match.type != "MATCH":
            raise invalid("O jogo selecionado não foi encontrado no calendário.")

    return data

@app.get("/injuries", response_model=List[schemas.InjuryResponse])
def list_injuries(
    player_id: Optional[int] = None,
    active: Optional[bool] = None,
    db: Session = Depends(get_db),
):
    query = db.query(models.Injury)
    if player_id is not None:
        query = query.filter(models.Injury.player_id == player_id)
    if active is True:
        query = query.filter(models.Injury.discharge_date.is_(None))
    elif active is False:
        query = query.filter(models.Injury.discharge_date.isnot(None))
    return query.order_by(models.Injury.injury_date.desc(), models.Injury.id.desc()).all()

@app.post("/injuries", response_model=schemas.InjuryResponse)
def create_injury(injury: schemas.InjuryCreate, db: Session = Depends(get_db)):
    player = db.query(models.Player).filter(models.Player.id == injury.player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Atleta não encontrado")

    data = clean_injury(db, injury.model_dump())
    db_injury = models.Injury(**data)
    db.add(db_injury)

    # Lesão em andamento: o atleta passa a Lesionado.
    # Lesão anterior (já com alta): entra só no histórico, sem mudar o status atual.
    if not data.get("discharge_date") and status_of(player) == "AVAILABLE":
        player.status = models.PlayerStatus.INJURED
    refresh_player_summary(db, player)

    db.commit()
    db.refresh(db_injury)
    return db_injury

@app.put("/injuries/{injury_id}", response_model=schemas.InjuryResponse)
def update_injury(injury_id: int, injury: schemas.InjuryUpdate, db: Session = Depends(get_db)):
    db_injury = db.query(models.Injury).filter(models.Injury.id == injury_id).first()
    if not db_injury:
        raise HTTPException(status_code=404, detail="Lesão não encontrada")

    data = clean_injury(db, injury.model_dump())
    new_discharge = data.pop("discharge_date", None)
    was_active = db_injury.discharge_date is None

    # Lesão encerrada nunca é reaberta por edição: sem data nova, mantém a alta atual
    effective_discharge = new_discharge or db_injury.discharge_date
    if effective_discharge and effective_discharge < data["injury_date"]:
        raise invalid("A data da lesão não pode ser posterior à data da alta.")

    for field, value in data.items():
        setattr(db_injury, field, value)
    if new_discharge:
        db_injury.discharge_date = new_discharge

    player = db.query(models.Player).filter(models.Player.id == db_injury.player_id).first()
    if player:
        if was_active and new_discharge:
            sync_player_after_injury_change(db, player)
        else:
            refresh_player_summary(db, player)

    db.commit()
    db.refresh(db_injury)
    return db_injury

@app.post("/injuries/{injury_id}/discharge", response_model=schemas.InjuryResponse)
def discharge_injury(
    injury_id: int,
    payload: Optional[schemas.InjuryDischarge] = None,
    db: Session = Depends(get_db),
):
    db_injury = db.query(models.Injury).filter(models.Injury.id == injury_id).first()
    if not db_injury:
        raise HTTPException(status_code=404, detail="Lesão não encontrada")
    if db_injury.discharge_date:
        raise HTTPException(status_code=409, detail="Esta lesão já recebeu alta.")

    day = payload.discharge_date if payload and payload.discharge_date else date.today()
    if day < db_injury.injury_date:
        raise invalid("A alta não pode ser anterior à data da lesão.")
    if day > date.today():
        raise invalid("A data da alta não pode ser futura.")

    db_injury.discharge_date = day

    player = db.query(models.Player).filter(models.Player.id == db_injury.player_id).first()
    sync_player_after_injury_change(db, player)

    db.commit()
    db.refresh(db_injury)
    return db_injury

@app.delete("/injuries/{injury_id}")
def delete_injury(injury_id: int, db: Session = Depends(get_db)):
    db_injury = db.query(models.Injury).filter(models.Injury.id == injury_id).first()
    if not db_injury:
        raise HTTPException(status_code=404, detail="Lesão não encontrada")

    was_active = db_injury.discharge_date is None
    player = db.query(models.Player).filter(models.Player.id == db_injury.player_id).first()
    db.delete(db_injury)

    if player:
        if was_active:
            sync_player_after_injury_change(db, player)
        else:
            refresh_player_summary(db, player)

    db.commit()
    return {"message": "Registro de lesão removido com sucesso"}