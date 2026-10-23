# Plantel Manager

Plataforma fullstack para a gestão profissional de elencos e da rotina de clubes de futebol. O sistema reúne em um só lugar o controle de atletas, a prancheta tática, o calendário de jogos e treinos e o departamento médico, trocando métricas genéricas por dados operacionais e estratégicos para apoiar a tomada de decisão da comissão técnica.

- **Front-end:** React, Vite e Tailwind CSS v4
- **Back-end:** Python, FastAPI, SQLAlchemy e Pydantic
- **Banco de dados:** MySQL (ou MariaDB, como o que acompanha o XAMPP)

## Sumário

1. [Sobre o projeto](#sobre-o-projeto)
2. [Funcionalidades](#funcionalidades)
3. [Tecnologias](#tecnologias)
4. [Arquitetura e estrutura de pastas](#arquitetura-e-estrutura-de-pastas)
5. [Modelo de dados](#modelo-de-dados)
6. [API](#api)
7. [Regras de negócio](#regras-de-negócio)
8. [Programas necessários](#programas-necessários)
9. [Baixando o projeto](#baixando-o-projeto)
10. [Instalação passo a passo](#instalação-passo-a-passo)
11. [Verificando se tudo funcionou](#verificando-se-tudo-funcionou)
12. [Rotina do dia a dia](#rotina-do-dia-a-dia)
13. [Primeiros passos no sistema](#primeiros-passos-no-sistema)
14. [Configurações importantes](#configurações-importantes)
15. [Atualizando um banco já existente](#atualizando-um-banco-já-existente)
16. [Solução de problemas](#solução-de-problemas)
17. [Limitações conhecidas](#limitações-conhecidas)

---

## Sobre o projeto

O Plantel Manager foi pensado para comissões técnicas e departamentos de futebol que precisam acompanhar, no dia a dia, quem está disponível, quem está lesionado ou suspenso, como a equipe vai jogar e o que está marcado na agenda.

Todas as informações ficam salvas em um banco de dados e são servidas por uma API REST. O front-end consome essa API, e as quatro áreas do sistema (Elenco, Prancheta, Calendário e Departamento Médico) compartilham os mesmos dados. Por exemplo, ao registrar uma lesão, o status do atleta muda para Lesionado e ele deixa de aparecer entre os disponíveis na prancheta; ao dar alta, ele volta a ficar disponível.

## Funcionalidades

### Elenco

- Cadastro, edição, exclusão e consulta de atletas (CRUD completo).
- Posição detalhada: goleiro, zagueiro, lateral direito e esquerdo, volante, meias (central, direita, esquerda e atacante), pontas, segundo atacante e centroavante.
- **Número da camisa único** no elenco (de 1 a 99), validado no formulário, na API e no banco de dados.
- Nacionalidade, pé dominante, idade e fim de contrato (com o tempo restante calculado).
- Janela de **detalhes** com visualização e edição de todos os dados, inclusive a camisa.
- **Gestão de suspensões:** motivo e quantidade de jogos, com botão para encerrar a suspensão.
- Busca por nome, posição, nacionalidade ou número.
- Filtros por status, setor, posição, nacionalidade, pé dominante e faixa de idade.
- Ordenação por camisa, nome, idade, posição, nacionalidade, fim de contrato ou status, em ordem crescente ou decrescente.
- Apresentação em lista, com aviso visual de números de camisa repetidos.

### Prancheta tática

- Campo vertical interativo com os 11 titulares.
- **Oito formações:** 4-3-3, 4-4-2, 4-2-3-1, 4-5-1, 3-5-2, 3-4-3, 5-3-2 e 5-4-1.
- **Três modos:** padrão, ataque e defesa, cada um com a sua formação. Os mesmos 11 titulares são mantidos nos três modos e apenas reposicionados no campo, cada um indo para o ponto mais próximo de onde estava.
- **Escalação livre:** qualquer atleta disponível pode jogar em qualquer posição, com troca direta entre vagas do campo ou com a lista de atletas.
- **Funções da equipe:** capitão e vice-capitão, cobrador de falta direta e lateral, 1º e 2º cobrador de pênalti e cobrador de escanteio pela direita e pela esquerda.
- **Funções táticas por posição:** o sistema identifica o tipo de cada vaga (lateral, ala, volante, meia, ponta, atacante...) e oferece as funções principais daquela posição.
- **Posição pela função e setas de movimento:** o cartão do atleta se desloca no campo conforme a função (o falso 9 recua, o lateral ofensivo avança, o ponta invertido vai para dentro) e uma seta indica para onde ele deve se mover. Os dois recursos podem ser ligados e desligados.
- Lista de atletas disponíveis com as mesmas opções de ordenação do Elenco.

Funções táticas disponíveis:

| Posição | Funções |
|---|---|
| Goleiro | Goleiro tradicional, Goleiro-líbero |
| Zagueiro | Zagueiro de marcação, Zagueiro de cobertura, Zagueiro construtor, Líbero |
| Lateral | Lateral defensivo, Lateral apoiador, Lateral ofensivo, Lateral invertido |
| Ala | Ala defensivo, Ala apoiador, Ala ofensivo |
| Volante | Volante âncora, Volante de desarme, Regista, Volante box-to-box |
| Meia | Meia box-to-box, Meia armador, Meia de equilíbrio, Meia infiltrador, Meia de marcação |
| Meia atacante | Armador (camisa 10), Meia infiltrado (sombra), Meia atacante equilibrado, Trequartista (meia livre) |
| Meia aberto | Meia aberto, Meia aberto ofensivo, Meia aberto defensivo, Meia interior |
| Ponta | Ponta de lado (extremo), Ponta invertido, Ponta infiltrado, Ponta de recomposição |
| Atacante | Centroavante pivô, Falso 9, Atacante de área, Atacante móvel, Segundo atacante |

### Calendário

- Visão mensal com navegação entre os meses e botão **Hoje**.
- Cada dia pode ser marcado como **Treino**, **Descanso** ou **Jogo**, com cores diferentes.
- **Treino:** com o tipo de treino (físico, técnico, tático, bola parada, finalização, coletivo, campo reduzido, academia ou recuperação).
- **Jogo:** adversário, tipo de competição (liga, copa ou amistoso), abrangência (estadual, nacional ou continental), nome da competição, rodada (liga) ou fase (copa) e observações.

### Departamento médico

- Registro de lesões com tipo, local do corpo, lado, data, **jogo em que ocorreu** (escolhido entre os jogos do calendário), previsão de retorno aos treinos e previsão de liberação para jogar.
- Fase de cada lesão calculada pelas datas: em tratamento, liberado para treinar ou apto a jogar.
- **Alta médica** com data, devolvendo o atleta ao status Disponível.
- **Histórico de lesões** com todas as lesões do elenco, a opção de **registrar lesões anteriores**, edição dos registros e filtros por período, atleta, tipo de lesão e local do corpo. Mostra também o total e a média de dias afastados.
- Atletas marcados como lesionados no Elenco, mas sem registro detalhado, aparecem em uma lista própria para completar o cadastro.
- As suspensões ficam fora desta aba e são gerenciadas no Elenco.

## Tecnologias

| Camada | Tecnologia | Uso |
|---|---|---|
| Front-end | React | Interface em componentes |
| Front-end | Vite | Servidor de desenvolvimento e build |
| Front-end | Tailwind CSS v4 | Estilização |
| Front-end | lucide-react | Ícones |
| Back-end | Python | Linguagem do servidor |
| Back-end | FastAPI | API REST e documentação automática (Swagger) |
| Back-end | Uvicorn | Servidor ASGI que executa a API |
| Back-end | SQLAlchemy | ORM e acesso ao banco |
| Back-end | Pydantic | Validação dos dados de entrada e saída |
| Back-end | PyMySQL | Driver de conexão com o MySQL |
| Banco de dados | MySQL / MariaDB | Armazenamento persistente |

## Arquitetura e estrutura de pastas

```
Navegador (React + Vite, porta 5173)
        |  HTTP / JSON
        v
API FastAPI (porta 8000)
        |  SQLAlchemy
        v
MySQL / MariaDB (porta 3306)
```

```
ger-plantel/
├── README.md
├── backend/
│   ├── database.py        # conexão com o banco, sessão e Base do SQLAlchemy
│   ├── main.py            # rotas da API e regras de negócio
│   ├── models.py          # tabelas (players, events, injuries)
│   ├── schemas.py         # validação dos dados (Pydantic)
│   ├── seed.py            # dados iniciais de exemplo
│   └── venv/              # ambiente virtual (criado por você, não vai para o Git)
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── tabs/
    │   │   │   ├── SquadTab.jsx        # Elenco
    │   │   │   ├── TacticsTab.jsx      # Prancheta tática
    │   │   │   ├── ScheduleTab.jsx     # Calendário
    │   │   │   └── MedicalTab.jsx      # Departamento médico
    │   │   ├── InjuryHistory.jsx       # Histórico de lesões com filtros
    │   │   ├── ModalEvent.jsx          # Formulário de eventos do calendário
    │   │   ├── ModalInjury.jsx         # Formulário de lesões
    │   │   ├── ModalNewPlayer.jsx      # Cadastro de atleta
    │   │   ├── ModalPlayerDetails.jsx  # Detalhes e edição do atleta
    │   │   └── Sidebar.jsx
    │   ├── constants/
    │   │   ├── medical.js          # tipos e locais de lesão, datas
    │   │   ├── nationalities.js    # sugestões de nacionalidade
    │   │   ├── positions.js        # posições e setores
    │   │   ├── schedule.js         # tipos de dia, treinos e competições
    │   │   └── tactics.js          # formações, modos, funções e movimentos
    │   ├── services/
    │   │   └── api.js              # chamadas à API
    │   ├── utils/
    │   │   └── playerSort.js       # ordenação compartilhada de atletas
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.js
```

Decisões de projeto:

- **Estado da prancheta no `App`:** a escalação, as formações e as funções ficam em `App.jsx` e sobrevivem à troca de aba. A escalação é única e vale para os três modos táticos.
- **Reposicionamento por menor distância:** ao trocar de modo ou de formação, os atletas são associados às novas vagas pelo menor deslocamento total no campo (assim, o lateral direito continua pela direita).
- **Constantes separadas:** listas de posições, formações, funções, tipos de treino, competições e lesões ficam em `src/constants/`, e acrescentar uma opção é incluir uma linha.
- **Regras no servidor:** as validações importantes ficam na API, e o front-end apenas exibe as mensagens de erro devolvidas por ela.

## Modelo de dados

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
| `player_id` | Atleta (as lesões são apagadas junto com ele) |
| `injury_type`, `body_part`, `body_side` | Tipo, local e lado |
| `injury_date` | Data da lesão |
| `match_event_id` | Jogo em que ocorreu (opcional) |
| `expected_return_training`, `expected_return_play` | Previsões de retorno |
| `discharge_date` | Data da alta (vazia enquanto a lesão está ativa) |
| `notes` | Observações |

## API

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

## Regras de negócio

- Número de camisa único (de 1 a 99), com erro `409` e mensagem indicando quem já usa o número. O banco também tem uma restrição única como segunda trava.
- Um único evento por dia no calendário.
- Treino exige o tipo de treino. Jogo exige adversário e tipo de competição. Em liga e copa, também exige abrangência e rodada (liga, numérica) ou fase (copa). Amistoso dispensa abrangência e fase.
- Registrar uma lesão em andamento muda o atleta para Lesionado, e dar alta o devolve para Disponível.
- Registrar uma lesão anterior (já com alta) entra só no histórico e não altera o status atual do atleta.
- Marcar o atleta como Disponível pelo Elenco encerra as lesões abertas dele.
- Uma lesão encerrada não é reaberta por edição.
- As datas de uma lesão precisam ser coerentes: a alta não pode ser anterior à lesão, e não são aceitas datas futuras para a lesão e a alta.

## Programas necessários

| Programa | Versão recomendada | Para que serve | Download |
|---|---|---|---|
| Git | Qualquer versão recente | Baixar e atualizar o projeto | https://git-scm.com/downloads |
| Python | 3.10 ou superior | Executar o back-end | https://www.python.org/downloads/ |
| Node.js (com npm) | 20 LTS ou superior | Executar o front-end | https://nodejs.org/ |
| XAMPP | Qualquer versão recente | Traz o MySQL/MariaDB e o phpMyAdmin | https://www.apachefriends.org/ |
| Visual Studio Code (opcional) | Última versão | Editor e terminal integrado | https://code.visualstudio.com/ |

O XAMPP é a forma mais simples de ter o banco de dados e o **phpMyAdmin** (interface gráfica para criar o banco). Se você já tem o MySQL Server instalado (https://dev.mysql.com/downloads/mysql/), pode usá-lo no lugar do XAMPP.

### Como instalar (Windows)

1. **Git:** execute o instalador e avance mantendo as opções padrão.
2. **Python:** execute o instalador e **marque a opção "Add python.exe to PATH"** na primeira tela, antes de clicar em "Install Now".
3. **Node.js:** baixe a versão **LTS** e avance com as opções padrão (o npm vem junto).
4. **XAMPP:** execute o instalador e mantenha marcados pelo menos **MySQL** e **phpMyAdmin** (o Apache também é necessário, pois o phpMyAdmin roda sobre ele).
5. **Visual Studio Code (opcional):** execute o instalador padrão.

Depois de instalar, **feche e abra novamente o terminal** para que os programas sejam reconhecidos.

Em **Linux** e **macOS**, instale os mesmos programas pelo gerenciador de pacotes (`apt`, `brew`...). Para o Node.js, o `nvm` costuma ser o caminho mais fácil para obter uma versão recente.

### Conferindo as instalações

Abra um terminal (PowerShell, CMD ou o terminal do VS Code) e rode:

```bash
git --version
python --version
node --version
npm --version
```

Cada comando deve mostrar uma versão. Se algum disser que o programa "não é reconhecido", reinstale-o ou reabra o terminal.

## Baixando o projeto

Escolha uma das opções.

### Opção 1: com o Git (recomendada)

Abra o terminal na pasta onde quer guardar o projeto (por exemplo, `Documentos`) e rode:

```bash
git clone <URL-DO-REPOSITORIO> ger-plantel
cd ger-plantel
```

Troque `<URL-DO-REPOSITORIO>` pelo endereço do repositório (o botão **Code** da página do repositório mostra a URL). Para receber atualizações depois, basta rodar `git pull` dentro da pasta.

### Opção 2: baixando o .zip

1. Na página do repositório, clique em **Code** e depois em **Download ZIP**.
2. Extraia o arquivo em uma pasta de sua escolha.
3. Abra o terminal dentro da pasta extraída (no Windows: clique com o botão direito dentro da pasta e escolha **Abrir no Terminal**).

### Opção 3: pelo VS Code

Pressione `Ctrl + Shift + P`, digite **Git: Clone**, cole a URL do repositório e escolha a pasta de destino.

> As pastas `backend/venv` e `frontend/node_modules` não são versionadas. Depois de baixar o projeto, você precisa criá-las seguindo os passos abaixo.

## Instalação passo a passo

Ao todo, são três partes: o banco de dados, o back-end e o front-end. Siga na ordem.

### Passo 1: iniciar o banco de dados

Abra o **XAMPP Control Panel** e clique em **Start** nos módulos **MySQL** e **Apache**. Os dois devem ficar com o nome destacado em verde.

Se você usa o MySQL Server instalado separadamente, apenas confira se o serviço está em execução.

### Passo 2: criar o banco no phpMyAdmin

1. Abra o navegador em **http://localhost/phpmyadmin**.
2. Clique em **Bancos de dados** (*Databases*) no menu superior.
3. Em "Criar banco de dados", digite o nome `plantel` e escolha o agrupamento `utf8mb4_unicode_ci`.
4. Clique em **Criar**.

Deixe o banco **vazio**: as tabelas são criadas sozinhas quando o back-end inicia.

Alternativa pela aba **SQL** do phpMyAdmin (ou pelo terminal do MySQL):

```sql
CREATE DATABASE plantel CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Passo 3: preparar o back-end

Entre na pasta do back-end e crie um ambiente virtual do Python:

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

Quando ele estiver ativo, o terminal mostra `(venv)` no início da linha.

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

Opcionalmente, para que outras pessoas instalem tudo com um único comando, gere o arquivo de dependências:

```bash
pip freeze > requirements.txt
```

Assim, o passo de instalação passa a ser `pip install -r requirements.txt`.

### Passo 4: configurar a conexão com o banco

Abra o arquivo `backend/database.py` e confira a URL de conexão. O formato é:

```python
DATABASE_URL = "mysql+pymysql://USUARIO:SENHA@localhost:3306/plantel"
```

No **XAMPP**, o usuário padrão é `root` e **não há senha**, então a URL fica assim:

```python
DATABASE_URL = "mysql+pymysql://root:@localhost:3306/plantel"
```

Se você definiu uma senha, coloque-a depois dos dois pontos (`root:SUASENHA@`). Caracteres especiais na senha precisam ser codificados na URL:

| Caractere | Escrever como |
|---|---|
| `@` | `%40` |
| `#` | `%23` |
| `/` | `%2F` |
| `:` | `%3A` |
| `%` | `%25` |

O nome do banco no final da URL (`plantel`) deve ser exatamente o que você criou no passo 2. O arquivo precisa expor `engine`, `Base` e `get_db`, que são importados por `main.py` e `models.py`.

### Passo 5: (opcional) popular com dados de exemplo

Com o ambiente virtual ativo e dentro da pasta `backend`:

```bash
python seed.py
```

Isso cadastra atletas de exemplo para você testar o sistema sem precisar digitar tudo. Se preferir começar do zero, pule este passo.

### Passo 6: iniciar o back-end

Ainda na pasta `backend`, com o ambiente virtual ativo:

```bash
uvicorn main:app --reload
```

Se aparecer a mensagem `Uvicorn running on http://127.0.0.1:8000`, a API está no ar. **Deixe este terminal aberto.**

Se o comando `uvicorn` não for reconhecido, use:

```bash
python -m uvicorn main:app --reload
```

### Passo 7: preparar e iniciar o front-end

Abra **um segundo terminal** (o primeiro continua rodando o back-end) e, a partir da pasta do projeto, rode:

```bash
cd frontend
npm install
npm run dev
```

O `npm install` baixa tudo o que está no `package.json` (React, Vite, Tailwind CSS, lucide-react e demais dependências) e só precisa ser feito na primeira vez ou quando o `package.json` mudar. Se alguma biblioteca de ícones ficar faltando, instale com `npm install lucide-react`.

Quando o Vite mostrar `Local: http://localhost:5173/`, o front-end está no ar. **Deixe este terminal aberto também.**

### Passo 8: abrir o sistema

Acesse **http://localhost:5173** no navegador.

> Use `localhost`, e não `127.0.0.1`: a API só aceita requisições vindas de `http://localhost:5173` (veja [Configurações importantes](#configurações-importantes)).

## Verificando se tudo funcionou

Marque cada item:

- [ ] O XAMPP mostra **MySQL** e **Apache** em verde.
- [ ] No phpMyAdmin, o banco `plantel` existe e, depois de iniciar o back-end, mostra as tabelas `players`, `events` e `injuries`.
- [ ] **http://localhost:8000/docs** abre a documentação interativa da API.
- [ ] **http://localhost:5173** abre o sistema, e a aba Elenco carrega sem a tela "Erro de Conexão".
- [ ] É possível cadastrar um atleta em **Novo Atleta** e ele aparece na lista.

Se algum item falhar, consulte a [Solução de problemas](#solução-de-problemas).

## Rotina do dia a dia

Depois da primeira instalação, para usar o sistema de novo basta:

1. Abrir o **XAMPP** e iniciar o **MySQL** (e o **Apache**, se for usar o phpMyAdmin).
2. **Terminal 1, back-end:**

   ```bash
   cd backend
   venv\Scripts\activate        # Windows (no Linux/macOS: source venv/bin/activate)
   uvicorn main:app --reload
   ```

3. **Terminal 2, front-end:**

   ```bash
   cd frontend
   npm run dev
   ```

4. Abrir **http://localhost:5173**.

Para encerrar, pressione `Ctrl + C` em cada terminal e, se quiser, pare os módulos no XAMPP.

### Comandos úteis

| Comando | Onde | O que faz |
|---|---|---|
| `uvicorn main:app --reload` | `backend` | Inicia a API e reinicia sozinha quando o código muda |
| `python seed.py` | `backend` | Popula o banco com dados de exemplo |
| `npm run dev` | `frontend` | Inicia o front-end em modo de desenvolvimento |
| `npm run build` | `frontend` | Gera a versão de produção em `frontend/dist` |
| `npm run preview` | `frontend` | Serve a versão de produção localmente |
| `npm run lint` | `frontend` | Verifica o código com o ESLint |
| `git pull` | raiz do projeto | Baixa as atualizações do repositório |

Depois de um `git pull`, rode `npm install` de novo se o `package.json` mudou e reinicie o back-end. Se o `models.py` mudou, confira a seção [Atualizando um banco já existente](#atualizando-um-banco-já-existente).

## Primeiros passos no sistema

1. **Elenco:** clique em **Novo Atleta**, preencha os dados e salve. Use **Detalhes** para editar qualquer informação, inclusive a camisa, e para encerrar uma suspensão. Experimente a busca, os filtros e a ordenação.
2. **Prancheta:** escolha a formação de cada modo (padrão, ataque e defesa), clique em uma vaga e depois em outra vaga ou em um atleta da lista para trocar. No painel **Funções da Equipe**, defina capitão e cobradores; no painel **Funções Táticas**, escolha a função de cada posição e veja o cartão se mover e ganhar uma seta.
3. **Calendário:** clique em um dia para marcar treino, descanso ou jogo. Em jogos, informe o adversário, a competição e a rodada ou fase.
4. **Departamento médico:** use **Registrar lesão** para afastar um atleta e **Dar alta** quando ele estiver liberado. No fim da página, o histórico permite registrar lesões antigas e pesquisar por período, atleta, tipo e local.

## Configurações importantes

| O que mudar | Onde | Quando |
|---|---|---|
| Usuário, senha, endereço e nome do banco | `backend/database.py` | Se o seu MySQL for diferente do padrão do XAMPP |
| Endereço da API | `API_URL` em `frontend/src/services/api.js` | Se rodar a API em outra porta ou máquina |
| Endereços aceitos pela API (CORS) | `allow_origins` em `backend/main.py` | Se o front-end rodar em outra porta ou endereço |
| Porta da API | Parâmetro `--port` do `uvicorn` | Se a porta 8000 estiver ocupada |
| Altura do campo da prancheta | `PITCH_HEIGHT` em `frontend/src/components/tabs/TacticsTab.jsx` | Para aumentar ou diminuir o campo |
| Movimento de cada função tática | `ROLE_MOVEMENT` em `frontend/src/constants/tactics.js` | Para ajustar o deslocamento e as setas |

Por padrão, o back-end aceita apenas requisições de `http://localhost:5173`. Para acessar por outro endereço (como `http://127.0.0.1:5173`), acrescente-o à lista `allow_origins` em `backend/main.py`.

## Atualizando um banco já existente

O back-end só cria tabelas que ainda não existem e **não altera tabelas antigas**. Em um banco totalmente novo, nada desta seção é necessário.

Se você já tinha o banco de uma versão anterior do projeto, abra a aba **SQL** do banco `plantel` no phpMyAdmin e rode estes comandos para acrescentar as colunas novas:

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

Opcionalmente, para mover o motivo das suspensões antigas (que ficavam no campo de lesão) para o campo certo:

```sql
UPDATE players
SET suspension_reason = LEFT(injury, 100), injury = NULL
WHERE status = 'SUSPENDED' AND injury IS NOT NULL;
```

As tabelas `events` e `injuries` são novas e criadas automaticamente quando o back-end inicia.

## Solução de problemas

| Problema | Causa provável e solução |
|---|---|
| Tela "Erro de Conexão" ao abrir o front-end | O back-end não está rodando. Inicie o `uvicorn` e confira se o MySQL está ativo. |
| Erro de CORS no console do navegador | O front-end está sendo acessado por um endereço diferente de `http://localhost:5173` (por exemplo, `127.0.0.1`). Use `localhost` ou ajuste `allow_origins` em `backend/main.py`. |
| `Access denied for user` | Usuário ou senha errados em `database.py`. No XAMPP padrão, é `root` sem senha. |
| `Unknown database 'plantel'` | O banco ainda não foi criado, ou o nome em `database.py` é diferente do criado no phpMyAdmin. |
| `Can't connect to MySQL server` | O MySQL não está iniciado no XAMPP, ou a porta da URL (3306) está errada. |
| `cryptography package is required` | Rode `pip install cryptography` com o ambiente virtual ativo. |
| `ModuleNotFoundError` | O ambiente virtual não está ativo ou falta instalar um pacote. Ative o `venv` e rode o `pip install` do passo 3. |
| `uvicorn` não é reconhecido | Use `python -m uvicorn main:app --reload` com o ambiente virtual ativo. |
| `npm` ou `node` não é reconhecido | O Node.js não foi instalado ou o terminal foi aberto antes da instalação. Instale e reabra o terminal. |
| `venv\Scripts\activate` bloqueado no PowerShell | Rode `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` e tente de novo (ou use o CMD). |
| `Address already in use` (porta 8000 ou 5173) | Há outro processo usando a porta. Feche-o ou use outra porta (`uvicorn main:app --reload --port 8001`, lembrando de ajustar `API_URL` em `frontend/src/services/api.js`). |
| O MySQL do XAMPP não inicia | Outro MySQL (como o serviço do MySQL Server) está usando a porta 3306. Pare o outro serviço ou mude a porta em um deles. |
| O phpMyAdmin não abre | O Apache não está iniciado no XAMPP, ou a porta 80 está ocupada por outro programa. |
| `Unknown column ... in 'field list'` | O banco é de uma versão antiga. Aplique os comandos da seção [Atualizando um banco já existente](#atualizando-um-banco-já-existente). |
| Alterei o `models.py` e o banco não mudou | O `create_all` só cria tabelas novas. Aplique a mudança com `ALTER TABLE` no phpMyAdmin. |
| `Duplicate entry ... for key 'uq_players_number'` ao rodar o `seed.py` | Os dados de exemplo têm camisas repetidas, o que a regra de camisa única não permite. Ajuste os números no `seed.py`. |
| A lista de lesões ou o calendário não carrega | Reinicie o `uvicorn` para o servidor criar as tabelas novas. |
| Tela em branco no front-end | Abra o console do navegador (`F12`) para ver o erro. Se houver módulos faltando, rode `npm install` de novo na pasta `frontend`. |

## Limitações conhecidas

- A escalação, as formações táticas e as funções (da equipe e táticas) ficam apenas na memória do navegador e voltam ao padrão quando a página é recarregada.
- O sistema trabalha com um único elenco e não possui autenticação de usuários.
- O calendário aceita um evento por dia.
- A escalação da prancheta não é atualizada automaticamente quando um titular se lesiona ou é suspenso; a troca é feita manualmente.
- O projeto ainda não tem um arquivo `requirements.txt` versionado; veja o passo 3 para gerá-lo.