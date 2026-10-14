// Tela: Mentorias extras (Startup logada) — lógica
// =================================================
// Desenha os 3 pacotes avulsos e abre a área de pagamento (cartão ou PIX)
// do pacote escolhido. Os valores são os mesmos da página pública
// mentorias-extras/ — se mudar lá, mude aqui também.

import { requireAuth } from '../../scripts/auth';
import { renderNav } from '../../scripts/nav';
import { createPayment } from '../../scripts/payment';

const usuario = requireAuth(['startup']);
renderNav(document.getElementById('nav-links') as HTMLElement, usuario.tipo);

interface Pacote {
  id: string;
  nome: string;
  preco: string;
  badge: string;
  itens: string[];
}

const PACOTES: Pacote[] = [
  {
    id: 'basico',
    nome: 'Pacote Básico',
    preco: 'R$ 400',
    badge: 'badge-neon badge-neon--sky',
    itens: ['5 mentorias online de 30 min', 'R$ 80 por sessão', 'Ideal para validar uma hipótese ou preparar um pitch'],
  },
  {
    id: 'start',
    nome: 'Pacote Start',
    preco: 'R$ 750',
    badge: 'badge-neon badge-neon--blue',
    itens: ['8 mentorias de 1h', 'R$ 93,75 por sessão', 'Resumo e próximos passos após cada sessão'],
  },
  {
    id: 'premium',
    nome: 'Pacote Premium',
    preco: 'R$ 1.200',
    badge: 'badge-neon badge-neon--green',
    itens: ['10 mentorias de 1h', 'R$ 120 por sessão', 'Presenciais ou online, de segunda a sexta'],
  },
];

const pacotesEl = document.getElementById('pacotes') as HTMLDivElement;
const sucessoEl = document.getElementById('compra-sucesso') as HTMLParagraphElement;
let pacoteEscolhido: Pacote | null = null;

function marcarSelecionado(id: string): void {
  pacotesEl.querySelectorAll('.pacote-card').forEach((card) => {
    card.classList.toggle('plan-selected', id !== '' && card.getAttribute('data-pacote') === id);
  });
}

const pagamento = createPayment(document.getElementById('pagamento-area') as HTMLElement, {
  onPaid: () => {
    if (pacoteEscolhido) {
      sucessoEl.textContent = `${pacoteEscolhido.nome} comprado! As sessões já estão no seu saldo.`;
    }
    pacoteEscolhido = null;
    marcarSelecionado('');
  },
});

pacotesEl.innerHTML = PACOTES.map(
  (p) => `
    <div class="card plan-card pacote-card" data-pacote="${p.id}">
      <div class="card-title plan-head">
        <span class="${p.badge}">${p.nome}</span>
        <span class="plan-price">${p.preco}</span>
      </div>
      <ul class="pacote-lista">${p.itens.map((i) => `<li>${i}</li>`).join('')}</ul>
      <div class="plan-actions">
        <button type="button" class="btn btn-primary btn-block" data-comprar="${p.id}">Comprar pacote</button>
      </div>
    </div>
  `,
).join('');

pacotesEl.querySelectorAll<HTMLButtonElement>('[data-comprar]').forEach((button) => {
  button.addEventListener('click', () => {
    const pacote = PACOTES.find((p) => p.id === button.dataset.comprar);
    if (!pacote) return;
    pacoteEscolhido = pacote;
    sucessoEl.textContent = '';
    marcarSelecionado(pacote.id);
    pagamento.open(`${pacote.nome} — ${pacote.preco}`, pacote.id);
    document.getElementById('pagamento-area')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});
