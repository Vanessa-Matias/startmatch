# Plano do Projeto — StartMatch

> Projeto Integrador (UE: FullStack) — Senac, Prof. Geraldo Gomes.
> **Nome do desafio do professor:** "Plataforma de Matchmaking para Startups e
> Investidores-Anjo do Nordeste". **Nome escolhido pela equipe para o
> produto:** StartMatch.
>
> Este documento acompanha o escopo oficial das duas entregas da disciplina
> (transcrito do material de aula) e o status real de implementação em cada
> item, para servir de checklist antes de cada entrega.

## 1ª Entrega — 15/10/2026

**Objetivo da entrega (do professor):** demonstrar o funcionamento do fluxo
principal da solução, contemplando cadastro → perfil → busca → identificação
de oportunidades → manifestação de interesse/match, com frontend, backend e
banco de dados funcionando de forma integrada e uma primeira visão do modelo
de negócio e da governança da plataforma.

| Item exigido | Status |
|---|---|
| Aplicação web responsiva/PWA funcional | ✅ PWA pronto (manifest + service worker). Em 13/10 as principais telas dos três perfis foram abertas em 390 px (celular) e em 1366 px (computador): nenhuma tem rolagem horizontal nem erro de JavaScript |
| Frontend em React ou tecnologia equivalente | HTML + CSS + TypeScript puro com Vite (SPA/MPA moderna) — **tecnologicamente equivalente, mas não é React**; vale confirmar com o professor se aceita |
| Backend em Node.js ou tecnologia equivalente | ✅ NestJS (Node.js) |
| Backend disponibilizando API REST | ✅ Documentação viva em `/docs` (Swagger) |
| Banco de dados integrado à aplicação | ✅ PostgreSQL no Supabase (conexão pelo pooler, com SSL), usado pela API publicada. O fluxo cadastro → login → perfil já foi testado gravando no banco em produção |
| Cadastro, login e autenticação de usuários | ✅ Implementado (JWT, senha com hash bcrypt) e validado contra o banco real |
| Diferenciação inicial dos perfis de Startup e Investidor | ✅ |
| Cadastro de startups (segmento, estágio, localização, equipe, mercado de atuação, investimento pretendido) | ✅ Segmento/estágio/localização/investimento; **"equipe" e "mercado de atuação" não são campos próprios** hoje (ficam dentro da descrição livre) |
| Cadastro de investidores (áreas de interesse, tese, faixa de investimento, localização) | ✅ |
| Cadastro e gerenciamento das informações dos perfis | ✅ |
| Mecanismo inicial de busca e filtros | ✅ |
| Registro de interesse entre startups e investidores | ✅ `POST /interests` (botão no perfil da contraparte). Na apresentação, a lista de matches e as conversas de exemplo são **simuladas só no front-end** — ver a seção "Telas de demonstração" |
| Implementação inicial do fluxo de matchmaking | ✅ Score de compatibilidade calculado no backend |
| Dashboard inicial por perfil | ✅ |
| Arquitetura cliente-servidor funcional e documentada | ✅ Funcional; documentação em `docs/arquitetura.md` |
| Modelo de dados e documentação inicial das APIs | ✅ `docs/arquitetura.md` (modelo de dados) + Swagger (`/docs`) |
| Construção inicial do Business Model Canvas | ✅ Feature funcional (`canvas/`), com os 9 blocos completos do BMC persistidos no backend (corrigido em 07/09 — o backend só salvava 4 dos 9 campos que a tela da Agnes já exibia; agora `PlanoNegocio` tem os 9 campos e a tela recarrega os dados salvos ao reabrir) + conteúdo em `docs/modelo-de-negocio.md` |
| Definição preliminar da proposta de valor e público-alvo | ✅ `docs/modelo-de-negocio.md` |
| Definição inicial das regras de uso da plataforma | ⚠️ Existe o registro de aceite de termos (LGPD), mas falta redigir o texto de Termos de Uso em si |
| Levantamento dos dados pessoais tratados + requisitos LGPD | ✅ `docs/arquitetura.md`, seção 5 |

**Pendências antes de 15/10:** redigir o texto de Termos de Uso e (opcional)
confirmar com o professor se a stack sem React é aceita. O banco de dados, o
deploy e a responsividade já foram resolvidos.

## 2ª Entrega — 11/12/2026

**Objetivo da entrega (do professor):** transformar o MVP em um produto SaaS
completo, seguro, validado e preparado para o mercado.

| Item exigido | Status |
|---|---|
| Evolução do matchmaking + critérios de compatibilidade | ✅ Já implementado desde a 1ª entrega (adiantado) |
| Ranking/recomendação de maior compatibilidade | ✅ `GET /matches/suggestions` já existe (adiantado) |
| Fluxo completo de interesse e conexões | ✅ (adiantado) |
| Área de acompanhamento de oportunidades e conexões | ✅ (adiantado) |
| Dashboard consolidado com indicadores da plataforma | ✅ Painel do Administrador com `GET /admin/metrics` (adiantado) |
| Indicadores (nº de startups, investidores, interesses, matches, oportunidades) | ✅ (adiantado) |
| Recursos administrativos de gestão da plataforma | ✅ Gestão de usuários e planos (adiantado) |
| Deploy em ambiente de nuvem | ✅ Frontend na Vercel, API no Render, banco no Supabase (adiantado) |
| Controle de acesso por perfis e permissões | ✅ (adiantado) |
| Autenticação, autorização e proteção das APIs | ✅ (adiantado) |
| Requisitos de privacidade e proteção de dados (LGPD) | ⚠️ Módulo básico existe; painel agregado de consentimentos ainda não |
| Registro básico de auditoria | ✅ Módulo `audit` registra eventos (cadastro, login, consentimento, mentor) e a tela `admin-auditoria` lê `GET /admin/audit-log` (adiantado) |
| Testes automatizados (backend/frontend) | ❌ Ainda não existem (só o teste e2e de exemplo que vem com o NestJS, que não cobre as rotas do projeto) |
| Testes com usuários reais/beta testers | ⚠️ Funcionalidade de avaliação pronta (`beta-evaluation`), falta rodar com usuários reais |
| Finalização do Business Model Canvas / plano de negócio | ⚠️ Versão inicial pronta (`docs/modelo-de-negocio.md`), falta aprofundar |
| Estratégia de monetização definida | ✅ Planos definidos; cobrança real ainda não integrada |
| Estratégia inicial de Go-to-Market | ✅ `docs/modelo-de-negocio.md`, seção 6 |
| Documentação técnica final (arquitetura, APIs, dados, implantação) | ✅ Arquitetura, dados, APIs e implantação em `docs/arquitetura.md` (seção 6) |
| Apresentação e demonstração da solução completa | — (etapa final, depende do restante) |

## Telas de demonstração (somente front-end)

Para a apresentação da 1ª entrega, algumas telas mostram dados de exemplo
**guardados apenas no navegador** (`sessionStorage`/`localStorage`). Nada
delas vai para a API nem para o banco de dados. O que grava no banco é o
fluxo principal: cadastro → login → cadastro do perfil (startup, investidor
ou mentor) → busca → manifestação de interesse.

| Tela | O que é simulado |
|---|---|
| Matches (startup/investidor) | Matches de exemplo e o botão "Simular novo match" (`scripts/matchSimulado.ts`); os matches reais continuam vindo de `GET /matches` |
| Mensagens | Conversas dos matches de exemplo, com resposta automática; no perfil Mentor, as conversas vêm das solicitações de mentoria de exemplo |
| Mentorias (startup) | Mentores de exemplo e o aviso ao "Solicitar mentoria"; mentores reais vêm de `GET /mentors` |
| Agenda, Solicitações, Histórico e Certificados (mentor) | Dados de exemplo em `scripts/mentorDemo.ts` |
| Plano, Comprar mentorias (pagamento) | Cartão/PIX de demonstração (`scripts/payment.ts`); nada é cobrado |
| Stella (Como funciona) | Assistente só com menu numerado, sem IA e sem chamar a API |

## Decisões de escopo da equipe (fora do material do professor)

O material do professor define apenas os papéis de **Startup** e
**Investidor** como logins com painel próprio (Mentor e Administrador
aparecem só como personas de negócio no material). A equipe optou por criar
também **Mentor** e **Administrador** como papéis completos de login — Mentor
para cobrir a parte de mentoria mencionada no modelo de negócio, e
Administrador para atender à exigência de "recursos administrativos" da 2ª
entrega. Essa decisão deve ser conferida contra o fluxo de telas específico
que a designer (Agnes) preparou separadamente, para garantir que as telas
extras (agenda, solicitações, histórico, certificados no caso do Mentor;
usuários, planos, relatórios, LGPD, auditoria no caso do Admin) batem com o
que foi desenhado.

## Nota — verificação de consistência frontend x backend (07/09/2026)

Conferência ponta a ponta do contrato entre as telas da Agnes e a API do
backend (rotas usadas em cada `main.ts` x rotas expostas por cada
controller, e os tipos em `frontend/src/scripts/types.ts` x as entidades/DTOs
do backend): tudo bate, com uma exceção corrigida nesta revisão — o Canvas
(ver linha acima; os nomes de campo mantidos foram os que a Agnes já usava no
HTML/TS da tela, o backend é que foi ajustado para acompanhá-los). `npx tsc
--noEmit` roda limpo tanto em `backend/` quanto em `frontend/` depois da
correção (antes, o frontend não compilava por causa de 5 variáveis do Canvas
nunca usadas — sintoma do mesmo problema). `npx eslint` no módulo
`business-canvas` também está limpo. `npm test` do backend não roda neste
ambiente por uma dependência (`ts-jest`) ausente do `node_modules` local — não
é um problema introduzido agora, é o mesmo item "Testes automatizados" já
listado como pendente na tabela da 2ª entrega; só confirma que a suíte em si
ainda não foi escrita.

## Próximos passos imediatos

1. Conferir o fluxo de telas da designer (documento à parte) contra a
   estrutura de páginas atual — especialmente Mentor e Admin.
2. Deixar o frontend responsivo (trabalho da Agnes, com o `GUIA-FRONTEND.md`
   como referência).
3. Redigir o texto de Termos de Uso da plataforma.
4. Subir o projeto para um repositório no GitHub.
5. Conectar um banco de dados real e validar o fluxo cadastro → login →
   perfil → busca → interesse → match de ponta a ponta antes de 15/10.
