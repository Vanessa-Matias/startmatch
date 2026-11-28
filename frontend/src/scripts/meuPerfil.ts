// src/scripts/meuPerfil.ts
// =========================
// Carrega o perfil da pessoa logada (startup ou investidor) e devolve a imagem dela
// (foto enviada ou avatar/logo gerado). Usado nos perfis, mensagens e no aviso de match.

import { api } from './api';
import { avatarSrc } from './avatars';
import { extraInvestidor, extraStartup, planoEfetivo } from './perfilExtra';
import type { Investidor, PlanoAssinatura, Startup, Usuario } from './types';

export interface MeuPerfil {
  startup?: Startup;
  investidor?: Investidor;
  /** Nome para exibir (nome fantasia da startup ou nome do investidor). */
  nome: string;
  /** Imagem (data URL) para avatar/logo. */
  img: string;
  /** Plano em uso (considera a simulação feita na demonstração). */
  plano: PlanoAssinatura;
}

export async function carregarMeuPerfil(usuario: Usuario): Promise<MeuPerfil> {
  if (usuario.tipo === 'startup') {
    try {
      const startup = await api.get<Startup>('/startups/me');
      const extra = extraStartup(startup);
      return {
        startup,
        nome: extra.nome || startup.nomeFantasia,
        img: avatarSrc(extra.nome || startup.nomeFantasia, { tipo: 'startup', cor: extra.logoCor ?? undefined }),
        plano: planoEfetivo('startup', startup.planoAssinatura),
      };
    } catch {
      return {
        nome: usuario.nome,
        img: avatarSrc(usuario.nome, { tipo: 'startup' }),
        plano: planoEfetivo('startup', undefined),
      };
    }
  }
  if (usuario.tipo === 'investidor') {
    try {
      const investidor = await api.get<Investidor>('/investors/me');
      const extra = extraInvestidor({ ...investidor, nome: investidor.nome ?? usuario.nome });
      return {
        investidor,
        nome: extra.nome || usuario.nome,
        img: avatarSrc(extra.nome || usuario.nome, { genero: extra.genero, foto: extra.foto }),
        plano: planoEfetivo('investidor', investidor.planoAssinatura),
      };
    } catch {
      return {
        nome: usuario.nome,
        img: avatarSrc(usuario.nome),
        plano: planoEfetivo('investidor', undefined),
      };
    }
  }
  return { nome: usuario.nome, img: avatarSrc(usuario.nome), plano: 'basico' };
}
