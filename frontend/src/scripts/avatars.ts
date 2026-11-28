// src/scripts/avatars.ts
// =======================
// Avatares e logos GERADOS no navegador (SVG), só para a demonstração.
//
//   - avatarPessoa(nome): ilustração de uma pessoa (homem ou mulher), sem foto real.
//     O mesmo nome sempre gera a mesma pessoa.
//   - logoStartup(nome): logo abstrato da startup (cor + forma + inicial).
//
// Nada daqui usa foto de gente de verdade nem marca registrada (direito de imagem):
// são desenhos feitos em código. Nada é enviado para o servidor.

export type Genero = 'f' | 'm';

const PELES = ['#f6d9bf', '#ecc19c', '#d29b6e', '#b07448', '#7e4e2f'];
const CABELOS = ['#241711', '#3d281a', '#6b4423', '#16161a', '#a85d22', '#8d8d93'];
const ROUPAS = ['#2f6feb', '#16a34a', '#0f2148', '#e0761f', '#7c3aed', '#0e9aa7', '#d6336c'];
const FUNDOS: [string, string][] = [
  ['#dbeafe', '#bbf7d0'],
  ['#e0e7ff', '#cffafe'],
  ['#fef3c7', '#fde2e2'],
  ['#dcfce7', '#dbeafe'],
  ['#ede9fe', '#e0f2fe'],
  ['#ffedd5', '#dcfce7'],
];

/** Primeiros nomes terminados em "a" que são masculinos (e outras exceções). */
const MASCULINOS_COM_A = ['luca', 'joshua', 'elias', 'nicolas', 'lucas', 'matias', 'tobias', 'jonas', 'andre'];
const FEMININOS_SEM_A = ['beatriz', 'raquel', 'isabel', 'ester', 'ruth', 'carmen', 'miriam', 'aline', 'denise', 'simone', 'suelen', 'rachel', 'maite'];

export function hashTexto(texto: string): number {
  let h = 2166136261;
  for (let i = 0; i < texto.length; i += 1) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Palpite de gênero pelo primeiro nome (só para escolher o desenho do avatar). */
export function generoPorNome(nome: string): Genero {
  const primeiro = nome
    .trim()
    .split(/\s+/)[0]
    ?.toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
  if (!primeiro) return 'm';
  if (FEMININOS_SEM_A.includes(primeiro)) return 'f';
  if (MASCULINOS_COM_A.includes(primeiro)) return 'm';
  return primeiro.endsWith('a') ? 'f' : 'm';
}

function dataUri(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/** Desenho de uma pessoa (data URI). `genero` opcional; sem ele, é deduzido do nome. */
export function avatarPessoa(nome: string, genero?: Genero): string {
  const g = genero ?? generoPorNome(nome);
  const h = hashTexto(`${nome}|${g}`);
  const pele = PELES[h % PELES.length];
  const cabelo = CABELOS[(h >>> 3) % CABELOS.length];
  const roupa = ROUPAS[(h >>> 6) % ROUPAS.length];
  const [f1, f2] = FUNDOS[(h >>> 9) % FUNDOS.length];
  const estilo = (h >>> 12) % 3;
  const barba = g === 'm' && (h >>> 15) % 3 === 0;
  const oculos = (h >>> 17) % 4 === 0;

  let cabeloTras = '';
  let cabeloFrente = '';
  if (g === 'f') {
    if (estilo === 0) {
      // cabelo longo
      cabeloTras = `<path d="M25 62 C17 30 33 12 50 12 C67 12 83 30 75 62 L75 74 L25 74 Z" fill="${cabelo}"/>`;
      cabeloFrente = `<path d="M32 40 C35 24 65 22 68 40 C60 33 41 33 32 40 Z" fill="${cabelo}"/>`;
    } else if (estilo === 1) {
      // coque
      cabeloTras = `<circle cx="50" cy="17" r="9" fill="${cabelo}"/>`;
      cabeloFrente = `<path d="M32 42 C30 22 42 17 50 17 C60 17 70 23 68 42 C62 32 56 30 50 30 C44 30 38 32 32 42 Z" fill="${cabelo}"/>`;
    } else {
      // cabelo curto na altura do queixo
      cabeloTras = `<path d="M28 56 C22 28 36 14 50 14 C64 14 78 28 72 56 L72 58 L28 58 Z" fill="${cabelo}"/>`;
      cabeloFrente = `<path d="M31 41 C34 25 66 23 69 41 C60 33 40 33 31 41 Z" fill="${cabelo}"/>`;
    }
  } else if (estilo === 0) {
    cabeloFrente = `<path d="M32 40 C29 22 42 16 50 16 C60 16 71 22 68 40 C65 31 57 28 50 28 C43 28 35 31 32 40 Z" fill="${cabelo}"/>`;
  } else if (estilo === 1) {
    cabeloFrente = `<path d="M32 38 C32 24 42 17 51 17 C60 17 69 23 68 38 C60 30 44 30 32 38 Z" fill="${cabelo}"/>`;
  } else {
    cabeloFrente = `<path d="M33 37 C31 20 69 20 67 37 C62 29 38 29 33 37 Z" fill="${cabelo}"/>`;
  }

  const barbaSvg = barba
    ? `<path d="M34 46 C36 63 64 63 66 46 C62 55 56 57 50 57 C44 57 38 55 34 46 Z" fill="${cabelo}" opacity=".92"/>`
    : '';
  const oculosSvg = oculos
    ? `<g fill="none" stroke="#1b1b1f" stroke-width="1.8"><circle cx="43" cy="43" r="5.5"/><circle cx="57" cy="43" r="5.5"/><path d="M48.5 43h3"/></g>`
    : '';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${f1}"/><stop offset="1" stop-color="${f2}"/></linearGradient></defs>
<rect width="100" height="100" fill="url(#g)"/>
${cabeloTras}
<path d="M12 100 C12 77 30 67 50 67 C70 67 88 77 88 100 Z" fill="${roupa}"/>
<path d="M42 67 L50 78 L58 67 Z" fill="#fff" opacity=".85"/>
<rect x="43" y="55" width="14" height="15" rx="6" fill="${pele}"/>
<circle cx="50" cy="42" r="17" fill="${pele}"/>
${barbaSvg}
${cabeloFrente}
<circle cx="43.5" cy="43" r="1.9" fill="#241711"/><circle cx="56.5" cy="43" r="1.9" fill="#241711"/>
${oculosSvg}
<path d="M44.5 50.5 Q50 55 55.5 50.5" fill="none" stroke="${barba ? '#f6d9bf' : '#7a3b2e'}" stroke-width="1.8" stroke-linecap="round"/>
</svg>`;
  return dataUri(svg);
}

const LOGO_CORES: [string, string][] = [
  ['#2f6feb', '#16a34a'],
  ['#0f2148', '#2f6feb'],
  ['#16a34a', '#0e9aa7'],
  ['#7c3aed', '#2f6feb'],
  ['#e0761f', '#d6336c'],
  ['#0e9aa7', '#2f6feb'],
];

export const TOTAL_CORES_LOGO = LOGO_CORES.length;

function formaLogo(tipo: number): string {
  switch (tipo % 6) {
    case 0:
      return '<circle cx="50" cy="50" r="30" fill="none" stroke="#fff" stroke-width="7" opacity=".28"/><circle cx="50" cy="50" r="15" fill="#fff" opacity=".18"/>';
    case 1:
      return '<rect x="22" y="48" width="14" height="30" rx="4" fill="#fff" opacity=".25"/><rect x="43" y="34" width="14" height="44" rx="4" fill="#fff" opacity=".25"/><rect x="64" y="20" width="14" height="58" rx="4" fill="#fff" opacity=".25"/>';
    case 2:
      return '<path d="M50 14 L82 32 L82 68 L50 86 L18 68 L18 32 Z" fill="#fff" opacity=".2"/>';
    case 3:
      return '<path d="M50 14 L86 50 L50 86 L14 50 Z" fill="#fff" opacity=".2"/>';
    case 4:
      return '<path d="M20 70 Q20 28 62 24 Q80 22 80 22 Q80 40 72 56 Q58 78 20 70 Z" fill="#fff" opacity=".22"/>';
    default:
      return '<path d="M24 30 L50 56 L76 30" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" opacity=".28"/><path d="M24 54 L50 80 L76 54" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" opacity=".18"/>';
  }
}

/** Logo abstrato (data URI). `cor` opcional (0..5) para o usuário escolher na edição. */
export function logoStartup(nome: string, cor?: number): string {
  const h = hashTexto(nome);
  const [c1, c2] = LOGO_CORES[(cor ?? h) % LOGO_CORES.length];
  const inicial = (nome.trim()[0] ?? 'S').toUpperCase().replace(/[<>&"]/g, '');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>
<rect width="100" height="100" rx="22" fill="url(#g)"/>
${formaLogo(h >>> 4)}
<text x="50" y="64" text-anchor="middle" font-family="Poppins,Arial,sans-serif" font-weight="700" font-size="46" fill="#fff">${inicial}</text>
</svg>`;
  return dataUri(svg);
}

export type TipoAvatar = 'pessoa' | 'startup';

export interface OpcoesAvatar {
  tipo?: TipoAvatar;
  genero?: Genero;
  cor?: number;
  /** Foto enviada pela própria pessoa (data URL); tem prioridade sobre o desenho. */
  foto?: string;
  tamanho?: number;
}

export function avatarSrc(nome: string, op: OpcoesAvatar = {}): string {
  if (op.foto) return op.foto;
  return op.tipo === 'startup' ? logoStartup(nome, op.cor) : avatarPessoa(nome, op.genero);
}

/** <img> redondo (pessoa) ou arredondado (startup), pronto para colocar em innerHTML. */
export function avatarImg(nome: string, op: OpcoesAvatar = {}): string {
  const tamanho = op.tamanho ?? 48;
  const src = avatarSrc(nome, op);
  const classe = op.tipo === 'startup' ? 'av av--logo' : 'av';
  const alt = op.tipo === 'startup' ? `Logo de ${nome}` : `Avatar de ${nome}`;
  return `<img class="${classe}" src="${src}" alt="${alt.replace(/"/g, '&quot;')}" width="${tamanho}" height="${tamanho}" style="width:${tamanho}px;height:${tamanho}px" loading="lazy" />`;
}
