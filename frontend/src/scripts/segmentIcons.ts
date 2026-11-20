// src/scripts/segmentIcons.ts
// ============================
// Ícone (SVG) que representa o segmento principal de uma startup, usado nos
// cards de startups do dashboard do investidor e na tela "Análise IA".
// O desenho é escolhido por palavra-chave no nome do segmento (ex.: "Healthtech"
// -> batimento); quando nada combina, usa o foguete.

const FOGUETE =
  '<path d="M4.5 16.5c-1.5 1.3-2 5-2 5s3.7-.5 5-2c.7-.8.7-2.1-.1-2.9a2.2 2.2 0 0 0-2.9-.1z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.9A12.9 12.9 0 0 1 22 2c0 2.7-.8 7.5-6 11a22.4 22.4 0 0 1-4 2z"/><path d="M9 12H4s.6-3 2-4c1.6-1.1 5 0 5 0"/><path d="M12 15v5s3-.6 4-2c1.1-1.6 0-5 0-5"/>';

const ICONES: { chaves: string[]; desenho: string }[] = [
  { chaves: ['fin', 'pag', 'banco'], desenho: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>' },
  { chaves: ['health', 'saude', 'med', 'bio'], desenho: '<path d="M3 12h4l2-5 4 10 2-5h6"/>' },
  { chaves: ['edu', 'ensino'], desenho: '<path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/>' },
  { chaves: ['agro', 'agtech', 'agri'], desenho: '<path d="M11 20A7 7 0 0 1 4 13c0-5 4-9 16-9 0 12-4 16-9 16z"/><path d="M4 20c2-6 6-9 11-11"/>' },
  { chaves: ['saas', 'software', 'b2b', 'dados', 'ia'], desenho: '<path d="M8 8l-4 4 4 4M16 8l4 4-4 4M14 5l-4 14"/>' },
  { chaves: ['mart', 'market', 'retail', 'varejo'], desenho: '<path d="M6 7h12l1 13H5z"/><path d="M9 7a3 3 0 0 1 6 0"/>' },
  { chaves: ['log', 'transp'], desenho: '<path d="M2 6h11v10H2zM13 10h5l3 3v3h-8z"/><circle cx="6" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>' },
  { chaves: ['green', 'clean', 'energia', 'clima', 'sustent'], desenho: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>' },
  { chaves: ['cyber', 'seguranca', 'security'], desenho: '<path d="M12 2l8 3v6c0 5-3.4 9.4-8 11-4.6-1.6-8-6-8-11V5z"/>' },
  { chaves: ['mob', 'mobil'], desenho: '<path d="M5 17h14M6 17l1.5-6h9L18 17M7 17v2M17 17v2"/>' },
  { chaves: ['criativ', 'cultur', 'game', 'media'], desenho: '<circle cx="12" cy="12" r="9"/><circle cx="8" cy="10" r="1"/><circle cx="12" cy="7.5" r="1"/><circle cx="16" cy="10" r="1"/>' },
];

function normalizar(t: string): string {
  return t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/** Devolve o <svg> (24x24, traço) do primeiro segmento que tiver um ícone. */
export function iconeSegmento(nomes: string[], tamanho = 22): string {
  let desenho = FOGUETE;
  const achado = nomes
    .map(normalizar)
    .map((n) => ICONES.find((i) => i.chaves.some((c) => n.includes(c))))
    .find(Boolean);
  if (achado) desenho = achado.desenho;
  return `<svg width="${tamanho}" height="${tamanho}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${desenho}</svg>`;
}
