// plan-limits.ts
// ==============
// Limites de cada plano de assinatura (modelo de negócio B2B freemium).
// Só startups e investidores assinam. Mentores são voluntários e não pagam.
//
//   Básico  (grátis): até 3 interesses por mês, chat depois do match, sem mentoria.
//   Plus:             interesses ilimitados, 1 mentoria por mês (startup).
//   Premium:          interesses ilimitados, 2 mentorias por mês (startup).
//
// null = sem limite. Os valores ficam todos aqui para mudar em um lugar só.
import { PlanoAssinatura } from './enums';

export const LIMITE_INTERESSES_POR_MES: Record<PlanoAssinatura, number | null> =
  {
    [PlanoAssinatura.BASICO]: 3,
    [PlanoAssinatura.PLUS]: null,
    [PlanoAssinatura.PREMIUM]: null,
  };

export const LIMITE_MENTORIAS_POR_MES: Record<PlanoAssinatura, number> = {
  [PlanoAssinatura.BASICO]: 0,
  [PlanoAssinatura.PLUS]: 1,
  [PlanoAssinatura.PREMIUM]: 2,
};

/** Primeiro instante do mês atual (usado para contar o uso mensal). */
export function inicioDoMes(referencia: Date = new Date()): Date {
  return new Date(
    referencia.getFullYear(),
    referencia.getMonth(),
    1,
    0,
    0,
    0,
    0,
  );
}
