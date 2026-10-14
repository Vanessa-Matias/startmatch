# Modelo de Negócio — StartMatch

> Business Model Canvas, proposta de valor, público-alvo e estratégia de
> monetização do StartMatch. Escrito para atender aos itens "Construção
> inicial do Business Model Canvas", "Definição preliminar da proposta de
> valor e público-alvo" (1ª entrega) e "Finalização do Business Model Canvas",
> "Desenvolvimento do plano de negócio", "Definição da estratégia de
> monetização" e "Desenvolvimento de estratégia inicial de Go-to-Market"
> (2ª entrega).

## 1. O produto

**StartMatch** é uma plataforma de matchmaking (SaaS) que conecta startups
nascentes do ecossistema do Porto Digital (Recife/PE) a investidores-anjo,
fundos e mentores interessados no Nordeste — reduzindo o tempo e o atrito de
encontrar a contraparte certa (startup ↔ capital ↔ mentoria), com um fluxo de
perfil → busca/filtros → interesse → match → conversa.

## 2. Proposta de valor

- **Para startups:** visibilidade estruturada diante de investidores e
  mentores que realmente combinam com seu segmento e estágio, sem depender só
  de indicação pessoal ou eventos de networking.
- **Para investidores e mentores:** um funil filtrado de oportunidades
  (startups) já classificadas por segmento, estágio de maturidade, tração e
  faixa de investimento pretendida — menos tempo garimpando, mais tempo
  avaliando.
- **Para o ecossistema do Porto Digital:** um canal comum que fortalece a
  economia criativa local, com indicadores agregados (nº de startups, matches,
  investimento em negociação) que ajudam a medir o próprio crescimento do
  ecossistema.

## 3. Público-alvo

| Segmento | Perfil |
|---|---|
| Startups | Negócios em estágio de ideação até scale-up, do ecossistema de Porto Digital e regiões próximas, buscando investimento e/ou mentoria |
| Investidores-anjo | Pessoas físicas ou fundos com tese de investimento definida, ticket entre dezenas de milhares e alguns milhões de reais, foco Nordeste |
| Mentores | Profissionais experientes (parte deles vinculados ao próprio Porto Digital, com condição especial de assinatura) dispostos a apoiar startups com conhecimento, não capital |

## 4. Business Model Canvas

| Bloco | Conteúdo |
|---|---|
| **Proposta de valor** | Matchmaking filtrado e qualificado entre startups e investidores/mentores do Nordeste, com dashboard de acompanhamento para os dois lados |
| **Segmentos de clientes** | Startups nascentes (ideação → scale-up); Investidores-anjo/fundos/corporate VC; Mentores independentes ou vinculados a empresas do Porto Digital |
| **Canais** | Aplicação web (PWA), parcerias institucionais com o Porto Digital e programas de aceleração locais, indicação entre usuários |
| **Relacionamento com clientes** | Autoatendimento via plataforma (self-service) + suporte para dúvidas de conta; conteúdo educativo ("Como funciona") para reduzir fricção de onboarding |
| **Fontes de receita** | Assinaturas recorrentes em 3 níveis (Básico/Plus/Premium) para startups e investidores — ver seção 5 |
| **Recursos principais** | Algoritmo de compatibilidade (matchmaking), base de perfis validados, marca/confiança do ecossistema Porto Digital |
| **Atividades-chave** | Curadoria/validação de perfis, evolução do algoritmo de match, geração de indicadores para o ecossistema |
| **Parcerias principais** | Porto Digital (desconto para mentores vinculados), aceleradoras/incubadoras locais, associações de investidores-anjo do Nordeste |
| **Estrutura de custos** | Infraestrutura em nuvem (hospedagem, banco de dados), desenvolvimento e manutenção da plataforma, marketing de aquisição |

## 5. Planos e estratégia de monetização

A cobrança em si (integração de pagamento) é escopo da 2ª entrega — nesta
fase, os planos abaixo já estão definidos, exibidos na plataforma
(`planos/` — página pública, e `plano/` — tela do usuário logado) e usados
para diferenciar funcionalidades por nível de acesso:

**Startups**

| Plano | Preço | Inclui |
|---|---|---|
| Básico | Grátis | Perfil completo, aparece na busca dos investidores, interesses limitados por mês, Canvas simples |
| Plus | R$ 350/mês | Perfil em destaque, interesses ilimitados, métricas de visualização, 1 mentoria/mês incluída |
| Premium | R$ 500/mês | Tudo do Plus + prioridade no algoritmo de match, relatório de compatibilidade, selo "verificado", 3 mentorias/mês incluídas |

**Investidores**

| Plano | Preço | Inclui |
|---|---|---|
| Básico | Grátis | Busca com filtros simples (segmento, estágio), interesses limitados por mês |
| Plus | R$ 400/mês | Filtros avançados (faixa de investimento, tração, localização), sugestões automáticas, interesses ilimitados |
| Premium | R$ 600/mês | Tese estruturada, acesso antecipado a startups do seu perfil, relatórios agregados do ecossistema, matchmaking assistido por mentor |

**Mentores**

| Plano | Preço | Inclui |
|---|---|---|
| Independente | R$ 200/mês | Vitrine de startups, certificados comprovando as mentorias, destaque de perfil nas indicações de mentorias extras |
| Rede parceira | R$ 160/mês (20% de desconto) | Tudo do independente + badge exclusivo (campo `vinculoPortoDigital` no cadastro de mentor) |

**Mentorias extras (avulsas)** — startups Plus/Premium podem comprar pacotes
Básico com 5 mentorias online de 30 min (R$ 400, R$ 80 cada), Start com 8
mentorias de 1h (R$ 750, com resumo e próximos passos após cada sessão) ou
Premium com 10 mentorias de 1h (R$ 1.200, presenciais ou online, de segunda a
sexta) além das incluídas no
plano. Parte do valor é repassada ao mentor, o que gera receita para a
plataforma e renda para o mentor. Valores dos pacotes são sugestão inicial.

## 6. Estratégia inicial de Go-to-Market

1. **Fase piloto (beta fechado):** convite a startups e investidores já
   conhecidos do ecossistema Porto Digital, usando a avaliação beta
   (`beta-evaluation`) já implementada para coletar feedback estruturado de
   usabilidade e utilidade.
2. **Parcerias institucionais:** aproximação com o próprio Porto Digital,
   aceleradoras e associações de investidores-anjo do Nordeste como canal de
   aquisição inicial (menor custo de aquisição que mídia paga).
3. **Conteúdo e prova social:** página pública "Como funciona" e casos de
   sucesso (matches reais) como material de conversão para novos cadastros.
4. **Monetização progressiva:** lançamento com plano Básico gratuito para
   validar volume e qualidade dos matches antes de pressionar conversão para
   os planos pagos (Plus/Premium) — decisão consciente para priorizar
   crescimento de base na fase de validação (2ª entrega).
