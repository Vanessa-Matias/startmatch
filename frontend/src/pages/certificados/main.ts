// Tela: Certificado de Mentoria — lógica
// ======================================
//
// Cada mentoria marcada como "realizada" gera um certificado com código único
// (GET /mentorias). A tela monta um certificado para cada sessão realizada, e o
// botão "Exportar" imprime / salva em PDF só o documento do certificado.
//
// ======================================

import { api, ApiError } from '../../scripts/api';
import { requireAuth } from '../../scripts/auth';
import { renderNav } from '../../scripts/nav';
import type { Mentoria } from '../../scripts/types';

const usuario = requireAuth(['mentor']);

renderNav(
  document.getElementById('nav-links') as HTMLElement,
  usuario.tipo
);

// --------------------------------------------------
// Dados (vêm da API: mentorias realizadas)
// --------------------------------------------------

interface SessaoMentoria {
  startup: string;
  data: string;
  horario: string;
  duracao: string;
  formato: string;
  tema: string;
}

interface CertificadoMentoria {
  id: string;
  titulo: string;
  periodo: string;
  dataInicio: string;
  dataFim: string;
  sessoes: SessaoMentoria[];
  status: 'Ativo' | 'Pendente';
  registro: string;
}

const FORMATO_LABEL: Record<string, string> = {
  presencial: 'Presencial',
  hibrido: 'Híbrido',
  remoto: 'Remoto',
};

let certificados: CertificadoMentoria[] = [];

function paraCertificado(m: Mentoria): CertificadoMentoria {
  const data = new Date(m.dataHora);
  const dia = data.toLocaleDateString('pt-BR');
  const horas = m.duracaoMinutos / 60;
  return {
    id: `cert-${m.id}`,
    titulo: `${m.startupNome} — ${dia}`,
    periodo: data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
    dataInicio: dia,
    dataFim: dia,
    status: 'Ativo',
    registro: m.codigoCertificado ?? '—',
    sessoes: [
      {
        startup: m.startupNome,
        data: dia,
        horario: data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        duracao: `${String(horas).replace('.', ',')}h`,
        formato: FORMATO_LABEL[m.modalidade] ?? m.modalidade,
        tema: m.tema,
      },
    ],
  };
}

// --------------------------------------------------
// Elementos
// --------------------------------------------------

const seletorCertificado = document.getElementById(
  'seletor-certificado'
) as HTMLSelectElement;

const certificadoHoras = document.getElementById(
  'certificado-horas'
) as HTMLElement;

const certificadoSessoes = document.getElementById(
  'certificado-sessoes'
) as HTMLElement;

const certificadoStartups = document.getElementById(
  'certificado-startups'
) as HTMLElement;

const certificadoStatusResumo = document.getElementById(
  'certificado-status-resumo'
) as HTMLElement;

const certificadoNome = document.getElementById(
  'certificado-nome'
) as HTMLElement;

const certificadoPeriodo = document.getElementById(
  'certificado-periodo'
) as HTMLElement;

const certificadoDataInicio = document.getElementById(
  'certificado-data-inicio'
) as HTMLElement;

const certificadoDataFim = document.getElementById(
  'certificado-data-fim'
) as HTMLElement;

const certificadoHorasDocumento = document.getElementById(
  'certificado-horas-documento'
) as HTMLElement;

const certificadoSessoesDocumento = document.getElementById(
  'certificado-sessoes-documento'
) as HTMLElement;

const certificadoArea = document.getElementById(
  'certificado-area'
) as HTMLElement;

const certificadoFormato = document.getElementById(
  'certificado-formato'
) as HTMLElement;

const certificadoStartupsDetalhe = document.getElementById(
  'certificado-startups-detalhe'
) as HTMLElement;

const certificadoRegistro = document.getElementById(
  'certificado-registro'
) as HTMLElement;

const certificadoTitulo = document.getElementById(
  'certificado-titulo'
) as HTMLElement;

const certificadoStatus = document.getElementById(
  'certificado-status'
) as HTMLElement;

const btnExportar = document.getElementById(
  'btn-exportar-certificado'
) as HTMLButtonElement;

// --------------------------------------------------
// Preenche o seletor
// --------------------------------------------------

function preencherSeletor(): void {
  seletorCertificado.innerHTML = certificados
    .map(
      (certificado) => `
        <option value="${certificado.id}">
          ${certificado.titulo}
        </option>
      `
    )
    .join('');
}

// --------------------------------------------------
// Calcula informações do certificado
// --------------------------------------------------

function calcularInformacoes(
  certificado: CertificadoMentoria
) {
  const totalSessoes = certificado.sessoes.length;

  const startupsUnicas = new Set(
    certificado.sessoes.map(
      (sessao) => sessao.startup
    )
  );

  const totalHoras = certificado.sessoes.reduce(
    (total, sessao) => {
      const duracao = sessao.duracao
        .replace('h', '')
        .replace(',', '.')
        .trim();

      const horas = Number(duracao);

      return total + (
        Number.isNaN(horas)
          ? 0
          : horas
      );
    },
    0
  );

  const temas = certificado.sessoes
    .map((sessao) => sessao.tema)
    .filter(Boolean);

  const formatos = certificado.sessoes
    .map((sessao) => sessao.formato)
    .filter(Boolean);

  return {
    totalSessoes,
    totalHoras,
    totalStartups: startupsUnicas.size,
    temaPrincipal: temas[0] || 'Não informado',
    formatoPrincipal: formatos[0] || 'Não informado'
  };
}

// --------------------------------------------------
// Formata quantidade de horas
// --------------------------------------------------

function formatarHoras(horas: number): string {
  if (horas === 1) {
    return '1 hora';
  }

  return `${horas} horas`;
}

// --------------------------------------------------
// Formata quantidade de sessões
// --------------------------------------------------

function formatarSessoes(
  sessoesTotal: number
): string {
  if (sessoesTotal === 1) {
    return '1 sessão';
  }

  return `${sessoesTotal} sessões`;
}

// --------------------------------------------------
// Obtém certificado selecionado
// --------------------------------------------------

function obterCertificadoSelecionado():
  CertificadoMentoria | undefined {

  return certificados.find(
    (certificado) =>
      certificado.id === seletorCertificado.value
  );
}

// --------------------------------------------------
// Atualiza o certificado exibido
// --------------------------------------------------

function atualizarCertificado(): void {
  const certificado =
    obterCertificadoSelecionado();

  if (!certificado) {
    return;
  }

  const informacoes =
    calcularInformacoes(certificado);

  // -----------------------------------------------
  // Indicadores
  // -----------------------------------------------

  certificadoHoras.textContent =
    informacoes.totalHoras > 0
      ? `${informacoes.totalHoras}h`
      : '0h';

  certificadoSessoes.textContent =
    String(informacoes.totalSessoes);

  certificadoStartups.textContent =
    String(informacoes.totalStartups);

  certificadoStatusResumo.textContent =
    certificado.status;

  // -----------------------------------------------
  // Nome do mentor
  // -----------------------------------------------

  const nomeUsuario =
    (usuario as { nome?: string }).nome ||
    'Mentor StartMatch';

  certificadoNome.textContent =
    nomeUsuario;

  // -----------------------------------------------
  // Documento
  // -----------------------------------------------

  certificadoTitulo.textContent =
    'Certificado de Mentoria';

  certificadoPeriodo.textContent =
    certificado.periodo;

  certificadoDataInicio.textContent =
    certificado.dataInicio;

  certificadoDataFim.textContent =
    certificado.dataFim;

  certificadoHorasDocumento.textContent =
    formatarHoras(
      informacoes.totalHoras
    );

  certificadoSessoesDocumento.textContent =
    formatarSessoes(
      informacoes.totalSessoes
    );

  // -----------------------------------------------
  // Informações da atuação
  // -----------------------------------------------

  certificadoArea.textContent =
    informacoes.temaPrincipal;

  certificadoFormato.textContent =
    informacoes.formatoPrincipal;

  certificadoStartupsDetalhe.textContent =
    String(informacoes.totalStartups);

  // -----------------------------------------------
  // Registro
  // -----------------------------------------------

  certificadoRegistro.textContent =
    certificado.registro;

  // -----------------------------------------------
  // Status
  // -----------------------------------------------

  certificadoStatus.textContent =
    certificado.status;

  certificadoStatus.classList.toggle(
    'certificado-status--pendente',
    certificado.status === 'Pendente'
  );

  // -----------------------------------------------
  // Exportação
  // -----------------------------------------------

  btnExportar.disabled = false;

  btnExportar.title = 'Imprimir ou salvar o certificado em PDF';
}

btnExportar.addEventListener('click', () => window.print());

// --------------------------------------------------
// Evento de troca do certificado
// --------------------------------------------------

seletorCertificado.addEventListener(
  'change',
  atualizarCertificado
);

// --------------------------------------------------
// Inicialização
// --------------------------------------------------

async function init(): Promise<void> {
  const lista = await api.get<Mentoria[]>('/mentorias');
  certificados = lista
    .filter((m) => m.status === 'realizada' && m.codigoCertificado)
    .map(paraCertificado);

  if (certificados.length === 0) {
    seletorCertificado.innerHTML = '<option value="">Nenhum certificado ainda</option>';
    btnExportar.disabled = true;
    btnExportar.title = 'Você ainda não tem mentorias realizadas.';
    certificadoNome.textContent = 'Nenhuma mentoria realizada ainda';
    certificadoRegistro.textContent = '—';
    return;
  }

  preencherSeletor();
  atualizarCertificado();
}

init().catch((error) => {
  seletorCertificado.innerHTML = `<option value="">${
    error instanceof ApiError ? error.message : 'Erro ao carregar certificados.'
  }</option>`;
});
