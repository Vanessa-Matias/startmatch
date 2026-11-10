export interface StartupCompatibilityInput {
  investimentoPretendido: number;
  cidade: string;
  uf: string;
  segmentos: { segmentoId: number; principal: boolean }[];
}

export interface InvestidorCompatibilityInput {
  investimentoMin: number;
  investimentoMax: number;
  cidade: string;
  uf: string;
  segmentos: { segmentoId: number; prioridade: number }[];
}

/**
 * Score determinístico 0–100: overlap de segmento (até 50), overlap de faixa de
 * investimento (até 30) e localização (até 20). Deliberadamente simples — a 1ª
 * entrega exclui "matchmaking com ranking avançado" do escopo.
 */
export function calculateCompatibilityScore(
  startup: StartupCompatibilityInput,
  investidor: InvestidorCompatibilityInput,
): number {
  // >> Calcula a nota de compatibilidade (0 a 100) entre startup e investidor.
  const shared = startup.segmentos.filter((s) =>
    investidor.segmentos.some((i) => i.segmentoId === s.segmentoId),
  );
  const principalShared = shared.some((s) => s.principal);
  const segmentScore = Math.min(
    50,
    shared.length * 15 + (principalShared ? 10 : 0),
  );
  // >> Segmentos em comum: até 50 pontos.

  const valor = startup.investimentoPretendido;
  const inRange =
    valor >= investidor.investimentoMin && valor <= investidor.investimentoMax;
  const nearRange =
    !inRange &&
    Math.min(
      Math.abs(valor - investidor.investimentoMin),
      Math.abs(valor - investidor.investimentoMax),
    ) <=
      valor * 0.2;
  const investmentScore = inRange ? 30 : nearRange ? 15 : 0;
  // >> Valor dentro da faixa do investidor: até 30 pontos.

  const sameUf = startup.uf === investidor.uf;
  const sameCidade =
    sameUf && startup.cidade.toLowerCase() === investidor.cidade.toLowerCase();
  const locationScore = sameCidade ? 20 : sameUf ? 10 : 0;
  // >> Mesma cidade e estado: até 20 pontos.

  return segmentScore + investmentScore + locationScore;
  // >> Soma tudo: esta é a nota do match.
}
