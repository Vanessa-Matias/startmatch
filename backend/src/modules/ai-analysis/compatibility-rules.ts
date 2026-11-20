// compatibility-rules.ts
// =======================
// PASSO "CÓDIGO" do módulo de IA (Análise de compatibilidade).
// Aqui as regras são decididas por programa, não pela IA: dada a ficha da
// startup e a do investidor, esta função verifica cada regra, junta evidências
// e escolhe a decisão. A IA (ai-analysis.service.ts) só escreve a justificativa
// em cima do que foi verificado aqui — ela nunca muda a decisão.
//
// Não acessa banco de dados nem rede: é uma função pura (fácil de testar).

export type EstagioChave = 'ideacao' | 'mvp' | 'operacao' | 'scale_up';

export const ESTAGIO_LABEL: Record<EstagioChave, string> = {
  ideacao: 'Ideação',
  mvp: 'MVP',
  operacao: 'Operação',
  scale_up: 'Expansão (scale-up)',
};

export type SituacaoCnpj =
  | 'ativa'
  | 'baixada'
  | 'suspensa'
  | 'inapta'
  | 'nao_consultada';

export interface FichaStartup {
  nome: string;
  cidade?: string | null;
  uf?: string | null;
  segmentos: string[];
  estagio?: EstagioChave | null;
  valorPretendido?: number | null;
  cnpj?: string | null;
}

export interface FichaInvestidor {
  nome?: string | null;
  cidade?: string | null;
  uf?: string | null;
  segmentos: string[];
  estagiosAceitos: EstagioChave[];
  faixaMin?: number | null;
  faixaMax?: number | null;
  exigeCnpjAtivo: boolean;
}

// Consulta externa (CNPJ / Receita Federal). Nesta versão é SIMULADA: o
// resultado vem informado na própria requisição; não há chamada real.
export interface ConsultaCnpj {
  situacao: SituacaoCnpj;
  fonte: string;
  data: string;
}

// Outro documento da startup (ex.: pitch) que pode contradizer a ficha.
export interface DocumentoStartup {
  estagioDeclarado?: EstagioChave | null;
  trecho?: string | null;
}

export interface EntradaAnalise {
  startup: FichaStartup;
  investidor: FichaInvestidor;
  consultaCnpj?: ConsultaCnpj | null;
  documento?: DocumentoStartup | null;
}

export type Decisao = 'sugerir_conversa' | 'nao_recomendar' | 'pendencia';

export type ResultadoRegra =
  | 'atende'
  | 'nao_atende'
  | 'atencao'
  | 'pendente'
  | 'conflito';

export interface RegraVerificada {
  codigo: string;
  nome: string;
  eliminatoria: boolean;
  startup: string;
  investidor: string;
  resultado: ResultadoRegra;
  detalhe: string;
}

export interface Verificacao {
  decisao: Decisao;
  regras: RegraVerificada[];
  pendencias: string[];
  evidencias: string[];
}

// Tolerância da regra de valor: até 20% fora da faixa é só "atenção"
// (mesma ideia do score de compatibilidade em matches/compatibility-score.ts).
const TOLERANCIA_VALOR = 0.2;

const SITUACAO_LABEL: Record<SituacaoCnpj, string> = {
  ativa: 'Ativa',
  baixada: 'Baixada',
  suspensa: 'Suspensa',
  inapta: 'Inapta',
  nao_consultada: 'Não consultada',
};

function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toLowerCase();
}

function brl(valor: number): string {
  return `R$ ${valor.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`;
}

function temValor(v: number | null | undefined): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

export const DECISAO_LABEL: Record<Decisao, string> = {
  sugerir_conversa: 'Sugerir conversa inicial',
  nao_recomendar: 'Não recomendar',
  pendencia: 'Pendência / revisão humana',
};

export function verificarRegras(entrada: EntradaAnalise): Verificacao {
  const { startup, investidor, consultaCnpj, documento } = entrada;
  const regras: RegraVerificada[] = [];
  const pendencias: string[] = [];
  const evidencias: string[] = [];

  // ---- R6 (calculada antes, pois afeta R1): consistência ficha x documento ----
  const conflitoEstagio =
    !!startup.estagio &&
    !!documento?.estagioDeclarado &&
    startup.estagio !== documento.estagioDeclarado;

  // ---- R1 Estágio (eliminatória) ----
  {
    const aceitos = investidor.estagiosAceitos.map((e) => ESTAGIO_LABEL[e]);
    const base = {
      codigo: 'R1',
      nome: 'Estágio da startup',
      eliminatoria: true,
      startup: startup.estagio ? ESTAGIO_LABEL[startup.estagio] : 'não informado',
      investidor: aceitos.length ? aceitos.join(', ') : 'não informado',
    };
    if (!startup.estagio || aceitos.length === 0) {
      regras.push({
        ...base,
        resultado: 'pendente',
        detalhe: !startup.estagio
          ? 'O estágio da startup não foi informado.'
          : 'O investidor não informou os estágios que aceita.',
      });
      pendencias.push(
        !startup.estagio
          ? 'Solicitar à startup o estágio de desenvolvimento.'
          : 'Informar os estágios que o investidor aceita.',
      );
    } else if (conflitoEstagio) {
      regras.push({
        ...base,
        resultado: 'conflito',
        detalhe:
          'O estágio da ficha é diferente do declarado no documento da startup (ver R6). A regra não foi aplicada até a revisão.',
      });
    } else if (investidor.estagiosAceitos.includes(startup.estagio)) {
      regras.push({
        ...base,
        resultado: 'atende',
        detalhe: 'O estágio da startup está entre os aceitos pelo investidor.',
      });
    } else {
      regras.push({
        ...base,
        resultado: 'nao_atende',
        detalhe:
          'Regra de exclusão: o estágio da startup não está entre os aceitos pelo investidor.',
      });
    }
    if (startup.estagio) {
      evidencias.push(`Ficha da startup: estágio "${ESTAGIO_LABEL[startup.estagio]}".`);
    }
    if (aceitos.length) {
      evidencias.push(`Ficha do investidor: estágios aceitos "${aceitos.join(', ')}".`);
    }
  }

  // ---- R2 Segmento (eliminatória) ----
  {
    const base = {
      codigo: 'R2',
      nome: 'Segmento em comum',
      eliminatoria: true,
      startup: startup.segmentos.join(', ') || 'não informado',
      investidor: investidor.segmentos.join(', ') || 'não informado',
    };
    if (startup.segmentos.length === 0 || investidor.segmentos.length === 0) {
      regras.push({
        ...base,
        resultado: 'pendente',
        detalhe:
          startup.segmentos.length === 0 && investidor.segmentos.length === 0
            ? 'Faltam os segmentos da startup e os do investidor.'
            : startup.segmentos.length === 0
              ? 'Falta informar os segmentos de atuação da startup.'
              : 'Falta informar os segmentos de interesse no perfil do investidor.',
      });
      if (startup.segmentos.length === 0) {
        pendencias.push('Informar os segmentos de atuação da startup.');
      }
      if (investidor.segmentos.length === 0) {
        pendencias.push('Informar os segmentos de interesse no perfil do investidor.');
      }
    } else {
      const doInvestidor = new Set(investidor.segmentos.map(normalizar));
      const comuns = startup.segmentos.filter((s) => doInvestidor.has(normalizar(s)));
      regras.push({
        ...base,
        resultado: comuns.length ? 'atende' : 'nao_atende',
        detalhe: comuns.length
          ? `Segmento(s) em comum: ${comuns.join(', ')}.`
          : 'Regra de exclusão: nenhum segmento em comum.',
      });
    }
  }

  // ---- R3 Faixa de valor (eliminatória se estiver muito fora) ----
  {
    const valor = startup.valorPretendido;
    const { faixaMin, faixaMax } = investidor;
    const base = {
      codigo: 'R3',
      nome: 'Valor pretendido x faixa do investidor',
      eliminatoria: true,
      startup: temValor(valor) ? brl(valor) : 'não informado',
      investidor:
        temValor(faixaMin) && temValor(faixaMax)
          ? `${brl(faixaMin)} a ${brl(faixaMax)}`
          : 'não informada',
    };
    if (!temValor(valor) || !temValor(faixaMin) || !temValor(faixaMax)) {
      regras.push({
        ...base,
        resultado: 'pendente',
        detalhe: !temValor(valor)
          ? 'O valor pretendido não foi informado; a decisão sobre a faixa fica suspensa.'
          : 'A faixa de investimento do investidor não foi informada.',
      });
      pendencias.push(
        !temValor(valor)
          ? 'Solicitar à startup o valor pretendido (decisão sobre a faixa suspensa).'
          : 'Informar a faixa de investimento do investidor.',
      );
    } else if (valor >= faixaMin && valor <= faixaMax) {
      regras.push({
        ...base,
        resultado: 'atende',
        detalhe: 'O valor pretendido está dentro da faixa declarada pelo investidor.',
      });
    } else {
      const distancia = Math.min(Math.abs(valor - faixaMin), Math.abs(valor - faixaMax));
      if (distancia <= valor * TOLERANCIA_VALOR) {
        regras.push({
          ...base,
          resultado: 'atencao',
          detalhe: 'O valor está fora da faixa, mas a até 20% dela.',
        });
        pendencias.push('Avaliar com o investidor se o valor, um pouco fora da faixa, é negociável.');
      } else {
        regras.push({
          ...base,
          resultado: 'nao_atende',
          detalhe: 'Regra de exclusão: o valor pretendido está mais de 20% fora da faixa do investidor.',
        });
      }
    }
    if (temValor(valor)) evidencias.push(`Ficha da startup: valor pretendido ${brl(valor)}.`);
    if (temValor(faixaMin) && temValor(faixaMax)) {
      evidencias.push(`Ficha do investidor: faixa de ${brl(faixaMin)} a ${brl(faixaMax)}.`);
    }
  }

  // ---- R4 Localização (não elimina) ----
  {
    const base = {
      codigo: 'R4',
      nome: 'Localização',
      eliminatoria: false,
      startup: [startup.cidade, startup.uf].filter(Boolean).join('/') || 'não informada',
      investidor: [investidor.cidade, investidor.uf].filter(Boolean).join('/') || 'não informada',
    };
    if (startup.uf && investidor.uf && normalizar(startup.uf) === normalizar(investidor.uf)) {
      regras.push({ ...base, resultado: 'atende', detalhe: 'Mesmo estado: ponto positivo.' });
    } else {
      regras.push({
        ...base,
        resultado: 'atencao',
        detalhe: 'Estados diferentes ou não informados. Não elimina.',
      });
    }
  }

  // ---- R5 Consulta externa (CNPJ) — simulada ----
  {
    const base = {
      codigo: 'R5',
      nome: 'Situação cadastral (CNPJ)',
      eliminatoria: true,
      startup: startup.cnpj ? 'CNPJ informado' : 'CNPJ não informado',
      investidor: investidor.exigeCnpjAtivo ? 'exige CNPJ ativo' : 'não exige',
    };
    const situacao = consultaCnpj?.situacao ?? 'nao_consultada';
    if (!investidor.exigeCnpjAtivo) {
      regras.push({ ...base, resultado: 'atende', detalhe: 'O investidor não exige CNPJ ativo.' });
    } else if (situacao === 'nao_consultada' || !startup.cnpj) {
      regras.push({
        ...base,
        resultado: 'pendente',
        detalhe: !startup.cnpj
          ? 'A startup não informou o CNPJ.'
          : 'A consulta ao CNPJ não foi realizada.',
      });
      pendencias.push('Consultar a situação cadastral do CNPJ da startup.');
    } else if (situacao === 'ativa') {
      regras.push({
        ...base,
        resultado: 'atende',
        detalhe: 'Consulta simulada: situação cadastral Ativa.',
      });
    } else {
      regras.push({
        ...base,
        resultado: 'nao_atende',
        detalhe: `Regra de exclusão: situação cadastral ${SITUACAO_LABEL[situacao]} (consulta simulada).`,
      });
    }
    if (consultaCnpj) {
      evidencias.push(
        `Consulta simulada (${consultaCnpj.fonte}, ${consultaCnpj.data}): situação ${SITUACAO_LABEL[consultaCnpj.situacao]}.`,
      );
    }
  }

  // ---- R6 Consistência ----
  {
    const base = {
      codigo: 'R6',
      nome: 'Consistência entre ficha e documento',
      eliminatoria: false,
      startup: startup.estagio ? `ficha: ${ESTAGIO_LABEL[startup.estagio]}` : 'ficha sem estágio',
      investidor: documento?.estagioDeclarado
        ? `documento: ${ESTAGIO_LABEL[documento.estagioDeclarado]}`
        : 'sem documento para comparar',
    };
    if (conflitoEstagio) {
      regras.push({
        ...base,
        resultado: 'conflito',
        detalhe:
          'A ficha e o documento da startup se contradizem quanto ao estágio. Encaminhar para revisão humana.',
      });
      pendencias.push(
        'Confirmar com a startup o estágio real e corrigir a informação divergente.',
      );
      if (documento?.trecho) evidencias.push(`Documento da startup: "${documento.trecho}"`);
    } else {
      regras.push({
        ...base,
        resultado: 'atende',
        detalhe: documento?.estagioDeclarado
          ? 'Ficha e documento coincidem.'
          : 'Nenhum documento adicional para comparar.',
      });
    }
  }

  // ---- Decisão ----
  const eliminada = regras.some((r) => r.eliminatoria && r.resultado === 'nao_atende');
  const temConflitoOuFalta = regras.some(
    (r) => r.resultado === 'conflito' || r.resultado === 'pendente',
  );

  let decisao: Decisao;
  if (eliminada) {
    decisao = 'nao_recomendar';
  } else if (temConflitoOuFalta) {
    decisao = 'pendencia';
  } else {
    decisao = 'sugerir_conversa';
    pendencias.push('Confirmar com o investidor o interesse e a disponibilidade para uma conversa.');
  }

  return { decisao, regras, pendencias, evidencias };
}

// Justificativa por modelo de texto — usada quando a IA não está disponível
// (sem chave, limite de uso, erro de rede). Mantém a tela útil na apresentação.
export function justificativaPorRegras(v: Verificacao, nomeStartup: string): string {
  const atende = v.regras.filter((r) => r.resultado === 'atende').map((r) => r.nome.toLowerCase());
  const exclusao = v.regras.find((r) => r.eliminatoria && r.resultado === 'nao_atende');
  const conflito = v.regras.find((r) => r.resultado === 'conflito' && r.codigo === 'R6');
  const falta = v.regras.filter((r) => r.resultado === 'pendente');

  if (v.decisao === 'nao_recomendar' && exclusao) {
    return `${nomeStartup} não é recomendada neste momento. ${exclusao.detalhe}`;
  }
  if (v.decisao === 'pendencia') {
    if (conflito) {
      return `A análise de ${nomeStartup} foi suspensa para revisão humana. ${conflito.detalhe}`;
    }
    return `A análise de ${nomeStartup} está pendente. Dados em falta: ${falta
      .map((r) => r.nome.toLowerCase())
      .join(', ')}. ${falta[0]?.detalhe ?? ''}`.trim();
  }
  return `${nomeStartup} atende às regras verificadas (${atende.join(', ')}). Sugere-se uma conversa inicial, sujeita à confirmação do investidor.`;
}

// Nota de 0 a 100 usada só para ORDENAR as startups na recomendação (a decisão
// continua sendo a das regras). Pesos: segmento 40, valor 30, estágio 20,
// localização 10. "Atenção" no valor vale metade.
export function pontuar(v: Verificacao): number {
  const r = (codigo: string) => v.regras.find((x) => x.codigo === codigo)?.resultado;
  let pontos = 0;
  if (r('R2') === 'atende') pontos += 40;
  if (r('R3') === 'atende') pontos += 30;
  else if (r('R3') === 'atencao') pontos += 15;
  if (r('R1') === 'atende') pontos += 20;
  if (r('R4') === 'atende') pontos += 10;
  return pontos;
}

const ORDEM_DECISAO: Record<Decisao, number> = {
  sugerir_conversa: 0,
  pendencia: 1,
  nao_recomendar: 2,
};

// Ordena: primeiro as que sugerem conversa, depois pendências, por fim as não
// recomendadas; dentro de cada grupo, maior nota primeiro.
export function compararParaRanking(
  a: { decisao: Decisao; score: number },
  b: { decisao: Decisao; score: number },
): number {
  return ORDEM_DECISAO[a.decisao] - ORDEM_DECISAO[b.decisao] || b.score - a.score;
}
