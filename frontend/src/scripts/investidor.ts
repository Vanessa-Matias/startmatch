// Rótulos e utilitários de exibição do investidor (cards, perfil e aviso de match).

import type { TipoInvestidor } from './types';

export const TIPO_INVESTIDOR_LABEL: Record<TipoInvestidor, string> = {
  anjo: 'Investidor-anjo',
  vc: 'Venture Capital',
  fundo: 'Fundo',
  corporate: 'Corporate Venture',
};

export function escapeHtml(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
