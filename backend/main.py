from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from typing import List

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