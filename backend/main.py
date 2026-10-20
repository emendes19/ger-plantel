from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

import models
import schemas
from database import engine, get_db

# Cria as tabelas automaticamente no MySQL
models.Base.metadata.create_all(bind=engine)

# 👉 CERTIFIQUE-SE DE QUE ESTA LINHA EXISTE EXATAMENTE ASSIM:
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
    db_player = models.Player(**player.model_dump())
    db.add(db_player)
    db.commit()
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