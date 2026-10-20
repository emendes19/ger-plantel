from database import SessionLocal, engine, Base
import models

# Garante que a tabela 'players' existe
Base.metadata.create_all(bind=engine)

db = SessionLocal()

# Verifica se já existem jogadores no banco para não duplicar
if db.query(models.Player).count() == 0:
    players_data = [
        # Goleiros (3)
        {"name": "Marcos Silva", "number": 1, "position": "Goleiro", "status": "AVAILABLE", "age": 31, "injury": None, "foot": "Destro", "contract_end": "12/2026"},
        {"name": "Renan Ribeiro", "number": 12, "position": "Goleiro", "status": "AVAILABLE", "age": 25, "injury": None, "foot": "Destro", "contract_end": "12/2028"},
        {"name": "Kauã Santos", "number": 24, "position": "Goleiro", "status": "INJURED", "age": 20, "injury": "Entorse no punho (Retorno: 5 dias)", "foot": "Canhoto", "contract_end": "06/2027"},

        # Defensores (8)
        {"name": "Lucas Pereira", "number": 4, "position": "Zagueiro", "status": "INJURED", "age": 24, "injury": "Estiramento na coxa (Retorno: 10 dias)", "foot": "Canhoto", "contract_end": "06/2028"},
        {"name": "Rodrigo Alves", "number": 3, "position": "Zagueiro", "status": "AVAILABLE", "age": 29, "injury": None, "foot": "Destro", "contract_end": "12/2027"},
        {"name": "Matheus Ferraz", "number": 13, "position": "Zagueiro", "status": "AVAILABLE", "age": 27, "injury": None, "foot": "Destro", "contract_end": "12/2026"},
        {"name": "Diego Costa", "number": 33, "position": "Zagueiro", "status": "AVAILABLE", "age": 22, "injury": None, "foot": "Canhoto", "contract_end": "12/2029"},
        {"name": "Felipe Melo", "number": 6, "position": "Lateral Esquerdo", "status": "AVAILABLE", "age": 25, "injury": None, "foot": "Canhoto", "contract_end": "12/2026"},
        {"name": "Wellington Silva", "number": 16, "position": "Lateral Esquerdo", "status": "AVAILABLE", "age": 28, "injury": None, "foot": "Canhoto", "contract_end": "06/2027"},
        {"name": "Yago Pikachu", "number": 2, "position": "Lateral Direito", "status": "AVAILABLE", "age": 30, "injury": None, "foot": "Destro", "contract_end": "12/2026"},
        {"name": "Danilo Cardoso", "number": 22, "position": "Lateral Direito", "status": "SUSPENDED", "age": 23, "injury": "Suspenso por acúmulo de cartões", "foot": "Destro", "contract_end": "12/2028"},

        # Meio-campistas (8)
        {"name": "Carlos Eduardo", "number": 10, "position": "Meia", "status": "AVAILABLE", "age": 26, "injury": None, "foot": "Destro", "contract_end": "12/2027"},
        {"name": "Bruno Guimarães", "number": 5, "position": "Volante", "status": "AVAILABLE", "age": 27, "injury": None, "foot": "Destro", "contract_end": "12/2028"},
        {"name": "Jean Lucas", "number": 8, "position": "Volante", "status": "AVAILABLE", "age": 26, "injury": None, "foot": "Destro", "contract_end": "12/2027"},
        {"name": "Eduardo Oliveira", "number": 15, "position": "Meia", "status": "AVAILABLE", "age": 21, "injury": None, "foot": "Canhoto", "contract_end": "12/2029"},
        {"name": "Gustavo Scarpa", "number": 14, "position": "Meia", "status": "AVAILABLE", "age": 30, "injury": None, "foot": "Canhoto", "contract_end": "12/2026"},
        {"name": "Patrick de Lucca", "number": 18, "position": "Volante", "status": "AVAILABLE", "age": 24, "injury": None, "foot": "Destro", "contract_end": "06/2027"},
        {"name": "Ronaldinho", "number": 20, "position": "Meia", "status": "INJURED", "age": 19, "injury": "Trauma no joelho (Retorno: 20 dias)", "foot": "Destro", "contract_end": "12/2030"},
        {"name": "Nathan Silva", "number": 21, "position": "Volante", "status": "AVAILABLE", "age": 25, "injury": None, "foot": "Destro", "contract_end": "12/2026"},

        # Atacantes (7)
        {"name": "Gabriel Santos", "number": 9, "position": "Atacante", "status": "AVAILABLE", "age": 22, "injury": None, "foot": "Destro", "contract_end": "12/2029"},
        {"name": "Rafael Souza", "number": 7, "position": "Ponta Esquerda", "status": "SUSPENDED", "age": 28, "injury": "Suspenso por expulsão", "foot": "Destro", "contract_end": "12/2026"},
        {"name": "Marinho", "number": 11, "position": "Ponta Direita", "status": "AVAILABLE", "age": 32, "injury": None, "foot": "Canhoto", "contract_end": "12/2026"},
        {"name": "Vitor Roque", "number": 19, "position": "Atacante", "status": "AVAILABLE", "age": 19, "injury": None, "foot": "Destro", "contract_end": "12/2028"},
        {"name": "Everton Cebolinha", "number": 17, "position": "Ponta Esquerda", "status": "AVAILABLE", "age": 27, "injury": None, "foot": "Destro", "contract_end": "06/2027"},
        {"name": "Soteldo", "number": 10, "position": "Ponta Direita", "status": "AVAILABLE", "age": 26, "injury": None, "foot": "Canhoto", "contract_end": "12/2027"},
        {"name": "Breno Lopes", "number": 29, "position": "Atacante", "status": "AVAILABLE", "age": 28, "injury": None, "foot": "Destro", "contract_end": "12/2026"},
    ]

    for p in players_data:
        player_obj = models.Player(**p)
        db.add(player_obj)
    
    db.commit()
    print("✅ 26 atletas inseridos com sucesso no MySQL!")
else:
    print("ℹ️ O banco já possui registros de jogadores.")

db.close()