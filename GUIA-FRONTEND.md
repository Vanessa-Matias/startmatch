# Guia do Frontend — StartMatch

> Documento único, na raiz do projeto, para você (Agnes) usar de duas formas: (1) como
> mapa para entender qualquer arquivo do `frontend/` antes de mexer nele, e (2) como
> contexto para colar em outra IA (ChatGPT, outra instância do Claude, etc.) quando
> pedir ajuda com estilização. Com este arquivo você consegue fazer qualquer mudança
> visual ou de tela sem precisar entender a lógica de backend por trás.
>
> Ele reúne num lugar só o que antes estava espalhado em vários arquivos — a
> estrutura de páginas segue exatamente o fluxograma de navegação enviado pela
> designer, e este documento (seção 5) já traz o mapa completo: cada tela do
> fluxograma ao lado da pasta de código correspondente, com o que já é real e o
> que é estrutura pronta aguardando backend futuro.

---

## 0. Modo demonstração — rode sem backend e sem banco de dados

**Você não precisa instalar Postgres, Docker, nem pedir pra Vanessa subir nada.**
Enquanto o banco de dados real não existir, o site roda inteiro com dados de
mentira (uma startup, um investidor, um mentor, etc. — já com nomes, descrições e
até um match/conversa de exemplo prontos).

Pra rodar:

```
cd frontend
npm install
npm run dev
```

Abre em `http://localhost:5173`. Só isso — nenhuma variável de ambiente extra é
necessária, o modo demonstração já vem ligado por padrão.

**Como isso te dá liberdade total pra estilizar:**

- Qualquer tela que normalmente exigiria login (dashboard, busca, mensagens, o
  dashboard do Mentor, o painel do Admin — QUALQUER uma) abre direto, sem
  precisar entrar antes. Ao abrir a URL de uma tela, o site "loga sozinho" com o
  papel certo pra aquela tela.
- As telas de Login/Cadastro também funcionam — pode usar os mesmos e-mails de
  teste de antes (`startup@teste.com`, `investidor@teste.com`, `mentor@teste.com`,
  `admin@teste.com`, qualquer senha) ou simplesmente clicar em qualquer link do
  menu, o resultado é o mesmo.
- Os formulários (cadastro de perfil, "Tenho interesse", enviar mensagem, avaliar
  o app...) podem ser enviados à vontade — tudo "dá certo" na hora, sem quebrar.

**Se quiser trocar os dados de exemplo** (nome da startup, textos, quantidade de
mentores na vitrine etc.), edite `frontend/src/scripts/mockData.ts` — é só um
arquivo de dados, sem lógica nenhuma. Não precisa mexer em `mock.ts`, `api.ts` nem
`auth.ts` pra isso.

Quando o banco de dados real estiver pronto, a Vanessa desliga esse modo
(uma linha só, em `scripts/mock.ts`) e o site passa a falar com a API de verdade —
nenhuma tela muda por causa disso.

---

## 1. Resumo rápido

O esqueleto funcional do frontend (formulários, chamadas à API, navegação entre
telas) já está pronto. O que falta é **estilização e responsividade** — você não
precisa mexer em lógica para deixar o site bonito.

O frontend é **HTML, CSS e TypeScript puros** — sem React, Vue ou qualquer
framework. Cada tela do site é uma pasta com dois arquivos: um `index.html`
(estrutura da página) e um `main.ts` (o que acontece quando ela carrega — buscar
dados da API, reagir a cliques, etc.). O projeto usa Vite em modo "multi-page app",
então cada pasta de tela é descoberta automaticamente — você não precisa configurar
nada para adicionar uma tela nova (ver seção 8).

## 2. O que é seguro editar livremente

- `frontend/src/styles/variables.css` — cores, tipografia, espaçamentos. Editar
  este arquivo muda a identidade visual do app inteiro de uma vez.
- `frontend/src/styles/global.css` — reset e estilos base (tipografia, layout de
  container).
- `frontend/src/styles/components.css` — botões, cards, inputs, badges, navbar.
  Compartilhado por todas as telas.
- Um `<style>` específico dentro do `index.html` de uma tela (a tela de
  `mensagens/` já tem um exemplo disso, para o layout do chat) — para ajustes que só
  fazem sentido naquela tela.
- A estrutura HTML dentro de cada `index.html` (classes, divs, ordem visual) — pode
  reorganizar o layout à vontade, contanto que mantenha os elementos com `id` que o
  `main.ts` da mesma pasta usa (ver seção 7, "Regra de ouro").

## 3. O que tem lógica e não deveria precisar mexer

- `frontend/src/scripts/api.ts`, `auth.ts`, `nav.ts`, `types.ts`, `ufs.ts`, `pwa.ts` —
  cliente de API, sessão de login, menu de navegação por papel, tipos de dados,
  lista de UFs, registro do PWA. Compartilhado por todas as telas.
- Qualquer `main.ts` dentro de `src/pages/<tela>/` — busca dados da API, valida
  formulário, faz a navegação entre telas.

Se precisar mudar algo em um `main.ts` (ex.: adicionar um campo novo no
formulário), tudo bem — só avise a Vanessa depois, porque isso também precisa bater
com o que o backend espera.

## 4. Estrutura completa da pasta `frontend/`

```
frontend/
├── index.html            <- só redireciona para a primeira tela (não é uma tela em si)
├── vite.config.ts         <- configuração do Vite (build/servidor local)
├── package.json            <- dependências e comandos (npm run dev / build)
├── tsconfig.json            <- configuração do TypeScript
├── .env.example               <- exemplo de variável de ambiente do frontend
├── public/                     <- arquivos servidos "como estão", sem passar pelo Vite
│   ├── manifest.json              manifesto do PWA (nome, ícone, cor do app)
│   ├── sw.js                       service worker (cache offline)
│   └── icons/icon.svg               ícone do app
└── src/
    ├── main.ts             <- decide se manda o usuário pro login ou pro dashboard
    ├── scripts/            <- código compartilhado por TODAS as telas (API, login, tipos)
    ├── styles/              <- CSS compartilhado por TODAS as telas (cores, botões, cards...)
    └── pages/               <- uma pasta por TELA do site (ver tabela na seção 6)
```

## 5. O que cada pasta/arquivo contém (com exemplo)

### `frontend/index.html`

Único arquivo HTML na raiz do frontend — não é uma tela, só redireciona quem abre o
site para `src/main.ts`. É aqui que fica o link do `manifest.json` do PWA e a cor da
barra de tema do navegador. Exemplo do conteúdo:

```html
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#152a54" />
<script type="module" src="/src/main.ts"></script>
```

### `frontend/vite.config.ts`

Configuração do Vite em modo multi-page: descobre automaticamente todo
`src/pages/*/index.html` e transforma cada um num "ponto de entrada" do build.
Também tem o proxy que redireciona chamadas `/api/...` para o backend rodando em
`localhost:3000` durante o desenvolvimento (evita problema de CORS local). Você não
precisa editar este arquivo ao criar uma tela nova — ele já descobre sozinho.

### `frontend/package.json`

Lista as dependências (`vite`, `typescript`, `fast-glob`) e os comandos disponíveis:

```json
"scripts": {
  "dev": "vite",          // roda o servidor local (localhost:5173)
  "build": "tsc && vite build",  // gera a versão de produção
  "preview": "vite preview"      // pré-visualiza o build de produção
}
```

### `frontend/tsconfig.json`

Configuração do TypeScript (o que ele valida, quais erros bloqueiam o build). Não
costuma precisar mexer aqui para estilização.

### `frontend/.env.example`

Exemplo de variável de ambiente usada pelo frontend:

```
VITE_API_URL=/api
```

Em desenvolvimento, o valor padrão (`/api`) já funciona sozinho com o proxy do
Vite. Só é preciso copiar para um arquivo `.env` de verdade se for apontar para um
backend rodando em outro endereço.

### `frontend/public/`

Arquivos servidos direto pelo navegador, sem passar pelo processamento do Vite —
tudo aqui vira acessível a partir da raiz do site (`/manifest.json`, `/sw.js`, etc.).

- **`manifest.json`** — o "manifesto" do PWA: nome do app, cores, e o ícone usado
  quando alguém instala o site como aplicativo no celular/desktop.
  ```json
  {
    "name": "StartMatch",
    "theme_color": "#152a54",
    "background_color": "#f5f7fa",
    "icons": [{ "src": "/icons/icon.svg", "sizes": "any", "type": "image/svg+xml" }]
  }
  ```
  Para trocar o nome ou as cores do "app instalado", é aqui.
- **`sw.js`** — o service worker: cacheia o HTML/CSS/JS do site para funcionar
  offline (estratégia "network-first" para navegação e chamadas de API, "cache-first"
  para o resto). Só entra em ação em produção (`npm run build`), não durante
  `npm run dev`.
- **`icons/icon.svg`** — o ícone do app, em SVG (escala para qualquer tamanho sem
  perder qualidade). Para trocar o ícone visual do StartMatch, troque este
  arquivo (mantendo o nome `icon.svg` ou atualizando a referência em
  `manifest.json`).

### `frontend/src/main.ts`

Ponto de entrada carregado pelo `index.html` da raiz. Registra o service worker do
PWA e decide para onde mandar o usuário: dashboard do seu tipo de conta (se já
estiver logado) ou a tela de onboarding (se não estiver).

### `frontend/src/scripts/` (lógica compartilhada — evite mexer)

| Arquivo | O que faz |
|---|---|
| `api.ts` | Toda chamada de rede do frontend passa por aqui (`api.get`, `api.post`...). Injeta o token de login automaticamente e trata erro de sessão expirada. |
| `auth.ts` | Login, logout, e `requireAuth([...])` — chamada no topo de quase todo `main.ts` para proteger a tela. |
| `nav.ts` | Menu de navegação (`renderNav(...)`) de toda tela autenticada — um mapa único por papel (startup/investidor/mentor/admin), seguindo o fluxograma de navegação da designer. |
| `types.ts` | Só definições de tipos do TypeScript (formato dos dados de Startup, Investidor, Match, etc.), sem lógica. |
| `ufs.ts` | Lista das siglas de estado brasileiras, usada nos campos "UF". |
| `pwa.ts` | Registra o service worker (`public/sw.js`) em produção. |

### `frontend/src/styles/` (aqui é onde você mexe para estilizar)

| Arquivo | O que contém |
|---|---|
| `variables.css` | Paleta de cores e variáveis de espaçamento/tipografia — **comece por aqui**. |
| `global.css` | Reset do navegador + classes utilitárias de layout (`.container`, `.stack`, `.grid`). |
| `components.css` | Aparência dos componentes reutilizados: botões, cards, campos de formulário, badges, navbar. |

### `frontend/src/pages/` (uma pasta por tela)

Cada tela é uma pasta com um `index.html` (estrutura) e um `main.ts` (lógica).
Todo `index.html` de tela carrega os três CSS acima, nessa ordem, e termina com
`<script type="module" src="./main.ts"></script>`.

A lista abaixo já segue a ordem do fluxograma de navegação da designer, com o
nome exato de cada tela no fluxograma ao lado da pasta correspondente.

**Área pública (sem login):**

| Pasta | Tela | O que tem de especial |
|---|---|---|
| `home` | Home | Primeira tela do site — apresentação + CTAs de criar conta/entrar |
| `sobre` | Sobre | Missão, problema/solução, ecossistema Porto Digital |
| `como-funciona` | Como funciona | Passo a passo do fluxo principal, do cadastro ao match |
| `recursos` | Recursos | Grade de recursos em destaque da plataforma |
| `planos` | Planos | Tabela pública de preços (Startup/Investidor/Mentor) |

**Autenticação:**

| Pasta | Tela | O que tem de especial |
|---|---|---|
| `onboarding` | Escolha do perfil | 3 botões (startup/investidor/mentor) + card informativo de Admin (sem autocadastro) |
| `login` | Login | Formulário de e-mail + senha |
| `cadastro` | Criação de conta | Nome/e-mail/senha + aceite de termos (LGPD) |

**Startup / Investidor:**

| Pasta | Tela | O que tem de especial |
|---|---|---|
| `cadastro-startup` | Perfil da startup | Formulário longo + seleção de segmentos com "principal" |
| `cadastro-investidor` | Perfil do investidor | Formulário longo + segmentos com prioridade numérica |
| `dashboard-startup` | Painel da startup | Resumo do perfil, sugestões de investidores, interesses recebidos |
| `dashboard-investidor` | Painel do investidor | Resumo do perfil, sugestões e oportunidades de startups |
| `busca` | Busca e filtros | Uma tela serve os dois lados (startup ou investidor), com paginação |
| `interesses` | Interesses | Enviados + recebidos, também compartilhada entre os dois papéis |
| `perfil` | Perfil detalhado | Tela genérica (lê `?tipo=` e `?id=` da URL) + botão "Tenho interesse" |
| `matches` | Lista de matches | Conexões confirmadas, cada card leva para a conversa |
| `mensagens` | Conversas e chat | Layout de duas colunas, CSS próprio no `<style>` do `index.html` |
| `mentorias` | Mentorias (Startup) | Vitrine de mentores; botão de solicitar sessão desabilitado (sem backend de agendamento) |
| `relatorios` | Relatórios (Investidor) | Métricas calculadas a partir de `/interests/sent` e `/matches` |
| `canvas` | Business Model Canvas | Só para startups — 4 campos de texto longo |
| `plano` | Plano / Plano e assinatura | Plano atual (leitura) + comparação; upgrade desabilitado (cobrança é 2ª entrega) |

**Mentor:**

| Pasta | Tela | O que tem de especial |
|---|---|---|
| `cadastro-mentor` | Perfil do mentor | Inclui o checkbox de vínculo com Porto Digital (desconto) |
| `dashboard-mentor` | Dashboard do mentor | Resumo do perfil + atalhos para as telas abaixo |
| `agenda` | Agenda | Disponibilidade cadastrada; lista de sessões ainda vazia |
| `solicitacoes` | Solicitações | Estrutura pronta, sem dados (sem backend de solicitação de mentoria) |
| `historico-mentorias` | Histórico + Horas realizadas | Os dois itens do fluxograma combinados numa tela só |
| `certificados` | Certificados | Exportação desabilitada até existir histórico de sessões |

**Administrador:**

| Pasta | Tela | O que tem de especial |
|---|---|---|
| `dashboard-admin` | Dashboard geral | Indicadores reais via `GET /admin/metrics` (endpoint novo) |
| `admin-usuarios` | Gestão de usuários | Lista via `GET /users` (endpoint novo, admin-only) |
| `admin-planos` | Gestão de planos | Distribuição de planos (mesmo endpoint de métricas) |
| `admin-relatorios` | Relatórios | Detalhamento por tipo de usuário / estágio de startup |
| `admin-lgpd` | Governança e LGPD | Conteúdo de referência estático sobre governança de dados/LGPD |
| `admin-auditoria` | Auditoria | Placeholder — depende de log de auditoria, ainda inexistente |

**Comum a todos os papéis:**

| Pasta | Tela | O que tem de especial |
|---|---|---|
| `configuracoes` | Configurações | Conta e avaliação beta; menu de navegação muda conforme o papel (via `scripts/nav.ts`) |

## 6. Regra de ouro ao editar HTML

Cada elemento com `id="..."` é usado pelo `main.ts` da mesma pasta para ler valores
ou preencher conteúdo. Você pode mover, estilizar e reorganizar esses elementos à
vontade — **só não mude nem remova**:

- o atributo `id` de um elemento que o `main.ts` procura (ex.:
  `document.getElementById('form-login')`);
- o atributo `name` dos campos de formulário (usado por `FormData` no envio);
- a linha `<script type="module" src="./main.ts"></script>` no final do `<body>`.

## 7. Paleta de cores atual (`src/styles/variables.css`)

```css
--color-primary: #152a54;       /* azul-marinho — sidebar, cabeçalhos, botões primários */
--color-primary-light: #24407c;
--color-accent: #ff6b35;        /* laranja — CTAs, "Tenho Interesse", "Match!" */
--color-accent-light: #ff8f66;
--color-bg: #f5f7fa;            /* fundo geral */
--color-surface: #ffffff;       /* cards, formulários */
--color-border: #e2e5ea;
--color-text: #1a1a2e;
--color-text-muted: #6b7280;
--color-success: #2ecc71;       /* match confirmado */
--color-warning: #f5a623;
--color-error: #e74c3c;
--font-family: 'Inter', system-ui, sans-serif;
```

## 8. Como adicionar uma tela nova

Crie uma pasta em `frontend/src/pages/<nome-da-tela>/` com um `index.html` e um
`main.ts`. O `vite.config.ts` descobre telas novas automaticamente — não precisa
editar nenhuma configuração, só rodar `npm run dev` de novo se o servidor já
estivesse ligado.

## 9. Como rodar o projeto localmente


```
cd frontend
npm install
npm run dev
```

Abre em `http://localhost:5173`. Para as chamadas de API funcionarem de verdade, o
backend também precisa estar rodando (peça pra Vanessa te ajudar a subir o
`backend/` com Docker/PostgreSQL) — ou trabalhe só na estilização olhando o HTML
estático mesmo sem dados reais.

## 10. Prompt sugerido para pedir ajuda de estilização a uma IA

Cole isto junto com o arquivo `index.html` da tela que quiser mexer (e o
`variables.css` da seção 7, se a IA não tiver acesso ao projeto inteiro):

```
Estou estilizando uma PWA em HTML + CSS + TypeScript puro (sem framework), feita com Vite
em modo multi-page. A paleta de cores e os tokens estão em variables.css (colei acima).
Quero estilizar a tela X (arquivo index.html colado abaixo) mantendo os ids e o script
main.ts como estão — só quero sugestões de CSS/HTML para deixar mais bonito e responsivo.
```

## 11. Padrões que se repetem em quase todo `main.ts`

Para não se perder lendo os arquivos comentados, vale saber que praticamente todo
`main.ts` de tela protegida segue o mesmo esqueleto:

1. `requireAuth(['startup'])` (ou outro papel) logo no topo — se a pessoa não devia
   estar ali, ela é redirecionada antes de qualquer coisa acontecer na tela.
2. Uma função `init()` assíncrona que busca os dados da API (`api.get(...)`) e
   preenche a tela — normalmente escrevendo HTML diretamente num elemento via
   `.innerHTML`.
3. Um bloco `try/catch` (ou `.catch()`) que mostra uma mensagem de erro amigável em
   um `<p class="form-error">` caso a chamada à API falhe.
4. Formulários usam `FormData` para ler os campos preenchidos e enviam com
   `api.post(...)` ou `api.put(...)`.

## 12. Comentários dentro do código

Todos os arquivos do `frontend/` (HTML, TS e CSS) já têm comentários explicando o
que cada trecho faz — no topo de cada arquivo, um bloco de comentário identifica de
qual tela ele é (ex.: `// Tela: Login — lógica`) e, ao longo do arquivo, comentários
menores explicam trechos específicos (ex.: por que um campo é somente leitura, o
que um cálculo faz). Se estiver com dúvida sobre um arquivo específico, abra-o
primeiro — o comentário do topo já resume o que ele faz antes de você ler o
código.

## 13. Dúvidas

Este guia cobre tudo que é preciso para estilizar qualquer tela do
`frontend/` — estrutura de pastas, o que cada arquivo faz, o que é seguro
editar, a paleta de cores e o fluxo de navegação completo (seção 5). Alguma
dúvida que não esteja aqui, é só perguntar direto pra Vanessa.

Para entender o projeto como um todo (modelo de negócio, arquitetura técnica
completa e o que já está pronto de cada entrega da disciplina), veja a pasta
`docs/` na raiz do projeto — não é necessário pra estilizar, só contexto
extra se tiver curiosidade.
