// usuarios-teste.seed.ts
// ========================
// Cria contas de teste — uma para cada papel (Startup, Investidor, Mentor,
// Admin) — com senha simples (123456), para a Agnes conseguir logar e estilizar
// TODAS as telas sem precisar se cadastrar na mão em cada uma. A Vanessa troca
// essas senhas antes de qualquer entrega/demonstração real.
//
// Como o e-mail é único por conta (regra do backend, não dá pra ter o mesmo
// e-mail em 4 contas diferentes), cada papel ganhou seu próprio e-mail dentro do
// mesmo padrão memorável: <papel>@teste.com — todos com a senha 123456.
//
// Idempotente: rodar `npm run seed` de novo não duplica nada (cada função checa
// se o registro já existe antes de criar).
//
// Contas criadas:
//   startup@teste.com     / 123456  -> perfil de Startup completo
//   startup2@teste.com    / 123456  -> 2º perfil de Startup (só pra Busca não ficar com 1 card só)
//   investidor@teste.com  / 123456  -> perfil de Investidor completo
//   investidor2@teste.com / 123456  -> 2º perfil de Investidor
//   mentor@teste.com      / 123456  -> perfil de Mentor (vinculado ao Porto Digital)
//   admin@teste.com       / 123456  -> conta admin (sem perfil de negócio)
//
// Além disso, cria um match real entre startup@teste.com e investidor@teste.com
// (com conversa + 2 mensagens), pra Matches/Mensagens/Interesses não aparecerem
// vazios na primeira vez que a Agnes abrir o site.

import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Usuario } from '../../modules/users/entities/usuario.entity';
import { Startup } from '../../modules/startups/entities/startup.entity';
import { StartupSegmento } from '../../modules/startups/entities/startup-segmento.entity';
import { Investidor } from '../../modules/investors/entities/investidor.entity';
import { InvestidorSegmento } from '../../modules/investors/entities/investidor-segmento.entity';
import { Mentor } from '../../modules/mentors/entities/mentor.entity';
import { Segmento } from '../../modules/segments/entities/segmento.entity';
import { Interesse } from '../../modules/interests/entities/interesse.entity';
import { Match } from '../../modules/matches/entities/match.entity';
import { Conversa } from '../../modules/conversations/entities/conversa.entity';
import { Mensagem } from '../../modules/conversations/entities/mensagem.entity';
import { calculateCompatibilityScore } from '../../modules/matches/compatibility-score';
import {
  TipoUsuario,
  EstagioStartup,
  TipoInvestidor,
  OrigemInteresse,
} from '../../common/enums';

const SENHA_PADRAO = '123456';

async function upsertUsuario(
  repo: Repository<Usuario>,
  dados: { nome: string; email: string; tipo: TipoUsuario },
): Promise<Usuario> {
  const existente = await repo.findOne({ where: { email: dados.email } });
  if (existente) return existente;

  const senhaHash = await bcrypt.hash(SENHA_PADRAO, 10);
  const usuario = repo.create({ ...dados, senhaHash });
  return repo.save(usuario);
}

async function segmentoPorSlug(repo: Repository<Segmento>, slug: string): Promise<Segmento> {
  const segmento = await repo.findOne({ where: { slug } });
  if (!segmento) {
    throw new Error(`Segmento "${slug}" não encontrado — rode o seed de segmentos primeiro.`);
  }
  return segmento;
}

export async function seedUsuariosTeste(dataSource: DataSource): Promise<void> {
  const usuarioRepo = dataSource.getRepository(Usuario);
  const startupRepo = dataSource.getRepository(Startup);
  const startupSegmentoRepo = dataSource.getRepository(StartupSegmento);
  const investidorRepo = dataSource.getRepository(Investidor);
  const investidorSegmentoRepo = dataSource.getRepository(InvestidorSegmento);
  const mentorRepo = dataSource.getRepository(Mentor);
  const segmentoRepo = dataSource.getRepository(Segmento);
  const interesseRepo = dataSource.getRepository(Interesse);
  const matchRepo = dataSource.getRepository(Match);
  const conversaRepo = dataSource.getRepository(Conversa);
  const mensagemRepo = dataSource.getRepository(Mensagem);

  const fintech = await segmentoPorSlug(segmentoRepo, 'fintech');
  const saasB2b = await segmentoPorSlug(segmentoRepo, 'saas-b2b');
  const healthtech = await segmentoPorSlug(segmentoRepo, 'healthtech');

  // ---------- Usuários ----------
  const usuarioStartup = await upsertUsuario(usuarioRepo, {
    nome: 'Startup Teste',
    email: 'startup@teste.com',
    tipo: TipoUsuario.STARTUP,
  });
  const usuarioStartup2 = await upsertUsuario(usuarioRepo, {
    nome: 'Startup Teste 2',
    email: 'startup2@teste.com',
    tipo: TipoUsuario.STARTUP,
  });
  const usuarioInvestidor = await upsertUsuario(usuarioRepo, {
    nome: 'Investidor Teste',
    email: 'investidor@teste.com',
    tipo: TipoUsuario.INVESTIDOR,
  });
  const usuarioInvestidor2 = await upsertUsuario(usuarioRepo, {
    nome: 'Investidor Teste 2',
    email: 'investidor2@teste.com',
    tipo: TipoUsuario.INVESTIDOR,
  });
  const usuarioMentor = await upsertUsuario(usuarioRepo, {
    nome: 'Mentor Teste',
    email: 'mentor@teste.com',
    tipo: TipoUsuario.MENTOR,
  });
  await upsertUsuario(usuarioRepo, {
    nome: 'Admin Teste',
    email: 'admin@teste.com',
    tipo: TipoUsuario.ADMIN,
  });

  // ---------- Perfil de Startup ----------
  async function garantirStartup(
    usuario: Usuario,
    dados: Omit<Parameters<typeof startupRepo.create>[0], 'usuarioId'>,
    segmentos: { segmento: Segmento; principal: boolean }[],
  ): Promise<Startup> {
    const existente = await startupRepo.findOne({ where: { usuarioId: usuario.id } });
    if (existente) return existente;

    const startup = await startupRepo.save(
      startupRepo.create({ ...dados, usuarioId: usuario.id }),
    );
    for (const s of segmentos) {
      await startupSegmentoRepo.save(
        startupSegmentoRepo.create({ startup, segmento: s.segmento, principal: s.principal }),
      );
    }
    return startup;
  }

  const startup = await garantirStartup(
    usuarioStartup,
    {
      nomeFantasia: 'Nortech Soluções',
      descricao: 'Plataforma de gestão financeira para pequenos negócios do Porto Digital.',
      estagio: EstagioStartup.MVP,
      investimentoPretendido: 250000,
      cidade: 'Recife',
      uf: 'PE',
    },
    [
      { segmento: fintech, principal: true },
      { segmento: saasB2b, principal: false },
    ],
  );

  await garantirStartup(
    usuarioStartup2,
    {
      nomeFantasia: 'VitalCare Health',
      descricao: 'Telemedicina e acompanhamento remoto de pacientes crônicos.',
      estagio: EstagioStartup.OPERACAO,
      investimentoPretendido: 600000,
      cidade: 'Olinda',
      uf: 'PE',
    },
    [{ segmento: healthtech, principal: true }],
  );

  // ---------- Perfil de Investidor ----------
  async function garantirInvestidor(
    usuario: Usuario,
    dados: Omit<Parameters<typeof investidorRepo.create>[0], 'usuarioId'>,
    segmentos: { segmento: Segmento; prioridade: number }[],
  ): Promise<Investidor> {
    const existente = await investidorRepo.findOne({ where: { usuarioId: usuario.id } });
    if (existente) return existente;

    const investidor = await investidorRepo.save(
      investidorRepo.create({ ...dados, usuarioId: usuario.id }),
    );
    for (const s of segmentos) {
      await investidorSegmentoRepo.save(
        investidorSegmentoRepo.create({
          investidor,
          segmento: s.segmento,
          prioridade: s.prioridade,
        }),
      );
    }
    return investidor;
  }

  const investidor = await garantirInvestidor(
    usuarioInvestidor,
    {
      tipo: TipoInvestidor.ANJO,
      teseInvestimento: 'Fintechs e SaaS B2B em estágio inicial no Nordeste, com foco em Recife.',
      investimentoMin: 100000,
      investimentoMax: 400000,
      cidade: 'Recife',
      uf: 'PE',
      perfilPublico: true,
    },
    [
      { segmento: fintech, prioridade: 1 },
      { segmento: saasB2b, prioridade: 2 },
    ],
  );

  await garantirInvestidor(
    usuarioInvestidor2,
    {
      tipo: TipoInvestidor.VC,
      teseInvestimento: 'Healthtechs em fase de operação/tração no Nordeste.',
      investimentoMin: 300000,
      investimentoMax: 1000000,
      cidade: 'São Paulo',
      uf: 'SP',
      perfilPublico: true,
    },
    [{ segmento: healthtech, prioridade: 1 }],
  );

  // ---------- Perfil de Mentor ----------
  const mentorExistente = await mentorRepo.findOne({ where: { usuarioId: usuarioMentor.id } });
  if (!mentorExistente) {
    await mentorRepo.save(
      mentorRepo.create({
        usuarioId: usuarioMentor.id,
        areaAtuacao: 'Growth e captação de investimento',
        bio: 'Mais de 10 anos ajudando startups do Porto Digital a captar investimento-anjo.',
        especialidades: ['growth', 'fundraising', 'produto'],
        vinculoPortoDigital: true,
        disponibilidade: '2 sessões por mês, terças à tarde.',
      }),
    );
  }

  // ---------- Match, conversa e mensagens (startup <-> investidor) ----------
  let interesseStartup = await interesseRepo.findOne({
    where: { startupId: startup.id, investidorId: investidor.id, origem: OrigemInteresse.STARTUP },
  });
  if (!interesseStartup) {
    interesseStartup = await interesseRepo.save(
      interesseRepo.create({
        startupId: startup.id,
        investidorId: investidor.id,
        origem: OrigemInteresse.STARTUP,
      }),
    );
  }

  let interesseInvestidor = await interesseRepo.findOne({
    where: { startupId: startup.id, investidorId: investidor.id, origem: OrigemInteresse.INVESTIDOR },
  });
  if (!interesseInvestidor) {
    interesseInvestidor = await interesseRepo.save(
      interesseRepo.create({
        startupId: startup.id,
        investidorId: investidor.id,
        origem: OrigemInteresse.INVESTIDOR,
      }),
    );
  }

  let match = await matchRepo.findOne({
    where: { startupId: startup.id, investidorId: investidor.id },
  });
  if (!match) {
    const score = calculateCompatibilityScore(
      {
        investimentoPretendido: Number(startup.investimentoPretendido),
        cidade: startup.cidade,
        uf: startup.uf,
        segmentos: [
          { segmentoId: fintech.id, principal: true },
          { segmentoId: saasB2b.id, principal: false },
        ],
      },
      {
        investimentoMin: Number(investidor.investimentoMin),
        investimentoMax: Number(investidor.investimentoMax),
        cidade: investidor.cidade,
        uf: investidor.uf,
        segmentos: [
          { segmentoId: fintech.id, prioridade: 1 },
          { segmentoId: saasB2b.id, prioridade: 2 },
        ],
      },
    );

    match = await matchRepo.save(
      matchRepo.create({
        startupId: startup.id,
        investidorId: investidor.id,
        scoreCompatibilidade: score,
      }),
    );
  }

  let conversa = await conversaRepo.findOne({ where: { matchId: match.id } });
  if (!conversa) {
    conversa = await conversaRepo.save(conversaRepo.create({ matchId: match.id }));
  }

  const mensagensExistentes = await mensagemRepo.count({ where: { conversaId: conversa.id } });
  if (mensagensExistentes === 0) {
    await mensagemRepo.save([
      mensagemRepo.create({
        conversaId: conversa.id,
        remetenteId: usuarioInvestidor.id,
        conteudo: 'Olá! Vi seu perfil e gostei muito da proposta da Nortech. Podemos conversar?',
      }),
      mensagemRepo.create({
        conversaId: conversa.id,
        remetenteId: usuarioStartup.id,
        conteudo: 'Olá! Claro, ficamos muito felizes com o interesse. Podemos marcar uma call essa semana.',
      }),
    ]);
  }
}
