// src/scripts/ufs.ts
// ===================
// Lista fixa das 27 UFs (siglas de estado) do Brasil + uma função utilitária para
// preencher um <select> com elas. Usado nas telas de cadastro de perfil e na busca,
// nos campos "UF".

export const UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB',
  'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
] as const;

// Recebe um elemento <select> e adiciona uma <option> para cada UF, deixando "PE"
// pré-selecionado por padrão (Recife/Porto Digital é a praça de referência do
// projeto). Usada nos <select id="uf"> das telas de cadastro.
export function populateUfSelect(select: HTMLSelectElement, defaultUf = 'PE'): void {
  for (const uf of UFS) {
    const option = document.createElement('option');
    option.value = uf;
    option.textContent = uf;
    if (uf === defaultUf) option.selected = true;
    select.appendChild(option);
  }
}
