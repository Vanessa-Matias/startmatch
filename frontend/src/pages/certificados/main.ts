// Tela: Certificado de Mentoria — lógica
// ======================================
//
// Nesta primeira entrega, os dados são demonstrativos e ficam
// somente no frontend.
//
// Cada certificado representa um período específico de atuação
// do mentor. Futuramente, esses dados deverão ser carregados
// a partir do histórico real de sessões de mentoria.
//
// ======================================

import { requireAuth } from '../../scripts/auth';
import { renderNav } from '../../scripts/nav';

const usuario = requireAuth(['mentor']);

renderNav(
  document.getElementById('nav-links') as HTMLElement,
  usuario.tipo
);

// --------------------------------------------------
// Dados demonstrativos
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

const certificados: CertificadoMentoria[] = [
  {
    id: 'cert-001',
    titulo: 'Certificado de Mentoria — Setembro de 2026',
    periodo: 'Setembro de 2026',
    dataInicio: '01/09/2026',
    dataFim: '30/09/2026',
    status: 'Ativo',
    registro: 'SM-MENTOR-001',
    sessoes: [
      {
        startup: 'Startup #1',
        data: '02/09/2026',
        horario: '14:00',
        duracao: '1h',
        formato: 'Online',
        tema: 'Estratégia e crescimento da startup'
      },
      {
        startup: 'Startup #2',
        data: '05/09/2026',
        horario: '15:00',
        duracao: '2h',
        formato: 'Online',
        tema: 'Modelo de negócio e validação'
      },
      {
        startup: 'Startup #3',
        data: '10/09/2026',
        horario: '14:00',
        duracao: '1h',
        formato: 'Online',
        tema: 'Planejamento estratégico'
      },
      {
        startup: 'Startup #1',
        data: '15/09/2026',
        horario: '14:00',
        duracao: '1h',
        formato: 'Online',
        tema: 'Estratégia e crescimento da startup'
      },
      {
        startup: 'Startup #2',
        data: '20/09/2026',
        horario: '16:00',
        duracao: '1h',
        formato: 'Online',
        tema: 'Posicionamento e mercado'
      }
    ]
  },

  {
    id: 'cert-002',
    titulo: 'Certificado de Mentoria — Agosto de 2026',
    periodo: 'Agosto de 2026',
    dataInicio: '01/08/2026',
    dataFim: '31/08/2026',
    status: 'Ativo',
    registro: 'SM-MENTOR-002',
    sessoes: [
      {
        startup: 'Startup #4',
        data: '03/08/2026',
        horario: '14:00',
        duracao: '2h',
        formato: 'Online',
        tema: 'Planejamento financeiro'
      },
      {
        startup: 'Startup #5',
        data: '08/08/2026',
        horario: '15:00',
        duracao: '1h',
        formato: 'Online',
        tema: 'Estratégia comercial'
      },
      {
        startup: 'Startup #4',
        data: '15/08/2026',
        horario: '14:00',
        duracao: '1h',
        formato: 'Online',
        tema: 'Indicadores e crescimento'
      }
    ]
  },

  {
    id: 'cert-003',
    titulo: 'Certificado de Mentoria — Julho de 2026',
    periodo: 'Julho de 2026',
    dataInicio: '01/07/2026',
    dataFim: '31/07/2026',
    status: 'Ativo',
    registro: 'SM-MENTOR-003',
    sessoes: [
      {
        startup: 'Startup #6',
        data: '05/07/2026',
        horario: '14:00',
        duracao: '1h',
        formato: 'Online',
        tema: 'Validação de mercado'
      },
      {
        startup: 'Startup #7',
        data: '12/07/2026',
        horario: '15:00',
        duracao: '2h',
        formato: 'Online',
        tema: 'Modelo de negócio'
      }
    ]
  }
];

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

  btnExportar.disabled = true;

  btnExportar.title =
    'A exportação será disponibilizada quando o histórico real estiver integrado';
}

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

preencherSeletor();
atualizarCertificado();