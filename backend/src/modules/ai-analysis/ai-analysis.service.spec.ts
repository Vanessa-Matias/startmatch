// Testes do serviço: usa a IA quando há chave e cai nas regras quando não há ou
// quando a IA falha. Nenhuma chamada de rede real é feita (fetch é simulado).
import { ConfigService } from '@nestjs/config';
import { AiAnalysisService } from './ai-analysis.service';
import {
  AnaliseCompatibilidadeDto,
  RecomendarStartupsDto,
} from './dto/analise-compatibilidade.dto';

const dto = (): AnaliseCompatibilidadeDto =>
  ({
    startup: {
      nome: 'Pulso Cultural',
      cidade: 'Recife',
      uf: 'PE',
      segmentos: ['Economia criativa'],
      estagio: 'mvp',
      valorPretendido: 120000,
      cnpj: '11.111.111/0001-11',
    },
    investidor: {
      segmentos: ['Economia criativa'],
      estagiosAceitos: ['mvp'],
      faixaMin: 100000,
      faixaMax: 200000,
      uf: 'PE',
      exigeCnpjAtivo: true,
    },
    consultaCnpj: { situacao: 'ativa', fonte: 'Receita (simulada)', data: '20/11/2026' },
  }) as AnaliseCompatibilidadeDto;

const config = (valores: Record<string, string>) =>
  ({ get: (k: string) => valores[k] }) as unknown as ConfigService;

describe('AiAnalysisService', () => {
  const fetchOriginal = global.fetch;
  afterEach(() => {
    global.fetch = fetchOriginal;
  });

  it('sem chave: usa as regras e avisa', async () => {
    const s = new AiAnalysisService(config({}));
    const r = await s.analisar(1, dto());
    expect(r.origemJustificativa).toBe('regras');
    expect(r.aviso).toMatch(/não configurada/);
    expect(r.decisao).toBe('sugerir_conversa');
  });

  it('com chave: usa o texto da IA e não muda a decisão', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'Texto da IA.' } }] }),
    }) as unknown as typeof fetch;
    const s = new AiAnalysisService(config({ GROQ_API_KEY: 'chave-de-teste' }));
    const r = await s.analisar(1, dto());
    expect(r.origemJustificativa).toBe('ia');
    expect(r.justificativa).toBe('Texto da IA.');
    expect(r.decisao).toBe('sugerir_conversa');
    const chamada = (global.fetch as jest.Mock).mock.calls[0];
    expect(chamada[1].headers.Authorization).toBe('Bearer chave-de-teste');
  });

  it('IA com erro: cai nas regras', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 429 }) as unknown as typeof fetch;
    const s = new AiAnalysisService(config({ GROQ_API_KEY: 'chave-de-teste' }));
    const r = await s.analisar(1, dto());
    expect(r.origemJustificativa).toBe('regras');
    expect(r.aviso).toMatch(/não respondeu/);
  });

  it('limita o número de análises por minuto', async () => {
    const s = new AiAnalysisService(config({}));
    for (let i = 0; i < 3; i++) await s.analisar(7, dto());
    await expect(s.analisar(7, dto())).rejects.toThrow(/Muitas análises/);
  });

  // ---- recomendação de várias startups ----
  const recomendacao = (): RecomendarStartupsDto =>
    ({
      investidor: {
        segmentos: ['Fintech'],
        estagiosAceitos: ['mvp', 'operacao'],
        faixaMin: 100000,
        faixaMax: 200000,
        uf: 'PE',
        exigeCnpjAtivo: false,
      },
      startups: [
        { id: 1, nome: 'Fora do segmento', uf: 'PE', segmentos: ['Agtech'], estagio: 'mvp', valorPretendido: 150000 },
        { id: 2, nome: 'Boa', uf: 'PE', segmentos: ['Fintech'], estagio: 'mvp', valorPretendido: 150000 },
        { id: 3, nome: 'Sem valor', uf: 'PE', segmentos: ['Fintech'], estagio: 'mvp', valorPretendido: null },
        { id: 4, nome: 'Estágio errado', uf: 'PE', segmentos: ['Fintech'], estagio: 'ideacao', valorPretendido: 150000 },
      ],
    }) as unknown as RecomendarStartupsDto;

  it('recomendar: ordena (sugere primeiro), conta e tira as não recomendadas', async () => {
    const s = new AiAnalysisService(config({}));
    const r = await s.recomendar(2, recomendacao());
    expect(r.analisadas).toBe(4);
    expect(r.resumo.sugerir_conversa).toBe(1);
    expect(r.resumo.pendencia).toBe(1);
    expect(r.resumo.nao_recomendar).toBe(2);
    expect(r.destaques.length).toBe(2);
    expect(r.destaques[0].nome).toBe('Boa');
    expect(r.destaques[1].nome).toBe('Sem valor');
    expect(r.destaques[0].origemJustificativa).toBe('regras');
    expect(r.aviso).toMatch(/não configurada/);
  });

  it('recomendar: usa uma chamada de IA com JSON e cai nas regras para quem faltar', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'Aqui está: [{"id": 2, "justificativa": "Texto da IA para a Boa."}]' } }],
      }),
    }) as unknown as typeof fetch;
    const s = new AiAnalysisService(config({ GROQ_API_KEY: 'chave-de-teste' }));
    const r = await s.recomendar(3, recomendacao());
    expect((global.fetch as jest.Mock).mock.calls.length).toBe(1);
    expect(r.destaques[0].justificativa).toBe('Texto da IA para a Boa.');
    expect(r.destaques[0].origemJustificativa).toBe('ia');
    expect(r.destaques[1].origemJustificativa).toBe('regras');
    expect(r.modelo).toBe('openai/gpt-oss-120b');
  });

  it('recomendar: resposta da IA fora do formato cai nas regras com aviso', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'sem json' } }] }),
    }) as unknown as typeof fetch;
    const s = new AiAnalysisService(config({ GROQ_API_KEY: 'chave-de-teste' }));
    const r = await s.recomendar(4, recomendacao());
    expect(r.destaques[0].origemJustificativa).toBe('regras');
    expect(r.aviso).toMatch(/formato inesperado/);
  });

  it('recomendar com "mostrar": devolve só a decisão pedida (inclusive não recomendadas)', async () => {
    const s = new AiAnalysisService(config({}));
    const dto = { ...recomendacao(), mostrar: 'nao_recomendar' } as unknown as RecomendarStartupsDto;
    const r = await s.recomendar(5, dto);
    expect(r.destaques.map((d) => d.nome).sort()).toEqual(['Estágio errado', 'Fora do segmento']);
    expect(r.destaques.every((d) => d.decisao === 'nao_recomendar')).toBe(true);
  });

  it('recomendar: documento que contradiz a ficha vira pendência', async () => {
    const s = new AiAnalysisService(config({}));
    const base = recomendacao() as unknown as { startups: Record<string, unknown>[] };
    const dto = {
      ...base,
      startups: [{ ...base.startups[1], documento: { estagioDeclarado: 'ideacao', trecho: 'Estamos em ideação.' } }],
      mostrar: 'pendencia',
    } as unknown as RecomendarStartupsDto;
    const r = await s.recomendar(6, dto);
    expect(r.destaques.length).toBe(1);
    expect(r.destaques[0].decisao).toBe('pendencia');
    expect(r.destaques[0].regras.some((x) => x.codigo === 'R6' && x.resultado === 'conflito')).toBe(true);
  });
});
