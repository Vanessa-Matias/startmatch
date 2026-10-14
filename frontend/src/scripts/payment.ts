// src/scripts/payment.ts
// =======================
// Área de pagamento (cartão ou PIX) usada em mais de uma tela: "Plano e
// assinatura" (plano/) e "Mentorias extras" da startup (comprar-mentorias/).
//
// Nesta etapa o pagamento é só demonstração, feito no frontend: valida os
// campos do cartão, gera um código PIX de exemplo e mostra "Pagamento
// confirmado" — nada é cobrado nem enviado ao backend.
//
// Uso:
//   const pagamento = createPayment(document.getElementById('pagamento-area')!);
//   pagamento.open('Plano Plus — R$ 350/mês', 'PLUS');
//
// O HTML é criado aqui dentro (não precisa repetir nos index.html) e o estilo
// está em components.css (.payment-*).

export interface PaymentArea {
  /** Mostra a área para o item escolhido (texto exibido + código usado no PIX). */
  open(label: string, code: string): void;
  close(): void;
}

interface PaymentOptions {
  /** Chamado depois que o pagamento é confirmado (cartão). */
  onPaid?: () => void;
}

const template = (uid: string): string => `
  <section class="card payment-card">
    <div class="card-title">Pagamento</div>
    <p class="payment-selected"></p>

    <div class="payment-methods">
      <button type="button" class="payment-method" data-method="cartao">
        <div class="payment-method-title">Cartão</div>
        <div class="text-muted">Pague utilizando cartão de crédito.</div>
      </button>
      <button type="button" class="payment-method" data-method="pix">
        <div class="payment-method-title">PIX</div>
        <div class="text-muted">Gere um pagamento via PIX.</div>
      </button>
    </div>

    <form class="payment-form" data-form="cartao" novalidate>
      <div class="field">
        <label for="${uid}-nome">Nome no cartão</label>
        <input id="${uid}-nome" class="input" name="nome" type="text" autocomplete="cc-name" placeholder="Nome impresso no cartão" required />
      </div>
      <div class="field">
        <label for="${uid}-numero">Número do cartão</label>
        <input id="${uid}-numero" class="input" name="numero" type="text" inputmode="numeric" autocomplete="cc-number" placeholder="0000000000000000" maxlength="16" required />
      </div>
      <div class="payment-form-row">
        <div class="field">
          <label for="${uid}-validade">Validade</label>
          <input id="${uid}-validade" class="input" name="validade" type="text" inputmode="numeric" autocomplete="cc-exp" placeholder="MM/AA" maxlength="5" required />
        </div>
        <div class="field">
          <label for="${uid}-cvv">CVV</label>
          <input id="${uid}-cvv" class="input" name="cvv" type="text" inputmode="numeric" autocomplete="cc-csc" placeholder="000" maxlength="3" required />
        </div>
      </div>
      <button class="btn btn-primary" type="submit" data-confirm>Confirmar pagamento</button>
    </form>

    <div class="payment-form" data-form="pix" hidden>
      <div class="pix-box">
        <strong>Pagamento via PIX</strong>
        <p class="text-muted">Clique no botão abaixo para gerar o código PIX do item selecionado.</p>
        <button type="button" class="btn btn-primary" data-gerar-pix>Gerar PIX</button>
        <div data-pix-gerado hidden>
          <p>Código PIX gerado:</p>
          <div class="pix-code" data-pix-code></div>
          <button type="button" class="btn btn-outline" data-copiar-pix>Copiar código PIX</button>
        </div>
      </div>
    </div>
  </section>
`;

let contador = 0;

export function createPayment(container: HTMLElement, options: PaymentOptions = {}): PaymentArea {
  container.innerHTML = template(`pagamento-${++contador}`);
  container.hidden = true;

  const q = <T extends Element>(sel: string) => container.querySelector(sel) as T;
  const selectedEl = q<HTMLParagraphElement>('.payment-selected');
  const btnCartao = q<HTMLButtonElement>('[data-method="cartao"]');
  const btnPix = q<HTMLButtonElement>('[data-method="pix"]');
  const formCartao = q<HTMLFormElement>('[data-form="cartao"]');
  const formPix = q<HTMLDivElement>('[data-form="pix"]');
  const btnConfirmar = q<HTMLButtonElement>('[data-confirm]');
  const nomeEl = q<HTMLInputElement>('[name="nome"]');
  const numeroEl = q<HTMLInputElement>('[name="numero"]');
  const validadeEl = q<HTMLInputElement>('[name="validade"]');
  const cvvEl = q<HTMLInputElement>('[name="cvv"]');
  const btnGerarPix = q<HTMLButtonElement>('[data-gerar-pix]');
  const pixGerado = q<HTMLDivElement>('[data-pix-gerado]');
  const pixCodeEl = q<HTMLDivElement>('[data-pix-code]');
  const btnCopiarPix = q<HTMLButtonElement>('[data-copiar-pix]');

  let codigoItem = '';

  // número: só dígitos, até 16
  numeroEl.addEventListener('input', () => {
    numeroEl.value = numeroEl.value.replace(/\D/g, '').slice(0, 16);
  });
  // validade: só dígitos, com a barra automática (0528 -> 05/28)
  validadeEl.addEventListener('input', () => {
    const n = validadeEl.value.replace(/\D/g, '').slice(0, 4);
    validadeEl.value = n.length > 2 ? `${n.slice(0, 2)}/${n.slice(2)}` : n;
  });
  // CVV: só dígitos, até 3
  cvvEl.addEventListener('input', () => {
    cvvEl.value = cvvEl.value.replace(/\D/g, '').slice(0, 3);
  });

  function selecionarMetodo(metodo: 'cartao' | 'pix'): void {
    btnCartao.classList.toggle('active', metodo === 'cartao');
    btnPix.classList.toggle('active', metodo === 'pix');
    formCartao.hidden = metodo !== 'cartao';
    formPix.hidden = metodo !== 'pix';
  }

  function resetConfirmar(): void {
    btnConfirmar.classList.remove('btn-payment-success');
    btnConfirmar.classList.add('btn-primary');
    btnConfirmar.textContent = 'Confirmar pagamento';
  }

  function close(): void {
    formCartao.reset();
    resetConfirmar();
    codigoItem = '';
    selectedEl.textContent = '';
    pixGerado.hidden = true;
    pixCodeEl.textContent = '';
    selecionarMetodo('cartao');
    container.hidden = true;
  }

  function open(label: string, code: string): void {
    codigoItem = code;
    selectedEl.textContent = `Selecionado: ${label}`;
    pixGerado.hidden = true;
    pixCodeEl.textContent = '';
    resetConfirmar();
    selecionarMetodo('cartao');
    container.hidden = false;
  }

  btnCartao.addEventListener('click', () => selecionarMetodo('cartao'));
  btnPix.addEventListener('click', () => selecionarMetodo('pix'));

  formCartao.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!codigoItem) return;

    if (!nomeEl.value.trim()) return nomeEl.focus();
    if (!/^\d{16}$/.test(numeroEl.value.trim())) return numeroEl.focus();
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(validadeEl.value.trim())) return validadeEl.focus();
    if (!/^\d{3}$/.test(cvvEl.value.trim())) return cvvEl.focus();

    // pagamento confirmado: o botão fica verde e, depois de 1,2 s, a área fecha
    btnConfirmar.classList.remove('btn-primary');
    btnConfirmar.classList.add('btn-payment-success');
    btnConfirmar.textContent = 'Pagamento confirmado';
    window.setTimeout(() => {
      close();
      options.onPaid?.();
    }, 1200);
  });

  btnGerarPix.addEventListener('click', () => {
    if (!codigoItem) return;
    pixCodeEl.textContent = `STARTMATCH-${codigoItem.toUpperCase()}-${Date.now()}`;
    pixGerado.hidden = false;
  });

  btnCopiarPix.addEventListener('click', async () => {
    const codigo = pixCodeEl.textContent ?? '';
    if (!codigo) return;
    try {
      await navigator.clipboard.writeText(codigo);
      btnCopiarPix.textContent = 'Código copiado!';
      window.setTimeout(() => {
        btnCopiarPix.textContent = 'Copiar código PIX';
      }, 2000);
    } catch {
      btnCopiarPix.textContent = 'Não foi possível copiar';
    }
  });

  return { open, close };
}
