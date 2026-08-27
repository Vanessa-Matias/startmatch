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
| Aplicação web responsiva/PWA funcional | PWA pronto (manifest + service worker); **responsividade ainda não implementada** — é o próximo passo, com a Agnes estilizando |
| Frontend em React ou tecnologia equivalente | HTML + CSS + TypeScript puro com Vite (SPA/MPA moderna) — **tecnologicamente equivalente, mas não é React**; vale confirmar com o professor se aceita |
| Backend em Node.js ou tecnologia equivalente | ✅ NestJS (Node.js) |
| Backend disponibilizando API REST | ✅ Documentação viva em `/docs` (Swagger) |
| Banco de dados integrado à aplicação | ⚠️ **Pendente** — TypeORM/entidades prontos, mas nenhum banco real foi conectado e testado de ponta a ponta ainda (decisão da equipe: banco só depois da Agnes terminar o frontend) |
| Cadastro, login e autenticação de usuários | ✅ Implementado (JWT) — falta validar contra banco real |
| Diferenciação inicial dos perfis de Startup e Investidor | ✅ |
| Cadastro de startups (segmento, estágio, localização, equipe, mercado de atuação, investimento pretendido) | ✅ Segmento/estágio/localização/investimento; **"equipe" e "mercado de atuação" não são campos próprios** hoje (ficam dentro da descrição livre) |
| Cadastro de investidores (áreas de interesse, tese, faixa de investimento, localização) | ✅ |
| Cadastro e gerenciamento das informações dos perfis | ✅ |
| Mecanismo inicial de busca e filtros | ✅ |
| Registro de interesse entre startups e investidores | ✅ |
| Implementação inicial do fluxo de matchmaking | ✅ Score de compatibilidade calculado no backend |
| Dashboard inicial por perfil | ✅ |
| Arquitetura cliente-servidor funcional e documentada | ✅ Funcional; documentação em `docs/arquitetura.md` |
| Modelo de dados e documentação inicial das APIs | ✅ `docs/arquitetura.md` (modelo de dados) + Swagger (`/docs`) |
| Construção inicial do Business Model Canvas | ✅ Feature funcional (`canvas/`) + conteúdo em `docs/modelo-de-negocio.md` |
| Definição preliminar da proposta de valor e público-alvo | ✅ `docs/modelo-de-negocio.md` |
| Definição inicial das regras de uso da plataforma | ⚠️ Existe o registro de aceite de termos (LGPD), mas falta redigir o texto de Termos de Uso em si |
| Levantamento dos dados pessoais tratados + requisitos LGPD | ✅ `docs/arquitetura.md`, seção 5 |

**Pendências reais antes de 15/10:** conectar e testar um banco de dados de
verdade; deixar o frontend responsivo; redigir o texto de Termos de Uso; e
(opcional) confirmar com o professor se a stack sem React é aceita.

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
| Deploy em ambiente de nuvem | ❌ Ainda não — planejado: frontend no Vercel, banco no Supabase |
| Controle de acesso por perfis e permissões | ✅ (adiantado) |
| Autenticação, autorização e proteção das APIs | ✅ (adiantado) |
| Requisitos de privacidade e proteção de dados (LGPD) | ⚠️ Módulo básico existe; painel agregado de consentimentos ainda não |
| Registro básico de auditoria | ❌ Ainda não (tela `admin-auditoria` é um placeholder) |
| Testes automatizados (backend/frontend) | ❌ Ainda não existem |
| Testes com usuários reais/beta testers | ⚠️ Funcionalidade de avaliação pronta (`beta-evaluation`), falta rodar com usuários reais |
| Finalização do Business Model Canvas / plano de negócio | ⚠️ Versão inicial pronta (`docs/modelo-de-negocio.md`), falta aprofundar |
| Estratégia de monetização definida | ✅ Planos definidos; cobrança real ainda não integrada |
| Estratégia inicial de Go-to-Market | ✅ `docs/modelo-de-negocio.md`, seção 6 |
| Documentação técnica final (arquitetura, APIs, dados, implantação) | ⚠️ Arquitetura/dados/APIs documentados; falta a parte de implantação (depende do deploy) |
| Apresentação e demonstração da solução completa | — (etapa final, depende do restante) |

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

## Próximos passos imediatos

1. Conferir o fluxo de telas da designer (documento à parte) contra a
   estrutura de páginas atual — especialmente Mentor e Admin.
2. Deixar o frontend responsivo (trabalho da Agnes, com o `GUIA-FRONTEND.md`
   como referência).
3. Redigir o texto de Termos de Uso da plataforma.
4. Subir o projeto para um repositório no GitHub.
5. Conectar um banco de dados real e validar o fluxo cadastro → login →
   perfil → busca → interesse → match de ponta a ponta antes de 15/10.
