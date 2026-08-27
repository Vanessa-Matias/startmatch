# StartMatch

Plataforma de matchmaking entre **startups**, **investidores-anjo** e
**mentores** do ecossistema de startups e economia criativa do Porto Digital
(Recife). Projeto Integrador (UE: FullStack) — Senac.

O fluxo principal: cadastro → perfil (startup/investidor/mentor) → busca com
filtros → manifestação de interesse → match (com score de compatibilidade
calculado automaticamente) → chat entre as partes. Também inclui um Business
Model Canvas por startup, registro de consentimento LGPD e um painel
administrativo com indicadores da plataforma.

Para o escopo detalhado de cada entrega da disciplina e o que já está
implementado, ver [`docs/PLANO-DO-PROJETO.md`](docs/PLANO-DO-PROJETO.md). Para
a arquitetura técnica completa (modelo de dados, autenticação, LGPD), ver
[`docs/arquitetura.md`](docs/arquitetura.md).

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Vite + TypeScript puro, aplicação multi-page (uma pasta por tela em `frontend/src/pages/`) |
| Backend | NestJS (Node.js) + TypeORM, API REST documentada via Swagger |
| Banco de dados | PostgreSQL |

Arquitetura cliente-servidor clássica: o frontend consome a API REST do
backend em JSON sobre HTTPS/HTTP; o backend acessa o PostgreSQL via TypeORM.

## Rodando localmente

### 1. Banco de dados

```bash
docker-compose up -d
```

Sobe um PostgreSQL em `localhost:5432` (usuário/senha/banco: `startmatch`) e
o Adminer em `http://localhost:8080` para inspecionar o banco.

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env   # ajuste se necessário
npm run start:dev
```

API em `http://localhost:3000/api`; documentação Swagger em
`http://localhost:3000/docs`.

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env   # ajuste se necessário
npm run dev
```

Aplicação em `http://localhost:5173`.

## MOCK_MODE (modo demonstração do frontend)

O frontend tem um modo de demonstração controlado pela variável
`VITE_MOCK_MODE` (arquivo `.env` de `frontend/`, ver `frontend/.env.example`).
Com `VITE_MOCK_MODE=true` (o padrão), uma camada de interceptação
(`frontend/src/scripts/mock.ts`) substitui as chamadas à API por dados de
mentira — dá para navegar e demonstrar o site inteiro sem precisar rodar o
backend nem o banco de dados.

Para testar contra a API real, defina `VITE_MOCK_MODE=false` no `.env` do
frontend (com o backend e o banco já rodando, passos 1 e 2 acima) — nenhuma
tela precisa mudar, a troca é só dessa variável.
