⚽ Plantel Manager

O Plantel Manager é uma plataforma fullstack de gestão profissional de elenco e operações para clubes de futebol. O sistema é focado no gerenciamento clínico, contratual e tático de atletas com dados reais de performance e departamento médico.

📌 Funcionalidades Principais

Gestão do Elenco: Lista de atletas com busca rápida, filtros e métricas (KPIs).

Prancheta Tática: Montagem de formações (4-3-3, 4-4-2, 3-5-2) apenas com atletas liberados pelo DM.

Calendário: Agenda unificada de partidas e sessões de treino.

Departamento Médico: Controle de lesionados e suspensos com acompanhamento de alta.

Operações CRUD: Cadastro e remoção de atletas em tempo real via MySQL.

🛠️ Tecnologias

Front-end: React, Vite, Tailwind CSS v4, Lucide React

Back-end: Python 3.13, FastAPI, SQLAlchemy, PyMySQL, Pydantic

Banco de Dados: MySQL (XAMPP / phpMyAdmin)

📂 Estrutura do Projeto

ger-plantel/
├── backend/       # API FastAPI, modelos SQLAlchemy e script de seed
└── frontend/      # Aplicação React + Vite


🚀 Como Executar o Projeto

Pré-requisitos

Node.js (v18+), Python (v3.10+), MySQL ativo (ex: via XAMPP).

1. Banco de Dados

Crie a base no MySQL:

CREATE DATABASE ger_plantel CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


2. Back-end

cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1   # No Windows
pip install fastapi uvicorn sqlalchemy pymysql pydantic
python seed.py                # Popula o banco inicial
uvicorn main:app --reload


API: http://localhost:8000 | Docs (Swagger): http://localhost:8000/docs

3. Front-end

cd frontend
npm install
npm install lucide-react
npm run dev


Aplicação Web: http://localhost:5173

📝 Licença

Projeto desenvolvido para fins de gestão esportiva e aprendizado fullstack.