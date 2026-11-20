// Testes dos 4 cenários da atividade de IA (compatível, incompatível,
// contraditório e insuficiente) e de casos extras das regras.
import {
  EntradaAnalise,
  justificativaPorRegras,
  verificarRegras,
} from './compatibility-rules';

const base = (): EntradaAnalise => ({
  startup: {
    nome: 'Pulso Cultural',
    cidade: 'Recife',
    uf: 'PE',
    segmentos: ['Economia criativa', 'Software'],
    estagio: 'mvp',
    valorPretendido: 120000,
    cnpj: '11.111.111/0001-11',
  },
  investidor: {
    nome: 'Investidor I01',
    cidade: 'Recife',
    uf: 'PE',
    segmentos: ['Economia criativa'],
    estagiosAceitos: ['mvp', 'operacao'],
    faixaMin: 100000,
    faixaMax: 200000,
    exigeCnpjAtivo: true,
  },
  consultaCnpj: { situacao: 'ativa', fonte: 'Receita Federal (simulada)', data: '20/11/2026' },
  documento: null,
});

describe('verificarRegras', () => {
  it('Teste 1 - compatível: sugere conversa e pede confirmação ao investidor', () => {
    const r = verificarRegras(base());
    expect(r.decisao).toBe('sugerir_conversa');
    expect(r.regras.filter((x) => x.eliminatoria).every((x) => x.resultado === 'atende')).toBe(true);
    expect(r.pendencias.join(' ')).toMatch(/Confirmar com o investidor/);
  });

  it('Teste 2 - incompatível: estágio exclui a startup', () => {
    const e = base();
    e.investidor.estagiosAceitos = ['scale_up'];
    const r = verificarRegras(e);
    expect(r.decisao).toBe('nao_recomendar');
    expect(r.regras.find((x) => x.codigo === 'R1')?.resultado).toBe('nao_atende');
  });

  it('Teste 3 - contraditório: registra o conflito e encaminha para revisão', () => {
    const e = base();
    e.documento = { estagioDeclarado: 'ideacao', trecho: 'Estamos na fase de ideação' };
    const r = verificarRegras(e);
    expect(r.decisao).toBe('pendencia');
    expect(r.regras.find((x) => x.codigo === 'R6')?.resultado).toBe('conflito');
    expect(r.regras.find((x) => x.codigo === 'R1')?.resultado).toBe('conflito');
    expect(r.evidencias.join(' ')).toMatch(/ideação/);
  });

  it('Teste 4 - insuficiente: sem valor, suspende a decisão sobre a faixa', () => {
    const e = base();
    e.startup.valorPretendido = null;
    const r = verificarRegras(e);
    expect(r.decisao).toBe('pendencia');
    expect(r.regras.find((x) => x.codigo === 'R3')?.resultado).toBe('pendente');
    expect(r.pendencias.join(' ')).toMatch(/valor pretendido/);
  });

  it('sem segmento em comum não recomenda', () => {
    const e = base();
    e.investidor.segmentos = ['Agrotech'];
    expect(verificarRegras(e).decisao).toBe('nao_recomendar');
  });

  it('segmentos comparam sem diferenciar acento ou maiúsculas', () => {
    const e = base();
    e.startup.segmentos = ['ECONOMIA CRIATIVÁ'.replace('Á', 'A')];
    e.investidor.segmentos = ['economia criativa'];
    expect(verificarRegras(e).regras.find((x) => x.codigo === 'R2')?.resultado).toBe('atende');
  });

  it('valor até 20% fora da faixa é só atenção; acima disso exclui', () => {
    const perto = base();
    perto.startup.valorPretendido = 210000;
    const rp = verificarRegras(perto);
    expect(rp.regras.find((x) => x.codigo === 'R3')?.resultado).toBe('atencao');
    expect(rp.decisao).toBe('sugerir_conversa');

    const longe = base();
    longe.startup.valorPretendido = 400000;
    expect(verificarRegras(longe).decisao).toBe('nao_recomendar');
  });

  it('CNPJ baixado exclui; não consultado gera pendência', () => {
    const baixada = base();
    baixada.consultaCnpj = { situacao: 'baixada', fonte: 'x', data: 'y' };
    expect(verificarRegras(baixada).decisao).toBe('nao_recomendar');

    const sem = base();
    sem.consultaCnpj = null;
    const r = verificarRegras(sem);
    expect(r.decisao).toBe('pendencia');
    expect(r.regras.find((x) => x.codigo === 'R5')?.resultado).toBe('pendente');
  });

  it('localização diferente não elimina', () => {
    const e = base();
    e.investidor.uf = 'SP';
    const r = verificarRegras(e);
    expect(r.regras.find((x) => x.codigo === 'R4')?.resultado).toBe('atencao');
    expect(r.decisao).toBe('sugerir_conversa');
  });

  it('justificativa por regras existe para os três tipos de decisão', () => {
    const a = verificarRegras(base());
    expect(justificativaPorRegras(a, 'Pulso Cultural')).toMatch(/conversa inicial/);

    const e = base();
    e.investidor.estagiosAceitos = ['scale_up'];
    expect(justificativaPorRegras(verificarRegras(e), 'Pulso Cultural')).toMatch(/não é recomendada/);

    const p = base();
    p.startup.valorPretendido = null;
    expect(justificativaPorRegras(verificarRegras(p), 'Pulso Cultural')).toMatch(/pendente/);
  });
});
