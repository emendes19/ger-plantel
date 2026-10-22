# Plantel Manager

Plataforma fullstack para a gestão profissional de elencos e da rotina de clubes de futebol. O sistema reúne em um só lugar o controle de atletas, a prancheta tática, o calendário de jogos e treinos e o departamento médico, substituindo métricas genéricas por dados operacionais e estratégicos para apoiar a tomada de decisão.

- **Front-end:** React, Vite e Tailwind CSS v4
- **Back-end:** FastAPI, SQLAlchemy e Pydantic
- **Banco de dados:** MySQL

## Sumário

1. [Sobre o projeto](#sobre-o-projeto)
2. [Funcionalidades](#funcionalidades)
3. [Tecnologias](#tecnologias)
4. [Aspectos técnicos](#aspectos-técnicos)
5. [Programas necessários](#programas-necessários)
6. [Instalação passo a passo](#instalação-passo-a-passo)
7. [Executando o projeto](#executando-o-projeto)
8. [Atualizando um banco já existente](#atualizando-um-banco-já-existente)
9. [Solução de problemas](#solução-de-problemas)
10. [Limitações conhecidas](#limitações-conhecidas)

---

## Sobre o projeto

O Plantel Manager foi pensado para comissões técnicas e departamentos de futebol que precisam acompanhar, no dia a dia, quem está disponível, quem está lesionado ou suspenso, como a equipe vai jogar e o que está marcado na agenda.

Todas as informações ficam salvas em um banco MySQL e são servidas por uma API REST. O front-end consome essa API e as quatro áreas do sistema (Elenco, Prancheta, Calendário e Departamento Médico) compartilham os mesmos dados. Por exemplo, ao registrar uma lesão, o status do atleta muda para Lesionado e ele deixa de aparecer entre os disponíveis na prancheta.

## Funcionalidades

### Elenco

- Cadastro, edição, exclusão e consulta de atletas (CRUD completo).
- Posição detalhada: goleiro, zagueiro, lateral direito e esquerdo, volante, meias (central, direita, esquerda e atacante), pontas, segundo atacante e centroavante.
- **Número da camisa único** no elenco (de 1 a 99), validado no formulário, na API e no banco de dados.
- Nacionalidade, pé dominante, idade e fim de contrato (com o tempo restante calculado).
- Janela de detalhes com visualização e edição de todos os dados, inclusive a camisa.
- Gestão de suspensões: motivo e quantidade de jogos, com botão para encerrar a suspensão.
- Busca por nome, posição, nacionalidade ou número.
- Filtros por status, setor, posição, nacionalidade, pé dominante e faixa de idade.
- Ordenação por camisa, nome, idade, posição, nacionalidade, fim de contrato ou status, em ordem crescente ou decrescente.
- Apresentação em lista, com aviso visual de números de camisa repetidos.

### Prancheta tática

- Campo vertical interativo com os 11 titulares.
- Oito formações: 4-3-3, 4-4-2, 4-2-3-1, 4-5-1, 3-5-2, 3-4-3, 5-3-2 e 5-4-1.
- Três modos: **padrão**, **ataque** e **defesa**, cada um com a sua formação. Os mesmos 11 titulares são mantidos nos três modos e apenas reposicionados no campo, cada um indo para o ponto mais próximo de onde estava.
- Escalação livre: qualquer atleta disponível pode jogar em qualquer posição, com troca direta entre vagas do campo.
- Funções da equipe: capitão e vice-capitão, cobrador de falta direta e lateral, 1º e 2º cobrador de pênalti e cobrador de escanteio pela direita e pela esquerda.
- Lista de atletas disponíveis com as mesmas opções de ordenação do Elenco.

### Calendário

- Visão mensal com navegação entre os meses.
- Cada dia pode ser marcado como **Treino**, **Descanso** ou **Jogo**.
- **Treino:** com o tipo (físico, técnico, tático, bola parada, finalização, coletivo, academia ou recuperação).
- **Jogo:** adversário, tipo de competição (liga, copa ou amistoso), abrangência (estadual, nacional ou continental), nome da competição, rodada (liga) ou fase (copa) e observações.

### Departamento médico

- Registro de lesões com tipo, local do corpo, lado, data, jogo em que ocorreu (escolhido entre os jogos do calendário), previsão de retorno aos treinos e previsão de liberação para jogar.
- Fase de cada lesão calculada pelas datas: em tratamento, liberado para treinar ou apto a jogar.
- **Alta médica** com data, devolvendo o atleta ao status Disponível.
- **Histórico de lesões** com o registro de lesões anteriores e filtros por período, atleta, tipo de lesão e local, além de resumo com total e média de dias afastados.
- As suspensões ficam fora desta aba e são gerenciadas no Elenco.

## Tecnologias

| Camada | Tecnologia | Uso |
|---|---|---|
| Front-end | React | Interface em componentes |
| Front-end | Vite | Servidor de desenvolvimento e build |
| Front-end | Tailwind CSS v4 | Estilização |
| Front-end | lucide-react | Ícones |
| Back-end | Python | Linguagem do servidor |
| Back-end | FastAPI | API REST e documentação automática |
| Back-end | Uvicorn | Servidor ASGI |
| Back-end | SQLAlchemy | ORM e acesso ao banco |
| Back-end | Pydantic | Validação dos dados de entrada e saída |
| Banco de dados | MySQL | Armazenamento persistente |

## Aspectos técnicos

### Arquitetura

```
Navegador (React + Vite, porta 5173)
        │  HTTP / JSON
        ▼
API FastAPI (porta 8000)
        │  SQLAlchemy
        ▼
MySQL
```

### Estrutura de pastas

```
ger-plantel/
├── backend/
│   ├── database.py        # conexão com o MySQL, sessão e Base do SQLAlchemy
│   ├── main.py            # rotas da API e regras de negócio
│   ├── models.py          # tabelas (players, events, injuries)
│   ├── schemas.py         # validação dos dados (Pydantic)
│   └── seed.py            # dados iniciais de exemplo
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── tabs/
    │   │   │   ├── SquadTab.jsx        # Elenco
    │   │   │   ├── TacticsTab.jsx      # Prancheta tática
    │   │   │   ├── ScheduleTab.jsx     # Calendário
    │   │   │   └── MedicalTab.jsx      # Departamento médico
    │   │   ├── ModalNewPlayer.jsx
    │   │   ├── ModalPlayerDetails.jsx
    │   │   ├── ModalEvent.jsx
    │   │   ├── ModalInjury.jsx
    │   │   ├── InjuryHistory.jsx
    │   │   └── Sidebar.jsx
    │   ├── constants/
    │   │   ├── positions.js        # posições e setores
    │   │   ├── nationalities.js    # sugestões de nacionalidade
    │   │   ├── tactics.js          # formações, modos e funções da equipe
    │   │   ├── schedule.js         # tipos de dia, treinos e competições
    │   │   └── medical.js          # tipos e locais de lesão
    │   ├── services/
    │   │   └── api.js              # chamadas à API
    │   ├── utils/
    │   │   └── playerSort.js       # ordenação compartilhada de atletas
    │   ├── App.jsx
    │   └── main.jsx
    ├── package.json
    ├── vite.config.js
    └── tailwind.config.js
```

### Modelo de dados

As tabelas são criadas automaticamente na primeira execução do back-end.

**players**

| Coluna | Descrição |
|---|---|
| `id` | Identificador |
| `name` | Nome completo |
| `number` | Número da camisa (único) |
| `position` | Posição |
| `status` | `AVAILABLE`, `INJURED` ou `SUSPENDED` |
| `age` | Idade |
| `injury` | Resumo da lesão ativa, calculado pelo servidor |
| `foot` | Pé dominante |
| `contract_end` | Fim do contrato (`MM/AAAA`) |
| `nationality` | Nacionalidade |
| `suspension_reason`, `suspension_games` | Motivo e quantidade de jogos da suspensão |

**events** (calendário)

| Coluna | Descrição |
|---|---|
| `date` | Data (única: um evento por dia) |
| `type` | `TRAINING`, `REST` ou `MATCH` |
| `training_type` | Tipo de treino |
| `competition_format` | `LEAGUE`, `CUP` ou `FRIENDLY` |
| `competition_scope` | `STATE`, `NATIONAL` ou `CONTINENTAL` |
| `competition_name`, `opponent`, `stage`, `notes` | Competição, adversário, rodada ou fase e observações |

**injuries**

| Coluna | Descrição |
|---|---|
| `player_id` | Atleta (apagado junto com ele) |
| `injury_type`, `body_part`, `body_side` | Tipo, local e lado |
| `injury_date` | Data da lesão |
| `match_event_id` | Jogo em que ocorreu (opcional) |
| `expected_return_training`, `expected_return_play` | Previsões de retorno |
| `discharge_date` | Data da alta (vazia enquanto a lesão está ativa) |
| `notes` | Observações |

### Regras de negócio aplicadas no servidor

- Número de camisa único (de 1 a 99), com erro `409` e mensagem indicando quem já usa o número. O banco também tem uma restrição única como segunda trava.
- Um único evento por dia no calendário.
- Treino exige o tipo de treino. Jogo exige adversário e tipo de competição. Em liga e copa, também exige abrangência e rodada (liga, numérica) ou fase (copa). Amistoso dispensa abrangência e fase.
- Registrar uma lesão em andamento muda o atleta para Lesionado, e dar alta o devolve para Disponível.
- Registrar uma lesão anterior (já com alta) entra só no histórico e não altera o status atual do atleta.
- Marcar o atleta como Disponível pelo Elenco encerra as lesões abertas dele.
- Uma lesão encerrada não é reaberta por edição.
- As datas de uma lesão precisam ser coerentes (a alta não pode ser anterior à lesão, nem datas futuras).

### API

A documentação interativa (Swagger) fica em `http://localhost:8000/docs`.

| Método | Rota | Descrição |
|---|---|---|
| GET | `/players` | Lista os atletas |
| POST | `/players` | Cadastra um atleta |
| PUT | `/players/{id}` | Atualiza um atleta |
| DELETE | `/players/{id}` | Remove um atleta |
| GET | `/events?start=AAAA-MM-DD&end=AAAA-MM-DD` | Lista os eventos do período |
| POST | `/events` | Cria um evento |
| PUT | `/events/{id}` | Atualiza um evento |
| DELETE | `/events/{id}` | Remove um evento |
| GET | `/injuries?player_id=&active=` | Lista as lesões (filtros opcionais) |
| POST | `/injuries` | Registra uma lesão |
| PUT | `/injuries/{id}` | Atualiza uma lesão |
| POST | `/injuries/{id}/discharge` | Dá alta em uma lesão |
| DELETE | `/injuries/{id}` | Remove um registro de lesão |

Os erros de regra de negócio voltam com o campo `detail` em texto (por exemplo, `409` para camisa repetida ou dia já ocupado, `422` para dados inválidos), e o front-end exibe essa mensagem dentro do formulário.

### Decisões de projeto

- **Estado da prancheta no `App`:** a escalação, as formações e as funções ficam em `App.jsx` e sobrevivem à troca de aba. A escalação é única e vale para os três modos táticos.
- **Reposicionamento por menor distância:** ao trocar de modo ou de formação, os atletas são associados às novas vagas pelo menor deslocamento total no campo (assim, o lateral direito continua pela direita).
- **Constantes separadas:** listas de posições, formações, tipos de treino, competições e lesões ficam em `src/constants/`, e acrescentar uma opção é incluir uma linha.
- **Ordenação compartilhada:** o Elenco e a Prancheta usam a mesma função de ordenação (`src/utils/playerSort.js`).

## Programas necessários

| Programa | Versão recomendada | Para que serve | Download |
|---|---|---|---|
| Git | Qualquer versão recente | Baixar o projeto | https://git-scm.com/downloads |
| Python | 3.10 ou superior | Executar o back-end | https://www.python.org/downloads/ |
| Node.js (com npm) | 20 LTS ou superior | Executar o front-end | https://nodejs.org/ |
| MySQL Server | 8.0 ou superior | Banco de dados | https://dev.mysql.com/downloads/mysql/ |
| MySQL Workbench (opcional) | Última versão | Interface gráfica para o banco | https://dev.mysql.com/downloads/workbench/ |
| Visual Studio Code (opcional) | Última versão | Editor de código | https://code.visualstudio.com/ |

Ao instalar o Python no Windows, marque a opção **Add Python to PATH**. Ao instalar o MySQL, anote a senha do usuário `root`.

Para conferir se tudo foi instalado, rode no terminal:

```bash
git --version
python --version
node --version
npm --version
mysql --version
```

## Instalação passo a passo

### 1. Baixar o projeto

Com o Git:

```bash
git clone <URL-DO-REPOSITORIO>
cd ger-plantel
```

Ou baixe o projeto em `.zip` pelo botão **Code → Download ZIP** do repositório, extraia e abra a pasta `ger-plantel` no terminal.

### 2. Criar o banco de dados

Abra o MySQL Workbench (ou o terminal do MySQL) e crie o banco:

```sql
CREATE DATABASE plantel CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Você precisa apenas criar o banco vazio: as tabelas são criadas sozinhas quando o back-end inicia.

### 3. Configurar e instalar o back-end

Entre na pasta do back-end e crie um ambiente virtual:

```bash
cd backend
python -m venv venv
```

Ative o ambiente virtual:

```bash
# Windows (CMD ou PowerShell)
venv\Scripts\activate

# Linux ou macOS
source venv/bin/activate
```

Instale as dependências:

```bash
pip install fastapi "uvicorn[standard]" sqlalchemy pymysql cryptography
```

| Pacote | Função |
|---|---|
| `fastapi` | Framework da API (já inclui o Pydantic) |
| `uvicorn` | Servidor que executa a API |
| `sqlalchemy` | ORM |
| `pymysql` | Driver de conexão com o MySQL |
| `cryptography` | Necessário para o login do MySQL 8 |

Para facilitar a instalação por outras pessoas, você pode gerar o arquivo de dependências e, depois, usar `pip install -r requirements.txt`:

```bash
pip freeze > requirements.txt
```

### 4. Configurar a conexão com o banco

Abra `backend/database.py` e ajuste usuário, senha, endereço e nome do banco. A URL de conexão tem este formato:

```python
DATABASE_URL = "mysql+pymysql://USUARIO:SENHA@localhost:3306/plantel"
```

Se a senha tiver caracteres especiais (como `@`, `#` ou `/`), eles precisam estar codificados na URL (por exemplo, `@` vira `%40`).

O arquivo `database.py` precisa expor `engine`, `Base` e `get_db`, que são importados por `main.py` e `models.py`.

### 5. (Opcional) Popular com dados de exemplo

Com o ambiente virtual ativo e dentro da pasta `backend`:

```bash
python seed.py
```

### 6. Instalar o front-end

Em outro terminal, a partir da raiz do projeto:

```bash
cd frontend
npm install
```

O `npm install` baixa tudo o que está listado no `package.json` (React, Vite, Tailwind CSS, lucide-react e demais dependências). Se alguma biblioteca de ícones ficar faltando, instale com `npm install lucide-react`.

## Executando o projeto

São necessários **dois terminais abertos ao mesmo tempo**, um para o back-end e outro para o front-end. O MySQL também precisa estar rodando.

**Terminal 1: back-end**

```bash
cd backend
venv\Scripts\activate        # Windows (no Linux/macOS: source venv/bin/activate)
uvicorn main:app --reload
```

**Terminal 2: front-end**

```bash
cd frontend
npm run dev
```

Depois, acesse:

| Endereço | O que é |
|---|---|
| http://localhost:5173 | Aplicação (front-end) |
| http://localhost:8000 | API |
| http://localhost:8000/docs | Documentação interativa da API |

Para interromper qualquer um dos dois, use `Ctrl + C` no terminal correspondente.

### Outros comandos do front-end

```bash
npm run build      # gera a versão de produção em frontend/dist
npm run preview    # serve a versão de produção localmente
npm run lint       # verifica o código com o ESLint
```

## Atualizando um banco já existente

O back-end só cria tabelas que ainda não existem e **não altera tabelas antigas**. Se você já tinha o banco de uma versão anterior do projeto, rode estes comandos no MySQL para acrescentar as colunas novas:

```sql
ALTER TABLE players ADD COLUMN nationality VARCHAR(50) NULL;
ALTER TABLE players ADD COLUMN suspension_reason VARCHAR(100) NULL;
ALTER TABLE players ADD COLUMN suspension_games INT NULL;
```

Para ativar a regra de camisa única no banco, primeiro confira se existem números repetidos:

```sql
SELECT number, COUNT(*) AS qtd, GROUP_CONCAT(name SEPARATOR ', ') AS atletas
FROM players
GROUP BY number
HAVING COUNT(*) > 1;
```

Se a consulta não retornar nada, crie a restrição:

```sql
ALTER TABLE players ADD CONSTRAINT uq_players_number UNIQUE (number);
```

Se retornar linhas, corrija os números repetidos antes (pela tela do Elenco ou com `UPDATE`).

As tabelas `events` e `injuries` são novas e criadas automaticamente. Em um banco totalmente novo, nada disso é necessário.

## Solução de problemas

| Problema | Causa provável e solução |
|---|---|
| Tela "Erro de Conexão" ao abrir o front-end | O back-end não está rodando. Inicie o `uvicorn` e confira se o MySQL está ativo. |
| Erro de CORS no navegador | O front-end está em uma porta diferente de `5173`. Ajuste `allow_origins` em `backend/main.py`. |
| `Access denied for user` | Usuário ou senha errados em `database.py`. |
| `Unknown database 'plantel'` | O banco ainda não foi criado. Rode o `CREATE DATABASE` do passo 2. |
| `cryptography package is required` | Rode `pip install cryptography` com o ambiente virtual ativo. |
| `ModuleNotFoundError` | O ambiente virtual não está ativo ou falta instalar um pacote. Ative o `venv` e rode o `pip install` do passo 3. |
| `Unknown column ... in 'field list'` | O banco é de uma versão antiga. Aplique os comandos da seção [Atualizando um banco já existente](#atualizando-um-banco-já-existente). |
| `Duplicate entry ... for key 'uq_players_number'` ao rodar o `seed.py` | Os dados de exemplo têm camisas repetidas, o que a regra de camisa única não permite. Ajuste os números no `seed.py`. |
| `venv\Scripts\activate` bloqueado no PowerShell | Rode `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` e tente de novo (ou use o CMD). |
| `Address already in use` | A porta `8000` ou `5173` já está ocupada. Feche o outro processo ou use outra porta (`uvicorn main:app --reload --port 8001`, lembrando de ajustar `API_URL` em `frontend/src/services/api.js`). |
| Lista de lesões ou calendário não carrega | Reinicie o `uvicorn` para o servidor criar as tabelas novas. |

## Limitações conhecidas

- A escalação, as formações táticas e as funções da equipe ficam apenas na memória do navegador e voltam ao padrão quando a página é recarregada.
- O sistema trabalha com um único elenco e não possui autenticação de usuários.
- O calendário aceita um evento por dia.
- A escalação da prancheta não é removida automaticamente quando um titular se lesiona, e a troca é feita manualmente.