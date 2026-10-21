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

# ---------------------------------------------------------------- Atletas

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

    db_player = models.Player(**player.model_dump())
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

    for field, value in player.model_dump().items():
        setattr(db_player, field, value)

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

@app.delete("/players/{player_id}")
def delete_player(player_id: int, db: Session = Depends(get_db)):
    db_player = db.query(models.Player).filter(models.Player.id == player_id).first()
    if not db_player:
        raise HTTPException(status_code=404, detail="Atleta não encontrado")
    db.delete(db_player)
    db.commit()
    return {"message": "Atleta excluído com sucesso"}

# ----------------------------------------------------------------- Calendário

EVENT_TEXT_FIELDS = [
    "training_type", "competition_format", "competition_scope",
    "competition_name", "opponent", "stage", "notes",
]

def invalid(message: str) -> HTTPException:
    return HTTPException(status_code=422, detail=message)

def clean_event(event: schemas.EventCreate) -> dict:
    """Valida as regras de cada tipo de evento e descarta os campos que não se aplicam."""
    data = event.model_dump()

    for field in EVENT_TEXT_FIELDS:
        value = data.get(field)
        data[field] = value.strip() if isinstance(value, str) and value.strip() else None

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