// Dados de DEMONSTRAÇÃO da tela de Eventos
// ===========================================
// A tela de Eventos é um "plus" opcional do projeto e NÃO usa o banco de dados:
// os eventos abaixo são reais (Recife), mas as startups inscritas de exemplo são
// fictícias, e tudo que o usuário fizer na tela (inscrever-se, cadastrar evento)
// fica salvo apenas no navegador (localStorage) — some se limpar os dados do site.

export interface EventoDemo {
  id: string;
  titulo: string;
  descricao: string;
  /** Texto exibido (ex.: "23 de setembro de 2026 · 09h às 18h"). */
  quando: string;
  /** Fim do evento (ISO) — usado só para saber se já aconteceu. */
  dataFim: string;
  local: string;
  imagem?: string;
  linkExterno?: string;
  destaque?: string;
  /** true = veio pronto no sistema; false = cadastrado pelo admin nesta demonstração. */
  base: boolean;
}

export interface InscricaoDemo {
  eventoId: string;
  nomeFantasia: string;
  detalhe: string;
  miniPitch: string;
  /** Nome do vídeo de mini-pitch (opcional). Na demo só o nome é guardado — o arquivo não sai do navegador. */
  videoNome?: string;
  /** true = startup de exemplo (fictícia); false = inscrição feita por quem está testando. */
  exemplo: boolean;
  usuarioId?: number;
}

export const EVENTOS_BASE: EventoDemo[] = [
  {
    id: 'mangue-bit-2026',
    titulo: 'Mangue.Bit 2026 — 10 anos',
    descricao:
      'O Mangue.Bit chega à sua edição de 10 anos ainda maior, mais ousado e definitivamente consolidado como um dos principais eventos de startups do Nordeste. Tema: "Da lama ao caos da inovação".',
    quando: '23 de setembro de 2026 · 09h às 18h',
    dataFim: '2026-09-23T18:00:00',
    local: 'Recife/PE',
    imagem: '/eventos/mangue-bit.png',
    linkExterno: 'https://movimentoeconomico.com.br/tag/mangue-bit/',
    destaque: 'Evento de startups do Nordeste',
    base: true,
  },
  {
    id: 'rec-n-play-2026',
    titulo: "REC'n'Play 2026",
    descricao:
      'O maior festival de conhecimento e criatividade do Recife, com tecnologia, inovação e espaço para startups se apresentarem. Inscrições gratuitas abertas — veja o futuro nascer.',
    quando: '11 a 14 de novembro de 2026',
    dataFim: '2026-11-14T23:59:00',
    local: 'Bairro do Recife — Recife/PE',
    imagem: '/eventos/rec-n-play.png',
    linkExterno:
      'https://www.diariodepernambuco.com.br/vida-urbana/2026/07/11718526-abertas-as-inscricoes-gratuitas-para-o-recnplay-2026.html',
    destaque: 'Inscrições gratuitas',
    base: true,
  },
];

// Startups FICTÍCIAS, só para a tela não ficar vazia na apresentação.
export const INSCRICOES_EXEMPLO: InscricaoDemo[] = [
  {
    eventoId: 'mangue-bit-2026',
    nomeFantasia: 'Nortech Soluções',
    detalhe: 'Startup de exemplo · Recife/PE',
    miniPitch: 'Automatizamos a gestão de pequenas indústrias do Nordeste com sensores de baixo custo.',
    exemplo: true,
  },
  {
    eventoId: 'mangue-bit-2026',
    nomeFantasia: 'VitalCare Health',
    detalhe: 'Startup de exemplo · Olinda/PE',
    miniPitch: 'Telemedicina para atendimento básico em cidades do interior, com triagem por IA.',
    exemplo: true,
  },
  {
    eventoId: 'rec-n-play-2026',
    nomeFantasia: 'Nortech Soluções',
    detalhe: 'Startup de exemplo · Recife/PE',
    miniPitch: 'Queremos apresentar nosso MVP e conversar com investidores-anjo do ecossistema.',
    exemplo: true,
  },
  {
    eventoId: 'rec-n-play-2026',
    nomeFantasia: 'VitalCare Health',
    detalhe: 'Startup de exemplo · Olinda/PE',
    miniPitch: 'Buscamos mentoria em regulação de saúde digital e parcerias com clínicas.',
    exemplo: true,
  },
];
