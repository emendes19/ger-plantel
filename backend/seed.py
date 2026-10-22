from database import SessionLocal, engine, Base
import models

# Garante a criação das tabelas no MySQL
Base.metadata.create_all(bind=engine)

db = SessionLocal()

# Limpa os dados antigos para aplicar a carga completa do zero
print("🧹 Limpando registros antigos...")
db.query(models.Injury).delete()
db.query(models.Event).delete()
db.query(models.Player).delete()
db.commit()

print("🔄 Populando o banco de dados com elenco, calendário super preenchido e histórico médico...")

# =========================================================================
# 1. PLANTEL COMPLETO (28 ATLETAS - RB BRAGANTINO)
# =========================================================================
players_data = [
    # Goleiros (4)
    {"id": 1, "name": "Cleiton", "number": 1, "position": "Goleiro", "status": "AVAILABLE", "age": 27, "injury": None, "foot": "Destro", "contract_end": "12/2026", "nationality": "Brasileira", "suspension_reason": None, "suspension_games": None},
    {"id": 2, "name": "Lucão", "number": 40, "position": "Goleiro", "status": "AVAILABLE", "age": 23, "injury": None, "foot": "Destro", "contract_end": "12/2027", "nationality": "Brasileira", "suspension_reason": None, "suspension_games": None},
    {"id": 3, "name": "Gustavo Reis", "number": 32, "position": "Goleiro", "status": "AVAILABLE", "age": 19, "injury": None, "foot": "Destro", "contract_end": "12/2028", "nationality": "Brasileira", "suspension_reason": None, "suspension_games": None},
    {"id": 4, "name": "Fernando Costa", "number": 12, "position": "Goleiro", "status": "INJURED", "age": 21, "injury": "Fratura no dedo da mão esquerda", "foot": "Canhoto", "contract_end": "06/2026", "nationality": "Brasileira", "suspension_reason": None, "suspension_games": None},

    # Zagueiros (5)
    {"id": 5, "name": "Léo Realpe", "number": 3, "position": "Zagueiro", "status": "INJURED", "age": 22, "injury": "Estiramento muscular na coxa", "foot": "Destro", "contract_end": "12/2026", "nationality": "Equatoriana", "suspension_reason": None, "suspension_games": None},
    {"id": 6, "name": "Eduardo Santos", "number": 30, "position": "Zagueiro", "status": "INJURED", "age": 26, "injury": "Entorse no tornozelo direito", "foot": "Destro", "contract_end": "12/2027", "nationality": "Brasileira", "suspension_reason": None, "suspension_games": None},
    {"id": 7, "name": "Lucas Cunha", "number": 14, "position": "Zagueiro", "status": "AVAILABLE", "age": 27, "injury": None, "foot": "Destro", "contract_end": "12/2025", "nationality": "Brasileira", "suspension_reason": None, "suspension_games": None},
    {"id": 8, "name": "Pedro Henrique", "number": 4, "position": "Zagueiro", "status": "AVAILABLE", "age": 28, "injury": None, "foot": "Destro", "contract_end": "12/2026", "nationality": "Brasileira", "suspension_reason": None, "suspension_games": None},
    {"id": 9, "name": "César Haydar", "number": 21, "position": "Zagueiro", "status": "SUSPENDED", "age": 23, "injury": None, "foot": "Canhoto", "contract_end": "12/2027", "nationality": "Colombiana", "suspension_reason": "Cartão vermelho direto", "suspension_games": 1},

    # Laterais (5)
    {"id": 10, "name": "Nathan Mendes", "number": 2, "position": "Lateral Direito", "status": "AVAILABLE", "age": 24, "injury": None, "foot": "Destro", "contract_end": "12/2026", "nationality": "Brasileira", "suspension_reason": None, "suspension_games": None},
    {"id": 11, "name": "Andrés Hurtado", "number": 13, "position": "Lateral Direito", "status": "AVAILABLE", "age": 22, "injury": None, "foot": "Destro", "contract_end": "12/2026", "nationality": "Equatoriana", "suspension_reason": None, "suspension_games": None},
    {"id": 12, "name": "Juninho Capixaba", "number": 29, "position": "Lateral Esquerdo", "status": "AVAILABLE", "age": 27, "injury": None, "foot": "Canhoto", "contract_end": "12/2026", "nationality": "Brasileira", "suspension_reason": None, "suspension_games": None},
    {"id": 13, "name": "Luan Cândido", "number": 36, "position": "Lateral Esquerdo", "status": "AVAILABLE", "age": 23, "injury": None, "foot": "Canhoto", "contract_end": "12/2026", "nationality": "Brasileira", "suspension_reason": None, "suspension_games": None},
    {"id": 14, "name": "Guilherme Lopes", "number": 45, "position": "Lateral Esquerdo", "status": "AVAILABLE", "age": 20, "injury": None, "foot": "Canhoto", "contract_end": "12/2028", "nationality": "Brasileira", "suspension_reason": None, "suspension_games": None},

    # Meio-Campistas / Volantes (7)
    {"id": 15, "name": "Jadson", "number": 5, "position": "Volante", "status": "SUSPENDED", "age": 23, "injury": None, "foot": "Destro", "contract_end": "12/2026", "nationality": "Brasileira", "suspension_reason": "Expulsão por falta tática", "suspension_games": 2},
    {"id": 16, "name": "Matheus Fernandes", "number": 35, "position": "Volante", "status": "AVAILABLE", "age": 26, "injury": None, "foot": "Destro", "contract_end": "12/2027", "nationality": "Brasileira", "suspension_reason": None, "suspension_games": None},
    {"id": 17, "name": "Raul", "number": 23, "position": "Volante", "status": "AVAILABLE", "age": 27, "injury": None, "foot": "Destro", "contract_end": "12/2025", "nationality": "Brasileira", "suspension_reason": None, "suspension_games": None},
    {"id": 18, "name": "Eric Ramires", "number": 15, "position": "Meia", "status": "AVAILABLE", "age": 24, "injury": None, "foot": "Destro", "contract_end": "12/2026", "nationality": "Brasileira", "suspension_reason": None, "suspension_games": None},
    {"id": 19, "name": "Lucas Evangelista", "number": 8, "position": "Meia", "status": "INJURED", "age": 29, "injury": "Tendinite no joelho esquerdo", "foot": "Destro", "contract_end": "12/2026", "nationality": "Brasileira", "suspension_reason": None, "suspension_games": None},
    {"id": 20, "name": "Gustavinho", "number": 17, "position": "Meia", "status": "AVAILABLE", "age": 23, "injury": None, "foot": "Destro", "contract_end": "12/2027", "nationality": "Brasileira", "suspension_reason": None, "suspension_games": None},
    {"id": 21, "name": "Eduard Atuesta", "number": 20, "position": "Meia", "status": "AVAILABLE", "age": 27, "injury": None, "foot": "Destro", "contract_end": "12/2026", "nationality": "Colombiana", "suspension_reason": None, "suspension_games": None},

    # Atacantes e Pontas (7)
    {"id": 22, "name": "Vitinho", "number": 28, "position": "Ponta Direita", "status": "AVAILABLE", "age": 25, "injury": None, "foot": "Destro", "contract_end": "12/2026", "nationality": "Brasileira", "suspension_reason": None, "suspension_games": None},
    {"id": 23, "name": "Helinho", "number": 11, "position": "Ponta Direita", "status": "AVAILABLE", "age": 24, "injury": None, "foot": "Canhoto", "contract_end": "12/2026", "nationality": "Brasileira", "suspension_reason": None, "suspension_games": None},
    {"id": 24, "name": "Laquintana", "number": 25, "position": "Ponta Direita", "status": "SUSPENDED", "age": 25, "injury": None, "foot": "Destro", "contract_end": "12/2026", "nationality": "Uruguaia", "suspension_reason": "Acúmulo de 3 cartões amarelos", "suspension_games": 1},
    {"id": 25, "name": "Henry Mosquera", "number": 7, "position": "Ponta Esquerda", "status": "AVAILABLE", "age": 22, "injury": None, "foot": "Destro", "contract_end": "12/2027", "nationality": "Colombiana", "suspension_reason": None, "suspension_games": None},
    {"id": 26, "name": "Thiago Borbas", "number": 19, "position": "Atacante", "status": "AVAILABLE", "age": 22, "injury": None, "foot": "Destro", "contract_end": "12/2028", "nationality": "Uruguaia", "suspension_reason": None, "suspension_games": None},
    {"id": 27, "name": "Eduardo Sasha", "number": 18, "position": "Atacante", "status": "AVAILABLE", "age": 32, "injury": None, "foot": "Canhoto", "contract_end": "12/2024", "nationality": "Brasileira", "suspension_reason": None, "suspension_games": None},
    {"id": 28, "name": "Talisson", "number": 38, "position": "Atacante", "status": "AVAILABLE", "age": 22, "injury": None, "foot": "Destro", "contract_end": "12/2027", "nationality": "Brasileira", "suspension_reason": None, "suspension_games": None}
]

for p in players_data:
    db.add(models.Player(**p))

# =========================================================================
# 2. CALENDÁRIO EXTENSO (32 EVENTOS DE JOGOS E TREINOS)
# =========================================================================
events_data = [
    # Janeiro
    {"id": 1, "date": "2026-01-15", "type": "TRAINING", "training_type": "Físico", "competition_format": None, "competition_scope": None, "competition_name": None, "opponent": None, "stage": None, "notes": "Apresentação e testes de pré-temporada"},
    {"id": 2, "date": "2026-01-21", "type": "MATCH", "training_type": None, "competition_format": "CUP", "competition_scope": "REGIONAL", "competition_name": "Campeonato Paulista", "opponent": "Água Santa", "stage": "Rodada 1", "notes": "Estreia no estadual"},
    {"id": 3, "date": "2026-01-28", "type": "MATCH", "training_type": None, "competition_format": "CUP", "competition_scope": "REGIONAL", "competition_name": "Campeonato Paulista", "opponent": "Guarani", "stage": "Rodada 2", "notes": "Jogo fora de casa"},

    # Fevereiro
    {"id": 4, "date": "2026-02-04", "type": "MATCH", "training_type": None, "competition_format": "CUP", "competition_scope": "REGIONAL", "competition_name": "Campeonato Paulista", "opponent": "Santos", "stage": "Rodada 3", "notes": "Clássico estadual"},
    {"id": 5, "date": "2026-02-10", "type": "MATCH", "training_type": None, "competition_format": "CUP", "competition_scope": "REGIONAL", "competition_name": "Campeonato Paulista", "opponent": "São Paulo", "stage": "Fase de Grupos", "notes": "Vitória em casa por 2x1"},
    {"id": 6, "date": "2026-02-12", "type": "TRAINING", "training_type": "Regenerativo", "competition_format": None, "competition_scope": None, "competition_name": None, "opponent": None, "stage": None, "notes": "Recuperação na piscina e fisioterapia"},
    {"id": 7, "date": "2026-02-18", "type": "MATCH", "training_type": None, "competition_format": "CUP", "competition_scope": "NATIONAL", "competition_name": "Copa do Brasil", "opponent": "Caxias-RS", "stage": "Primeira Fase", "notes": "Classificação garantida fora de casa"},
    {"id": 8, "date": "2026-02-25", "type": "MATCH", "training_type": None, "competition_format": "CUP", "competition_scope": "REGIONAL", "competition_name": "Campeonato Paulista", "opponent": "Palmeiras", "stage": "Quartas de Final", "notes": "Mata-mata do Paulistão"},

    # Março
    {"id": 9, "date": "2026-03-01", "type": "TRAINING", "training_type": "Tático", "competition_format": None, "competition_scope": None, "competition_name": None, "opponent": None, "stage": None, "notes": "Ajuste de bolas paradas defensivas"},
    {"id": 10, "date": "2026-03-02", "type": "MATCH", "training_type": None, "competition_format": "LEAGUE", "competition_scope": "CONTINENTAL", "competition_name": "Recopa Sul-Americana", "opponent": "LDU Quito", "stage": "Final (Volta)", "notes": "Disputa de título internacional"},
    {"id": 11, "date": "2026-03-10", "type": "TRAINING", "training_type": "Técnico", "competition_format": None, "competition_scope": None, "competition_name": None, "opponent": None, "stage": None, "notes": "Treino de troca de passes rápida"},
    {"id": 12, "date": "2026-03-15", "type": "MATCH", "training_type": None, "competition_format": "CUP", "competition_scope": "NATIONAL", "competition_name": "Copa do Brasil", "opponent": "Sousa-PB", "stage": "Segunda Fase", "notes": "Avançou de fase com vitória simples"},
    {"id": 13, "date": "2026-03-22", "type": "MATCH", "training_type": None, "competition_format": "FRIENDLY", "competition_scope": "NATIONAL", "competition_name": "Amistoso", "opponent": "Cruzeiro", "stage": "Preparatório", "notes": "Teste de elenco antes do Brasileirão"},

    # Abril
    {"id": 14, "date": "2026-04-05", "type": "TRAINING", "training_type": "Físico", "competition_format": None, "competition_scope": None, "competition_name": None, "opponent": None, "stage": None, "notes": "Treino intenso de aceleração e tiro curto"},
    {"id": 15, "date": "2026-04-12", "type": "MATCH", "training_type": None, "competition_format": "LEAGUE", "competition_scope": "NATIONAL", "competition_name": "Brasileirão", "opponent": "Flamengo", "stage": "Rodada 1", "notes": "Estreia no Campeonato Brasileiro"},
    {"id": 16, "date": "2026-04-19", "type": "MATCH", "training_type": None, "competition_format": "LEAGUE", "competition_scope": "NATIONAL", "competition_name": "Brasileirão", "opponent": "Palmeiras", "stage": "Rodada 2", "notes": "Confronto direto no Nabizão"},
    {"id": 17, "date": "2026-04-26", "type": "MATCH", "training_type": None, "competition_format": "LEAGUE", "competition_scope": "NATIONAL", "competition_name": "Brasileirão", "opponent": "Grêmio", "stage": "Rodada 3", "notes": "Jogo fora em Porto Alegre"},

    # Maio
    {"id": 18, "date": "2026-05-03", "type": "MATCH", "training_type": None, "competition_format": "LEAGUE", "competition_scope": "NATIONAL", "competition_name": "Brasileirão", "opponent": "Internacional", "stage": "Rodada 4", "notes": "Partida equilibrada no Nabizão"},
    {"id": 19, "date": "2026-05-10", "type": "TRAINING", "training_type": "Tático", "competition_format": None, "competition_scope": None, "competition_name": None, "opponent": None, "stage": None, "notes": "Simulação de jogo sob pressão de marcação alta"},
    {"id": 20, "date": "2026-05-13", "type": "MATCH", "training_type": None, "competition_format": "LEAGUE", "competition_scope": "NATIONAL", "competition_name": "Brasileirão", "opponent": "Atlético-MG", "stage": "Rodada 5", "notes": "Jogo na Arena MRV"},
    {"id": 21, "date": "2026-05-20", "type": "MATCH", "training_type": None, "competition_format": "CUP", "competition_scope": "NATIONAL", "competition_name": "Copa do Brasil", "opponent": "Fluminense", "stage": "Quartas de Final", "notes": "Jogo de ida das quartas"},

    # Junho / Julho
    {"id": 22, "date": "2026-06-05", "type": "MATCH", "training_type": None, "competition_format": "CUP", "competition_scope": "NATIONAL", "competition_name": "Copa do Brasil", "opponent": "Fluminense", "stage": "Semifinal", "notes": "Derrota e eliminação da competição"},
    {"id": 23, "date": "2026-06-15", "type": "TRAINING", "training_type": "Técnico", "competition_format": None, "competition_scope": None, "competition_name": None, "opponent": None, "stage": None, "notes": "Treino de finalização e cruzamentos de área"},
    {"id": 24, "date": "2026-06-28", "type": "MATCH", "training_type": None, "competition_format": "LEAGUE", "competition_scope": "NATIONAL", "competition_name": "Brasileirão", "opponent": "São Paulo", "stage": "Rodada 12", "notes": "Confronto no Morumbis"},
    {"id": 25, "date": "2026-07-14", "type": "MATCH", "training_type": None, "competition_format": "LEAGUE", "competition_scope": "CONTINENTAL", "competition_name": "Copa Sul-Americana", "opponent": "Independiente Medellín", "stage": "Playoffs", "notes": "Fase de mata-mata da Sula"},
    {"id": 26, "date": "2026-07-21", "type": "MATCH", "training_type": None, "competition_format": "LEAGUE", "competition_scope": "CONTINENTAL", "competition_name": "Copa Sul-Americana", "opponent": "Independiente Medellín", "stage": "Playoffs (Volta)", "notes": "Decisão de vaga na Colômbia"},

    # Agosto a Novembro
    {"id": 27, "date": "2026-08-10", "type": "MATCH", "training_type": None, "competition_format": "LEAGUE", "competition_scope": "NATIONAL", "competition_name": "Brasileirão", "opponent": "Vasco", "stage": "Rodada 18", "notes": "Jogo em São Januário"},
    {"id": 28, "date": "2026-09-02", "type": "TRAINING", "training_type": "Físico", "competition_format": None, "competition_scope": None, "competition_name": None, "opponent": None, "stage": None, "notes": "Trabalho de força e academia"},
    {"id": 29, "date": "2026-10-15", "type": "TRAINING", "training_type": "Físico", "competition_format": None, "competition_scope": None, "competition_name": None, "opponent": None, "stage": None, "notes": "Recondicionamento pós-Data FIFA"},
    {"id": 30, "date": "2026-10-25", "type": "TRAINING", "training_type": "Tático", "competition_format": None, "competition_scope": None, "competition_name": None, "opponent": None, "stage": None, "notes": "Treinamento focado em transição defensiva"},
    {"id": 31, "date": "2026-11-02", "type": "MATCH", "training_type": None, "competition_format": "LEAGUE", "competition_scope": "NATIONAL", "competition_name": "Brasileirão", "opponent": "Botafogo", "stage": "Rodada 31", "notes": "Reta final do campeonato"},
    {"id": 32, "date": "2026-11-08", "type": "MATCH", "training_type": None, "competition_format": "LEAGUE", "competition_scope": "NATIONAL", "competition_name": "Brasileirão", "opponent": "Corinthians", "stage": "Rodada 32", "notes": "Clássico no Brasileirão"}
]

for e in events_data:
    db.add(models.Event(**e))

# =========================================================================
# 3. HISTÓRICO DE LESÕES (VINCULADO AOS ATLETAS E JOGOS)
# =========================================================================
injuries_data = [
    {"id": 1, "player_id": 5, "injury_type": "Muscular", "body_part": "Coxa", "body_side": "Direito", "injury_date": "2026-05-10", "match_event_id": 21, "expected_return_training": "2026-06-01", "expected_return_play": "2026-06-10", "discharge_date": None, "notes": "Lesão sofrida durante a Copa do Brasil contra o Fluminense."},
    {"id": 2, "player_id": 6, "injury_type": "Entorse", "body_part": "Tornozelo", "body_side": "Direito", "injury_date": "2026-04-12", "match_event_id": 15, "expected_return_training": "2026-05-02", "expected_return_play": "2026-05-15", "discharge_date": None, "notes": "Entorse após disputa de bola contra o Flamengo."},
    {"id": 3, "player_id": 19, "injury_type": "Tendinite", "body_part": "Joelho", "body_side": "Esquerdo", "injury_date": "2026-03-02", "match_event_id": 10, "expected_return_training": "2026-03-20", "expected_return_play": "2026-04-01", "discharge_date": None, "notes": "Sentiu dores intensas na final da Recopa."},
    {"id": 4, "player_id": 4, "injury_type": "Fratura", "body_part": "Mão", "body_side": "Esquerdo", "injury_date": "2026-04-05", "match_event_id": 14, "expected_return_training": "2026-05-20", "expected_return_play": "2026-06-01", "discharge_date": None, "notes": "Fratura em treino de impacto."},
    {"id": 5, "player_id": 26, "injury_type": "Contusão", "body_part": "Ombro", "body_side": "Esquerdo", "injury_date": "2026-02-18", "match_event_id": 7, "expected_return_training": "2026-02-25", "expected_return_play": "2026-03-01", "discharge_date": "2026-03-02", "notes": "Contusão leve. Atleta liberado pelo DM."},
    {"id": 6, "player_id": 23, "injury_type": "Muscular", "body_part": "Panturrilha", "body_side": "Direito", "injury_date": "2026-02-10", "match_event_id": 5, "expected_return_training": "2026-02-20", "expected_return_play": "2026-02-27", "discharge_date": "2026-02-28", "notes": "Estiramento leve no Paulistão."},
    {"id": 7, "player_id": 10, "injury_type": "Laceração", "body_part": "Supercílio", "body_side": "Direito", "injury_date": "2026-07-14", "match_event_id": 25, "expected_return_training": "2026-07-16", "expected_return_play": "2026-07-18", "discharge_date": "2026-07-19", "notes": "Corte no supercílio resolvido com sutura no vestiário."}
]

for i in injuries_data:
    db.add(models.Injury(**i))

db.commit()
db.close()

print("✅ Banco de dados re-populado com sucesso!")
print("📊 Carga concluída: 28 Jogadores | 32 Eventos de Calendário | 7 Históricos Médicos.")