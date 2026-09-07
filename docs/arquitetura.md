# Arquitetura — StartMatch

> Documento técnico de arquitetura, modelo de dados e governança de dados (LGPD)
> do StartMatch — Plataforma de Matchmaking para Startups e Investidores-Anjo do
> Nordeste. Escrito para atender aos itens "Arquitetura cliente-servidor
> funcional e documentada", "Modelo de dados e documentação inicial das APIs" e
> "Levantamento dos principais dados pessoais tratados e requisitos relacionados
> à LGPD" da 1ª entrega, e evolui para os itens de governança da 2ª entrega
> (controle de acesso, autenticação/autorização das APIs, gestão de
> consentimento).

## 1. Visão geral

O StartMatch é uma aplicação **cliente-servidor** clássica, em três camadas:

```
Cliente (PWA)  ──HTTPS/JSON──►  API REST (backend)  ──SQL──►  Banco de dados
 Vite + TS                       NestJS + TypeORM              PostgreSQL
 localStorage (sessão)           JWT + Guards de papel
```

- **Frontend**: aplicação web responsiva (PWA), em HTML + CSS + TypeScript
  puro, empacotada com Vite em modo *multi-page app* — cada tela do site é uma
  página independente, todas compartilhando os mesmos scripts de API/sessão e
  o mesmo design system (`frontend/src/styles/`).
- **Backend**: API REST em NestJS (Node.js), organizada em módulos por domínio
  (um módulo = um recurso do negócio: `startups`, `investors`, `mentors`,
  `matches`, `interests`, `conversations`, `business-canvas`, `lgpd`,
  `beta-evaluation`, `admin`, `users`, `auth`, `segments`).
- **Banco de dados**: PostgreSQL, acessado via TypeORM. Em desenvolvimento, o
  schema é criado automaticamente a partir das entidades (`synchronize: true`
  só em `NODE_ENV=development`); em produção, a recomendação é migrations
  explícitas antes de ativar o deploy (item da 2ª entrega).
- **Autenticação**: JWT (`@nestjs/passport` + `passport-jwt`). O token é salvo
  no `localStorage` do navegador e enviado em todo request pelo `api.ts` do
  frontend.

## 2. Documentação das APIs

A documentação viva das APIs é gerada automaticamente pelo próprio backend via
**Swagger/OpenAPI** (`@nestjs/swagger`): ao rodar `npm run start:dev` dentro de
`backend/`, a documentação interativa fica disponível em `http://localhost:3000/docs`,
sempre sincronizada com o código (não precisa manter um documento separado
atualizado à mão).

Principais grupos de rotas expostas hoje:

| Módulo | Rotas | O que faz |
|---|---|---|
| `auth` | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` | Cadastro de conta, login (retorna JWT) e dados do usuário logado |
| `users` | `GET /users` (admin), `GET /users/me`, `PATCH /users/me` | Gestão da conta e listagem administrativa de usuários |
| `startups` | `POST /startups`, `GET /startups`, `GET /startups/me`, `GET /startups/:id`, `PATCH /startups/me` | Perfil de startup: criação, busca/listagem, leitura própria, leitura pública e edição |
| `investors` | `POST /investors`, `GET /investors`, `GET /investors/me`, `GET /investors/:id`, `PATCH /investors/me` | Perfil de investidor (mesmo padrão de `startups`) |
| `mentors` | `POST /mentors`, `GET /mentors`, `GET /mentors/me`, `GET /mentors/:id`, `PATCH /mentors/me` | Perfil de mentor |
| `segments` | `GET /segments` | Lista de segmentos/verticais de mercado usados nos perfis |
| `interests` | `POST /interests`, `GET /interests/sent`, `GET /interests/received` | Registro de interesse (o gatilho do matchmaking) |
| `matches` | `GET /matches`, `GET /matches/suggestions`, `GET /matches/:id` | Conexões confirmadas e sugestões de compatibilidade |
| `conversations` | `GET /conversations`, `GET /conversations/:id/messages`, `POST /conversations/:id/messages` | Chat entre startup e investidor após o match |
| `business-canvas` | `GET /business-canvas/me`, `PUT /business-canvas/me` | Business Model Canvas de cada startup |
| `lgpd` | `POST /lgpd/consent`, `GET /lgpd/consent` | Registro e leitura de consentimentos LGPD do usuário |
| `beta-evaluation` | `POST /beta-evaluation`, `GET /beta-evaluation` | Avaliação de usuários beta testers (usabilidade, utilidade) |
| `admin` | `GET /admin/metrics` | Indicadores agregados da plataforma (só para o papel admin) |

Todas as rotas autenticadas exigem o header `Authorization: Bearer <token>`;
rotas restritas por papel usam um `RolesGuard` que lê o `TipoUsuario` do token
e bloqueia quem não tem o papel exigido (ex.: `GET /users` e `GET /admin/metrics`
só respondem para `admin`).

## 3. Modelo de dados

O modelo de dados segue a proposta relacional definida pelo professor
(entidades de Usuário, Startup, Investidor, Segmento, Interesse, Match,
Conversa, Mensagem, Plano de Negócio, Consentimento LGPD e Avaliação Beta),
estendida com uma entidade de **Mentor** — papel adicional definido pela
equipe para cobrir a parte de mentoria do ecossistema (mencionada no
material da disciplina como um dos perfis do lado "Investidores e Mentores")
e um papel de **Administrador** para a gestão operacional da plataforma
(indicadores, usuários, planos — exigência explícita da 2ª entrega:
"recursos administrativos para acompanhamento e gestão da plataforma").

| Entidade | Campos principais | Relacionamentos |
|---|---|---|
| `Usuario` | nome, email (único), senha (hash), tipo (`startup`/`investidor`/`mentor`/`admin`), status | 1:1 com `Startup`, `Investidor` ou `Mentor` conforme o tipo |
| `Startup` | nomeFantasia, cnpj, descrição, estágio, investimentoPretendido, cidade/UF, planoAssinatura | N:N com `Segmento` (via `StartupSegmento`), 1:N `Interesse`/`Match`, 1:1 `PlanoNegocio` |
| `Investidor` | tipo (anjo/VC/fundo/corporate), tese de investimento, faixa mín./máx. de investimento, cidade/UF, perfilPublico | N:N com `Segmento` (via `InvestidorSegmento`, com prioridade), 1:N `Interesse`/`Match` |
| `Mentor` | áreaAtuação, especialidades, disponibilidade, vínculo com o Porto Digital (desconto de plano) | 1:1 com `Usuario` |
| `Segmento` | nome, descrição | N:N com `Startup` e `Investidor` |
| `Interesse` | origem (quem manifestou), status, mensagem inicial | N:1 com `Startup` e `Investidor` |
| `Match` | score de compatibilidade, origem, status | N:1 com `Startup`/`Investidor`, 1:1 com `Conversa` |
| `Conversa` / `Mensagem` | status, conteúdo, timestamps de leitura/envio | 1:1 com `Match`, 1:N `Mensagem` |
| `PlanoNegocio` | Business Model Canvas completo: proposta de valor, segmentos de clientes, canais, relacionamento com clientes, fontes de receita, recursos-chave, atividades-chave, parcerias-chave, estrutura de custos (9 blocos) | 1:1 com `Startup` |
| `ConsentimentoLGPD` | tipo (termos de uso/privacidade/marketing), versão do termo, aceite, data | N:1 com `Usuario` |
| `AvaliacaoBeta` | tipo de usuário, nota de usabilidade, nota de utilidade, comentário | N:1 com `Usuario` |

## 4. Autenticação, autorização e controle de acesso

- Login gera um JWT assinado (`JWT_SECRET` em variável de ambiente,
  expiração configurável via `JWT_EXPIRES_IN`).
- Toda rota protegida usa um `AuthGuard('jwt')`; rotas restritas por papel
  adicionam um `RolesGuard` + decorator `@Roles(...)`, checando o
  `TipoUsuario` do usuário autenticado.
- O frontend guarda o token e os dados do usuário em `localStorage`
  (`sc_token`, `sc_user`) e cada página protegida chama `requireAuth([papéis
  permitidos])` antes de renderizar qualquer dado.
- Hoje (fase de estilização, antes do banco de dados existir), o frontend
  roda em **modo demonstração**: uma camada de interceptação
  (`frontend/src/scripts/mock.ts`) substitui as chamadas de API por dados de
  mentira, para permitir montar/estilizar todas as telas sem precisar de
  backend nem banco reais. Isso é só uma facilidade de desenvolvimento — a
  troca para a API real é uma linha só e não muda nenhuma tela.

## 5. LGPD — dados pessoais tratados e requisitos

**Dados pessoais coletados pela plataforma:**

| Dado | Onde | Finalidade |
|---|---|---|
| Nome, e-mail, senha (hash) | `Usuario` | Autenticação e identificação da conta |
| Cidade/UF | `Startup`, `Investidor` | Filtros de busca por localização |
| CNPJ (opcional) | `Startup` | Identificação da pessoa jurídica |
| Conteúdo de mensagens | `Mensagem` | Comunicação entre startup e investidor após o match |
| Avaliações de uso (beta) | `AvaliacaoBeta` | Melhoria do produto durante a validação |
| Aceite de termos/consentimentos | `ConsentimentoLGPD` | Comprovação de consentimento (termos de uso, privacidade, marketing) |

**Base legal:** execução de contrato (o cadastro/uso da plataforma em si) e
consentimento explícito para comunicações de marketing — daí o campo
`TipoConsentimento` separar `termos_uso`/`privacidade` de `marketing`.

**Implementado na 1ª entrega:** módulo `lgpd` com endpoints de registro e
leitura de consentimento; tela `admin-lgpd` com o levantamento acima como
conteúdo de referência.

**Planejado para a 2ª entrega** (conforme o próprio escopo da disciplina):
painel de consentimentos por usuário (hoje o registro existe, mas falta a
visão agregada/administrativa), política de retenção e exclusão de dados, e
registro básico de eventos relevantes para auditoria (tela `admin-auditoria`,
hoje um placeholder aguardando essa funcionalidade).

## 6. Ambiente e deploy

- **Desenvolvimento local:** `docker-compose.yml` sobe PostgreSQL (+ Adminer
  para inspecionar o banco); backend e frontend rodam com `npm run dev` cada
  um na sua pasta.
- **Produção (planejada para a 2ª entrega):** frontend em Vercel, banco de
  dados PostgreSQL gerenciado no Supabase, backend hospedado separadamente
  (a definir). Variáveis de ambiente (`DB_HOST`, `DB_PORT`, `DB_USER`,
  `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `CORS_ORIGIN`) já são lidas de
  configuração externa (`.env`), então a migração de ambiente não exige
  mudança de código — só de variáveis.
