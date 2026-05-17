import { useEffect, useMemo, useState } from 'react'
import './App.css'
import logoPrefeitura from './assets/logoPrefeitura.png'
import { API_URL } from './services/api'

import {
  GoCalendar,
  GoCheckCircle,
  GoChecklist,
  GoClock,
  GoDownload,
  GoFile,
  GoGraph,
  GoPerson
} from 'react-icons/go'

import {
  FaEnvelope,
  FaSave,
  FaSearch,
  FaUserEdit,
  FaUserGraduate,
  FaUserTie
} from 'react-icons/fa'

type TipoUsuario = 'ACADEMICO' | 'SUPERVISOR'
type TelaAutenticacao = 'login' | 'cadastroAcademico' | 'cadastroSupervisor' | 'recuperarSenha'
type PaginaAcademico = 'meusDados' | 'ponto' | 'historico'
type PaginaSupervisor = 'dashboard' | 'academico' | 'relatorios'
type AbaAcademicoSupervisor = 'dados' | 'ponto'

type PerfilAcademico = {
  ensino: string
  endereco: string
  sexo: string
  estadoCivil?: string
  profissao?: string
  escolaridade?: string
  tipoEnsino?: string
  instituicaoEnsino?: string
  curso?: string
  periodoSemestre?: string
  telefoneCelular?: string
  telefoneResidencial?: string
  cep?: string
  logradouro?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade?: string
  estado?: string
  dadosContratacao: string
  setorAlocacao: string
  horario: string
  cargaHorariaSemanal: number
  situacaoAcademico?: string
  supervisorId?: number | null
}

type Usuario = {
  id: number
  nome: string
  nomeCompleto: string
  cpf: string
  tipoUsuario: TipoUsuario
  dataNascimento?: string | null
  email: string
  orgao: string
  academico?: PerfilAcademico | null
}

type PontoResumo = {
  id: number
  data: string
  entrada?: string | null
  saida?: string | null
  horaEntrada?: string | null
  horaSaida?: string | null
  horasCumpridas: number
  status: string
  presente: boolean
  ausente: boolean
}

type DiaHistorico = {
  id: number
  data: string
  dia: number
  entrada?: string | null
  saida?: string | null
  horaEntrada?: string | null
  horaSaida?: string | null
  horasCumpridas: number
  status: string
  observacaoSupervisor: string
  tipoDia: string
  descricaoFeriado: string
}

type AcademicoSupervisor = Usuario & {
  registroHoje?: PontoResumo | null
}

type CadastroForm = {
  nomeCompleto: string
  cpf: string
  dataNascimento: string
  orgao: string
  email: string
  senha: string
  confirmarSenha: string
}

type DadosAcademicoForm = {
  ensino: string
  dataNascimento: string
  endereco: string
  sexo: string
  email: string
  estadoCivil: string
  profissao: string
  escolaridade: string
  tipoEnsino: string
  instituicaoEnsino: string
  curso: string
  periodoSemestre: string
  telefoneCelular: string
  telefoneResidencial: string
  cep: string
  logradouro: string
  numero: string
  complemento: string
  bairro: string
  cidade: string
  estado: string
}

type EdicaoSupervisorForm = DadosAcademicoForm & {
  nomeCompleto: string
  orgao: string
  dadosContratacao: string
  setorAlocacao: string
  horario: string
  cargaHorariaSemanal: number
  situacaoAcademico: string
}

const meses2026 = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro'
]

const cadastroInicial: CadastroForm = {
  nomeCompleto: '',
  cpf: '',
  dataNascimento: '',
  orgao: '',
  email: '',
  senha: '',
  confirmarSenha: ''
}

const dadosAcademicoInicial: DadosAcademicoForm = {
  ensino: '',
  dataNascimento: '',
  endereco: '',
  sexo: '',
  email: '',
  estadoCivil: '',
  profissao: '',
  escolaridade: '',
  tipoEnsino: '',
  instituicaoEnsino: '',
  curso: '',
  periodoSemestre: '',
  telefoneCelular: '',
  telefoneResidencial: '',
  cep: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  estado: ''
}

const edicaoSupervisorInicial: EdicaoSupervisorForm = {
  ...dadosAcademicoInicial,
  nomeCompleto: '',
  orgao: '',
  ensino: '',
  dataNascimento: '',
  endereco: '',
  sexo: '',
  email: '',
  dadosContratacao: '',
  setorAlocacao: '',
  horario: '',
  cargaHorariaSemanal: 30,
  situacaoAcademico: 'Acadêmico ativo'
}

const carregarUsuarioSalvo = () => {
  try {
    const usuarioSalvo = localStorage.getItem('usuarioLogado')
    return usuarioSalvo ? JSON.parse(usuarioSalvo) as Usuario : null
  } catch {
    return null
  }
}

const montarDadosAcademico = (usuario: Usuario | null, atual = dadosAcademicoInicial): DadosAcademicoForm => ({
  ...atual,
  ensino: usuario?.academico?.ensino || '',
  dataNascimento: formatarDataInput(usuario?.dataNascimento),
  endereco: usuario?.academico?.endereco || '',
  sexo: usuario?.academico?.sexo || '',
  email: usuario?.email || '',
  estadoCivil: usuario?.academico?.estadoCivil || atual.estadoCivil,
  profissao: usuario?.academico?.profissao || atual.profissao,
  escolaridade: usuario?.academico?.escolaridade || atual.escolaridade,
  tipoEnsino: usuario?.academico?.tipoEnsino || atual.tipoEnsino,
  instituicaoEnsino: usuario?.academico?.instituicaoEnsino || atual.instituicaoEnsino,
  curso: usuario?.academico?.curso || atual.curso,
  periodoSemestre: usuario?.academico?.periodoSemestre || atual.periodoSemestre,
  telefoneCelular: usuario?.academico?.telefoneCelular || atual.telefoneCelular,
  telefoneResidencial: usuario?.academico?.telefoneResidencial || atual.telefoneResidencial,
  cep: usuario?.academico?.cep || atual.cep,
  logradouro: usuario?.academico?.logradouro || atual.logradouro,
  numero: usuario?.academico?.numero || atual.numero,
  complemento: usuario?.academico?.complemento || atual.complemento,
  bairro: usuario?.academico?.bairro || atual.bairro,
  cidade: usuario?.academico?.cidade || atual.cidade,
  estado: usuario?.academico?.estado || atual.estado
})

const chamarApi = async <T,>(caminho: string, opcoes?: RequestInit): Promise<T> => {
  const resposta = await fetch(`${API_URL}${caminho}`, {
    ...opcoes,
    headers: {
      'Content-Type': 'application/json',
      ...(opcoes?.headers || {})
    }
  })

  if (!resposta.ok) {
    const erro = await resposta.json().catch(() => null)
    throw new Error(erro?.mensagem || 'Não foi possível concluir a ação.')
  }

  return resposta.json() as Promise<T>
}

const somenteNumeros = (valor: string) => valor.replace(/\D/g, '')

const aplicarMascaraCpf = (valor: string) => {
  const cpf = somenteNumeros(valor).slice(0, 11)
  return cpf
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

const aplicarMascaraCelular = (valor: string) => {
  const telefone = somenteNumeros(valor).slice(0, 11)
  return telefone
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{1,4})$/, '$1-$2')
}

const aplicarMascaraTelefone = (valor: string) => {
  const telefone = somenteNumeros(valor).slice(0, 10)
  return telefone
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{4})(\d{1,4})$/, '$1-$2')
}

const aplicarMascaraCep = (valor: string) => {
  const cep = somenteNumeros(valor).slice(0, 8)
  return cep.replace(/(\d{2})(\d{3})(\d{1,3})$/, '$1.$2-$3')
}

const validarCpf = (valor: string) => {
  const cpf = somenteNumeros(valor)
  return cpf.length === 11
}

const calcularForcaSenha = (senha: string) => {
  const regras = [
    senha.length >= 8,
    /[A-Z]/.test(senha),
    /[a-z]/.test(senha),
    /\d/.test(senha),
    /[^a-zA-Z0-9]/.test(senha)
  ]
  const pontos = regras.filter(Boolean).length

  if (pontos <= 2) return { texto: 'Senha fraca', classe: 'fraca', largura: 33 }
  if (pontos <= 4) return { texto: 'Senha média', classe: 'media', largura: 66 }
  return { texto: 'Senha forte', classe: 'forte', largura: 100 }
}

const validarSenha = (senha: string, confirmarSenha: string) => {
  if (senha !== confirmarSenha) return 'As senhas não conferem.'
  if (senha.length < 8) return 'A senha precisa ter pelo menos 8 caracteres.'
  if (!/[A-Z]/.test(senha)) return 'Inclua uma letra maiúscula.'
  if (!/[a-z]/.test(senha)) return 'Inclua uma letra minúscula.'
  if (!/\d/.test(senha)) return 'Inclua um número.'
  if (!/[^a-zA-Z0-9]/.test(senha)) return 'Inclua um caractere especial.'
  return ''
}

const formatarDataInput = (data?: string | null) => {
  if (!data) return ''
  return new Date(data).toISOString().slice(0, 10)
}

const formatarData = (data?: string | null) => {
  if (!data) return '--'
  return new Date(data).toLocaleDateString('pt-BR')
}

const formatarHora = (data?: string | null) => {
  if (!data) return '--:--'
  return new Date(data).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const extrairHorarioTela = (valor?: string | null) => {
  const horarios = (valor || '').match(/\d{1,2}:\d{2}/g) || []
  return {
    inicio: horarios[0]?.padStart(5, '0') || '',
    fim: horarios[1]?.padStart(5, '0') || ''
  }
}

const montarHorarioTela = (valorAtual: string, campo: 'inicio' | 'fim', valor: string) => {
  const horario = extrairHorarioTela(valorAtual)
  const inicio = campo === 'inicio' ? valor : horario.inicio
  const fim = campo === 'fim' ? valor : horario.fim

  if (inicio && fim) return `${inicio} às ${fim}`
  if (inicio) return `${inicio} às `
  if (fim) return ` às ${fim}`
  return ''
}

const formatarDataLonga = (data: Date) =>
  data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })

const formatarDiaSemana = (data: Date) =>
  data.toLocaleDateString('pt-BR', { weekday: 'long' })

const formatarOrgao = (valor?: string | null) =>
  (valor || 'Subsecretaria de Gestão')
    .replaceAll('Gestao', 'Gestão')
    .replaceAll('Subsecretária', 'Subsecretaria')

const statusLegivel = (status?: string) => {
  const mapa: Record<string, string> = {
    PRESENTE: 'Presente',
    AUSENTE: 'Falta',
    PENDENTE: 'Aguardando',
    FALTA_JUSTIFICADA: 'Falta justificada',
    FALTA_NAO_JUSTIFICADA: 'Falta',
    PRESENCA_REGULARIZADA: 'Presente',
    UTIL: 'Útil',
    SABADO: 'Sábado',
    DOMINGO: 'Domingo',
    FERIADO: 'Feriado'
  }
  return mapa[status || ''] || 'Aguardando'
}

const classeStatus = (status?: string) => {
  if (status === 'PRESENTE' || status === 'PRESENCA_REGULARIZADA') return 'presente'
  if (status === 'FALTA_JUSTIFICADA') return 'justificado'
  if (status === 'FERIADO' || status === 'SABADO' || status === 'DOMINGO') return 'justificado'
  if (status === 'AUSENTE' || status === 'FALTA_NAO_JUSTIFICADA') return 'ausente'
  return 'aguardando'
}

const StatusBadge = ({ status }: { status?: string }) => (
  <span className={`status-tabela ${classeStatus(status)}`}>
    {statusLegivel(status || 'PENDENTE')}
  </span>
)

function App() {
  const usuarioInicial = useMemo(() => carregarUsuarioSalvo(), [])
  const [areaLogin, setAreaLogin] = useState<TipoUsuario>('ACADEMICO')
  const [telaAutenticacao, setTelaAutenticacao] = useState<TelaAutenticacao>('login')
  const [cpfLogin, setCpfLogin] = useState('')
  const [senhaLogin, setSenhaLogin] = useState('')
  const [mensagemErro, setMensagemErro] = useState('')
  const [mensagemSucesso, setMensagemSucesso] = useState('')

  const [cadastroAcademico, setCadastroAcademico] = useState<CadastroForm>(cadastroInicial)
  const [cadastroSupervisor, setCadastroSupervisor] = useState<CadastroForm>(cadastroInicial)

  const [usuarioLogado, setUsuarioLogado] = useState<Usuario | null>(usuarioInicial)
  const [paginaAcademico, setPaginaAcademico] = useState<PaginaAcademico>('ponto')
  const [paginaSupervisor, setPaginaSupervisor] = useState<PaginaSupervisor>('dashboard')
  const [abaAcademicoSupervisor, setAbaAcademicoSupervisor] = useState<AbaAcademicoSupervisor>('dados')
  const [horaAtual, setHoraAtual] = useState(new Date())

  const [dadosAcademico, setDadosAcademico] = useState<DadosAcademicoForm>(() => montarDadosAcademico(usuarioInicial))
  const [pontoHoje, setPontoHoje] = useState<PontoResumo | null>(null)
  const [anoHistorico] = useState(2026)
  const [mesHistorico, setMesHistorico] = useState(new Date().getMonth() + 1)
  const [historicoMensal, setHistoricoMensal] = useState<DiaHistorico[]>([])

  const [academicos, setAcademicos] = useState<AcademicoSupervisor[]>([])
  const [filtroAcademicos, setFiltroAcademicos] = useState('')
  const [academicoSelecionado, setAcademicoSelecionado] = useState<AcademicoSupervisor | null>(null)
  const [edicaoSupervisor, setEdicaoSupervisor] = useState<EdicaoSupervisorForm>(edicaoSupervisorInicial)
  const [dataAusencia, setDataAusencia] = useState(new Date().toISOString().slice(0, 10))
  const [tipoAusencia, setTipoAusencia] = useState('JUSTIFICADA')
  const [observacoes, setObservacoes] = useState<Record<number, string>>({})
  const [relatorioAcademicoId, setRelatorioAcademicoId] = useState('')
  const [relatorioMes, setRelatorioMes] = useState(new Date().getMonth() + 1)
  const [relatorioAno, setRelatorioAno] = useState(2026)

  const areaSupervisor = areaLogin === 'SUPERVISOR'

  const limparMensagens = () => {
    setMensagemErro('')
    setMensagemSucesso('')
  }

  const prepararDadosAcademico = (usuario: Usuario) => {
    setDadosAcademico((atual) => montarDadosAcademico(usuario, atual))
  }

  const prepararEdicaoSupervisor = (academico: AcademicoSupervisor) => {
    setEdicaoSupervisor({
      ...edicaoSupervisorInicial,
      nomeCompleto: academico.nomeCompleto || academico.nome || '',
      orgao: academico.orgao || '',
      ensino: academico.academico?.ensino || '',
      dataNascimento: formatarDataInput(academico.dataNascimento),
      endereco: academico.academico?.endereco || '',
      sexo: academico.academico?.sexo || '',
      email: academico.email || '',
      estadoCivil: academico.academico?.estadoCivil || '',
      profissao: academico.academico?.profissao || '',
      escolaridade: academico.academico?.escolaridade || '',
      tipoEnsino: academico.academico?.tipoEnsino || '',
      instituicaoEnsino: academico.academico?.instituicaoEnsino || '',
      curso: academico.academico?.curso || '',
      periodoSemestre: academico.academico?.periodoSemestre || '',
      telefoneCelular: academico.academico?.telefoneCelular || '',
      telefoneResidencial: academico.academico?.telefoneResidencial || '',
      cep: academico.academico?.cep || '',
      logradouro: academico.academico?.logradouro || '',
      numero: academico.academico?.numero || '',
      complemento: academico.academico?.complemento || '',
      bairro: academico.academico?.bairro || '',
      cidade: academico.academico?.cidade || '',
      estado: academico.academico?.estado || '',
      dadosContratacao: academico.academico?.dadosContratacao || '',
      setorAlocacao: academico.academico?.setorAlocacao || '',
      horario: academico.academico?.horario || '',
      cargaHorariaSemanal: academico.academico?.cargaHorariaSemanal || 30,
      situacaoAcademico: academico.academico?.situacaoAcademico || 'Acadêmico ativo'
    })
  }

  const buscarPontoHoje = async (academicoId: number) => {
    try {
      const ponto = await chamarApi<PontoResumo>(`/api/ponto/hoje/${academicoId}`)
      setPontoHoje(ponto)
    } catch {
      setPontoHoje(null)
    }
  }

  const buscarHistoricoMensal = async (academicoId: number, ano: number, mes: number) => {
    try {
      const dados = await chamarApi<DiaHistorico[]>(`/api/ponto/historico-mensal/${academicoId}/${ano}/${mes}`)
      setHistoricoMensal(dados)
      setObservacoes(Object.fromEntries(dados.map((dia) => [dia.dia, dia.observacaoSupervisor || ''])))
    } catch (erro) {
      setMensagemErro((erro as Error).message)
    }
  }

  const buscarAcademicos = async () => {
    if (!usuarioLogado) return

    try {
      const query = new URLSearchParams({
        supervisorId: String(usuarioLogado.id),
        busca: filtroAcademicos
      })
      const dados = await chamarApi<AcademicoSupervisor[]>(`/api/supervisor/academicos?${query.toString()}`)
      setAcademicos(dados)
    } catch (erro) {
      setMensagemErro((erro as Error).message)
    }
  }

  useEffect(() => {
    const relogio = window.setInterval(() => setHoraAtual(new Date()), 1000)
    return () => window.clearInterval(relogio)
  }, [])

  useEffect(() => {
    if (!usuarioLogado) return

    if (usuarioLogado.tipoUsuario === 'SUPERVISOR') {
      const carregamento = window.setTimeout(() => void buscarAcademicos(), 0)
      return () => window.clearTimeout(carregamento)
    }

    const carregamento = window.setTimeout(() => {
      void buscarPontoHoje(usuarioLogado.id)
      void buscarHistoricoMensal(usuarioLogado.id, anoHistorico, mesHistorico)
    }, 0)

    return () => {
      window.clearTimeout(carregamento)
    }
    // A recarga inicial deve acompanhar o usuário logado; os filtros são acionados pelos próprios campos.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuarioLogado])

  const atualizarUsuarioLogado = async () => {
    if (!usuarioLogado) return

    try {
      const atualizado = await chamarApi<Usuario>(`/api/usuarios/${usuarioLogado.id}`)
      setUsuarioLogado(atualizado)
      prepararDadosAcademico(atualizado)
      localStorage.setItem('usuarioLogado', JSON.stringify(atualizado))
    } catch {
      // Mantém os dados atuais se a API não estiver disponível no momento.
    }
  }

  const lidarComLogin = async () => {
    limparMensagens()

    try {
      const usuario = await chamarApi<Usuario>('/api/login', {
        method: 'POST',
        body: JSON.stringify({
          cpf: cpfLogin,
          senha: senhaLogin,
          tipoUsuario: areaLogin
        })
      })

      localStorage.setItem('usuarioLogado', JSON.stringify(usuario))
      setUsuarioLogado(usuario)
      prepararDadosAcademico(usuario)
      setSenhaLogin('')
      setPaginaAcademico('ponto')
      setPaginaSupervisor('dashboard')
    } catch (erro) {
      setMensagemErro((erro as Error).message)
    }
  }

  const cadastrar = async (tipo: TipoUsuario) => {
    limparMensagens()
    const formulario = tipo === 'ACADEMICO' ? cadastroAcademico : cadastroSupervisor

    if (!validarCpf(formulario.cpf)) {
      setMensagemErro('Informe um CPF com 11 números.')
      return
    }

    const erroSenha = validarSenha(formulario.senha, formulario.confirmarSenha)
    if (erroSenha) {
      setMensagemErro(erroSenha)
      return
    }

    try {
      await chamarApi<Usuario>(
        tipo === 'ACADEMICO' ? '/api/usuarios/cadastro-academico' : '/api/usuarios/cadastro-supervisor',
        {
          method: 'POST',
          body: JSON.stringify({
            ...formulario,
            cpf: somenteNumeros(formulario.cpf),
            dataNascimento: formulario.dataNascimento || null
          })
        }
      )

      if (tipo === 'ACADEMICO') setCadastroAcademico(cadastroInicial)
      if (tipo === 'SUPERVISOR') setCadastroSupervisor(cadastroInicial)
      setAreaLogin(tipo)
      setTelaAutenticacao('login')
      setMensagemSucesso('Cadastro criado com sucesso. Entre no portal com seu CPF e senha.')
    } catch (erro) {
      setMensagemErro((erro as Error).message)
    }
  }

  const sair = () => {
    localStorage.removeItem('usuarioLogado')
    setUsuarioLogado(null)
    setPontoHoje(null)
    setHistoricoMensal([])
    setAcademicos([])
    setAcademicoSelecionado(null)
  }

  const registrarEntrada = async () => {
    if (!usuarioLogado) return
    limparMensagens()

    try {
      const ponto = await chamarApi<PontoResumo>(`/api/ponto/presente/${usuarioLogado.id}`, { method: 'POST' })
      setPontoHoje(ponto)
      await buscarHistoricoMensal(usuarioLogado.id, anoHistorico, mesHistorico)
      setMensagemSucesso('Entrada registrada com sucesso.')
    } catch (erro) {
      setMensagemErro((erro as Error).message)
    }
  }

  const registrarSaida = async () => {
    if (!usuarioLogado) return
    limparMensagens()

    try {
      const ponto = await chamarApi<PontoResumo>(`/api/ponto/saida/${usuarioLogado.id}`, { method: 'POST' })
      setPontoHoje(ponto)
      await buscarHistoricoMensal(usuarioLogado.id, anoHistorico, mesHistorico)
      setMensagemSucesso('Saída registrada com sucesso.')
    } catch (erro) {
      setMensagemErro((erro as Error).message)
    }
  }

  const salvarMeusDados = async () => {
    if (!usuarioLogado) return
    limparMensagens()

    try {
      const atualizado = await chamarApi<Usuario>(`/api/usuarios/${usuarioLogado.id}/meus-dados`, {
        method: 'PUT',
        body: JSON.stringify({
          ...dadosAcademico,
          dataNascimento: dadosAcademico.dataNascimento || null
        })
      })

      localStorage.setItem('usuarioLogado', JSON.stringify(atualizado))
      setUsuarioLogado(atualizado)
      prepararDadosAcademico(atualizado)
      setMensagemSucesso('Dados atualizados com sucesso.')
    } catch (erro) {
      setMensagemErro((erro as Error).message)
    }
  }

  const abrirAcademicoSupervisor = async (academico: AcademicoSupervisor) => {
    limparMensagens()

    try {
      const detalhe = await chamarApi<AcademicoSupervisor>(`/api/supervisor/academicos/${academico.id}`)
      setAcademicoSelecionado(detalhe)
      prepararEdicaoSupervisor(detalhe)
      setPaginaSupervisor('academico')
      setAbaAcademicoSupervisor('dados')
      await buscarHistoricoMensal(detalhe.id, anoHistorico, mesHistorico)
    } catch (erro) {
      setMensagemErro((erro as Error).message)
    }
  }

  const salvarAcademicoSupervisor = async () => {
    if (!academicoSelecionado || !usuarioLogado) return
    limparMensagens()

    try {
      const atualizado = await chamarApi<AcademicoSupervisor>(`/api/supervisor/academicos/${academicoSelecionado.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...edicaoSupervisor,
          supervisorId: usuarioLogado.id,
          dataNascimento: edicaoSupervisor.dataNascimento || null
        })
      })

      setAcademicoSelecionado(atualizado)
      prepararEdicaoSupervisor(atualizado)
      await buscarAcademicos()
      setMensagemSucesso('Dados do acadêmico salvos com sucesso.')
    } catch (erro) {
      setMensagemErro((erro as Error).message)
    }
  }

  const registrarAusencia = async () => {
    if (!academicoSelecionado || !usuarioLogado) return
    limparMensagens()

    try {
      await chamarApi('/api/supervisor/ausencias', {
        method: 'POST',
        body: JSON.stringify({
          academicoId: academicoSelecionado.id,
          data: dataAusencia,
          tipo: tipoAusencia,
          observacao: '',
          supervisorId: usuarioLogado.id
        })
      })

      const detalheAtualizado = await chamarApi<AcademicoSupervisor>(`/api/supervisor/academicos/${academicoSelecionado.id}`)
      setAcademicoSelecionado(detalheAtualizado)
      prepararEdicaoSupervisor(detalheAtualizado)
      await buscarHistoricoMensal(academicoSelecionado.id, anoHistorico, mesHistorico)
      await buscarAcademicos()
      setMensagemSucesso('Ponto atualizado com sucesso.')
    } catch (erro) {
      setMensagemErro((erro as Error).message)
    }
  }

  const salvarObservacao = async (dia: DiaHistorico) => {
    if (!academicoSelecionado || !usuarioLogado) return
    limparMensagens()

    try {
      await chamarApi(`/api/supervisor/historico/${academicoSelecionado.id}/${anoHistorico}/${mesHistorico}/${dia.dia}/observacao`, {
        method: 'PUT',
        body: JSON.stringify({
          observacao: observacoes[dia.dia] || '',
          supervisorId: usuarioLogado.id
        })
      })

      await buscarHistoricoMensal(academicoSelecionado.id, anoHistorico, mesHistorico)
      setMensagemSucesso('Observação salva.')
    } catch (erro) {
      setMensagemErro((erro as Error).message)
    }
  }

  const gerarRelatorio = async () => {
    const academico = academicos.find((item) => item.id === Number(relatorioAcademicoId))
    if (!academico) {
      setMensagemErro('Selecione um acadêmico para gerar o relatório.')
      return
    }

    const dias = await chamarApi<DiaHistorico[]>(`/api/ponto/historico-mensal/${academico.id}/${relatorioAno}/${relatorioMes}`)
    const totalHoras = dias.reduce((total, dia) => total + (dia.horasCumpridas || 0), 0)

    const linhas = dias.map((dia) => {
      const fimSemanaOuFeriado = dia.tipoDia === 'SABADO' || dia.tipoDia === 'DOMINGO' || dia.tipoDia === 'FERIADO'
      const tipoDia = dia.tipoDia === 'FERIADO' ? 'FERIADO' : dia.tipoDia === 'SABADO' ? 'SABADO' : dia.tipoDia === 'DOMINGO' ? 'DOMINGO' : ''
      const observacao = dia.descricaoFeriado || dia.observacaoSupervisor || ''
      return `
        <tr>
          <td>${dia.dia}</td>
          <td>${fimSemanaOuFeriado ? tipoDia : formatarHora(dia.entrada || dia.horaEntrada)}</td>
          <td>${fimSemanaOuFeriado ? tipoDia : formatarHora(dia.saida || dia.horaSaida)}</td>
          <td></td>
          <td>${observacao}</td>
        </tr>
      `
    }).join('')

    const janela = window.open('', '_blank')
    if (!janela) return

    janela.document.write(`
      <html>
        <head>
          <title>Ficha de Presença</title>
          <style>
            @page { size: A4; margin: 14mm; }
            body { font-family: Arial, sans-serif; color: #111827; font-size: 11px; }
            h1 { font-size: 18px; text-align: center; margin: 0 0 14px; letter-spacing: 1px; }
            .cabecalho { display: grid; grid-template-columns: 1.8fr 1.1fr 0.9fr 1.1fr; gap: 6px 14px; margin-bottom: 10px; text-transform: uppercase; }
            .mes { font-size: 14px; font-weight: 700; margin: 8px 0; text-transform: uppercase; }
            table { width: 100%; border-collapse: collapse; font-size: 10.5px; }
            th, td { border: 1px solid #1f2937; padding: 4px 6px; height: 22px; }
            th { background: #f1f5f9; text-align: center; }
            td:nth-child(1), td:nth-child(2), td:nth-child(3), td:nth-child(4) { text-align: center; }
            .rodape { margin-top: 10px; display: grid; gap: 12px; }
            .carga { font-weight: 700; }
            .assinatura { width: 46%; border-top: 1px solid #111827; text-align: center; padding-top: 6px; margin-top: 30px; margin-left: auto; }
            .observacoes { font-size: 10px; line-height: 1.35; }
          </style>
        </head>
        <body>
          <h1>FICHA DE PRESENÇA</h1>
          <section class="cabecalho">
            <div><strong>NOME:</strong> ${academico.nome}</div>
            <div><strong>PROGRAMA:</strong> ${academico.academico?.ensino || 'Não informado'}</div>
            <div><strong>CARGA HORÁRIA SEMANAL:</strong> ${academico.academico?.cargaHorariaSemanal || 0}H</div>
            <div><strong>UNIDADE/ÓRGÃO:</strong> ${academico.orgao}</div>
          </section>
          <div class="mes">${meses2026[relatorioMes - 1]}/${relatorioAno}</div>
          <table>
            <thead>
              <tr>
                <th>Dia</th>
                <th>Entrada</th>
                <th>Saída</th>
                <th>Assinatura do Estagiário</th>
                <th>Observações do Supervisor</th>
              </tr>
            </thead>
            <tbody>${linhas}</tbody>
          </table>
          <section class="rodape">
            <div class="carga">Carga horária total: ${totalHoras}h</div>
            <div class="assinatura">Assinatura e carimbo do Supervisor</div>
            <div class="observacoes">
              <strong>Observações:</strong><br />
              I) No campo OBSERVAÇÕES DO SUPERVISOR informar os seguintes casos: atrasos, período das faltas justificadas e não justificadas, período de licença maternidade, período de férias etc.<br />
              II) No campo CARGA HORÁRIA TOTAL informar a carga horária total do mês em questão.
            </div>
          </section>
          <script>window.print()</script>
        </body>
      </html>
    `)
    janela.document.close()
  }

  const obterAcademicoRelatorio = () => {
    const academico = academicos.find((item) => item.id === Number(relatorioAcademicoId))
    if (!academico) {
      setMensagemErro('Selecione um acadêmico.')
      return null
    }
    return academico
  }

  const encaminharCrachaPorEmail = () => {
    const academico = obterAcademicoRelatorio()
    if (!academico) return

    const assunto = encodeURIComponent('Solicitação de crachá - Sistema de Ponto')
    const corpo = encodeURIComponent(
      `Olá, ${academico.nome}.\n\nSua solicitação de crachá foi preparada no Sistema de Ponto. Confira seus dados pessoais e devolva as informações pendentes, se necessário.\n\nAtenciosamente,\n${usuarioLogado?.nome || 'Supervisão'}`
    )

    window.location.href = `mailto:${academico.email}?subject=${assunto}&body=${corpo}`
  }

  const academicosFiltrados = useMemo(() => {
    const termo = filtroAcademicos.trim().toLowerCase()
    if (!termo) return academicos
    return academicos.filter((academico) => academico.nome.toLowerCase().includes(termo))
  }, [academicos, filtroAcademicos])

  const resumoSupervisor = useMemo(() => {
    const presentes = academicos.filter((academico) => academico.registroHoje?.presente).length
    const ausentes = academicos.filter((academico) => academico.registroHoje?.ausente).length
    const pendencias = academicos.length - presentes - ausentes
    return { presentes, ausentes, pendencias: Math.max(0, pendencias) }
  }, [academicos])

  const orgaoAcademico = formatarOrgao(usuarioLogado?.orgao)
  const formatarHorarioPrevisto = (valor?: string | null) => {
    if (!valor || valor.toLowerCase().includes('definir')) return 'A definir'
    return valor.replace(/\s+as\s+/i, ' às ').replace(/\s+às\s+/i, ' às ')
  }
  const horarioPrevistoAcademico = formatarHorarioPrevisto(usuarioLogado?.academico?.horario)
  const horarioSupervisor = extrairHorarioTela(edicaoSupervisor.horario)
  const exibirSaidaPonto = (ponto?: PontoResumo | null) => {
    if (ponto?.saida || ponto?.horaSaida) return formatarHora(ponto.saida || ponto.horaSaida)
    if (ponto?.entrada || ponto?.horaEntrada) return 'Em andamento'
    return '--'
  }
  const exibirHorasPonto = (ponto?: PontoResumo | null) => {
    const entrada = ponto?.entrada || ponto?.horaEntrada
    if (!entrada) return '--'

    const saida = ponto?.saida || ponto?.horaSaida
    const inicio = new Date(entrada)
    const fim = saida ? new Date(saida) : horaAtual
    const totalMinutos = Math.max(0, Math.floor((fim.getTime() - inicio.getTime()) / 60000))
    const horas = Math.floor(totalMinutos / 60)
    const minutos = totalMinutos % 60

    return `${horas}h ${String(minutos).padStart(2, '0')}min`
  }

  const renderForcaSenha = (senha: string) => {
    if (!senha) return null
    const forca = calcularForcaSenha(senha)

    return (
      <div className={`senha-forca ${forca.classe}`}>
        <div>
          <span style={{ width: `${forca.largura}%` }} />
        </div>
        <small>{forca.texto}</small>
      </div>
    )
  }

  const renderCadastro = (tipo: TipoUsuario) => {
    const formulario = tipo === 'ACADEMICO' ? cadastroAcademico : cadastroSupervisor
    const setFormulario = tipo === 'ACADEMICO' ? setCadastroAcademico : setCadastroSupervisor

    return (
      <div className="login-card cadastro-card">
        <div className="login-card-cabecalho titulo-com-icone">
          {tipo === 'ACADEMICO' ? <FaUserGraduate /> : <FaUserTie />}
          <h3>Primeiro Acesso</h3>
        </div>

        <div className="form-section cadastro-section">
          <h3>Dados pessoais</h3>
          <input
            value={formulario.nomeCompleto}
            onChange={(e) => setFormulario((atual) => ({ ...atual, nomeCompleto: e.target.value }))}
            placeholder="Nome completo"
          />
          <input
            value={formulario.cpf}
            onChange={(e) => setFormulario((atual) => ({ ...atual, cpf: aplicarMascaraCpf(e.target.value) }))}
            placeholder="CPF"
          />
          <input
            type="date"
            value={formulario.dataNascimento}
            onChange={(e) => setFormulario((atual) => ({ ...atual, dataNascimento: e.target.value }))}
            placeholder="Data de nascimento"
            aria-label="Data de nascimento"
          />
          <input
            value={formulario.orgao}
            onChange={(e) => setFormulario((atual) => ({ ...atual, orgao: e.target.value }))}
            placeholder="Órgão"
          />
          <input
            type="email"
            value={formulario.email}
            onChange={(e) => setFormulario((atual) => ({ ...atual, email: e.target.value }))}
            placeholder="E-mail"
          />
        </div>

        <div className="form-section cadastro-section">
          <h3>Dados de acesso</h3>
          <input
            type="password"
            value={formulario.senha}
            onChange={(e) => setFormulario((atual) => ({ ...atual, senha: e.target.value }))}
            placeholder="Senha"
          />
          {renderForcaSenha(formulario.senha)}
          <input
            type="password"
            value={formulario.confirmarSenha}
            onChange={(e) => setFormulario((atual) => ({ ...atual, confirmarSenha: e.target.value }))}
            placeholder="Confirmar senha"
          />
        </div>

        {mensagemErro && <span className="mensagem-erro">{mensagemErro}</span>}
        {mensagemSucesso && <span className="mensagem-sucesso">{mensagemSucesso}</span>}

        <button className="btn-principal" onClick={() => cadastrar(tipo)}>
          Criar cadastro
        </button>
        <button className="btn-secundario" onClick={() => setTelaAutenticacao('login')}>
          Voltar ao login
        </button>
      </div>
    )
  }

  if (!usuarioLogado) {
    return (
      <main className="login-page">
        <section className="conteudo">
          <div className="lado-esquerdo">
            <img src={logoPrefeitura} alt="Prefeitura do Rio - Saúde" className="login-logo-esquerda" />
            <div className="login-destaque">
              <strong>{areaSupervisor ? 'Portal do Supervisor' : 'Portal Acadêmicos Bolsistas'}</strong>
              <span>Secretaria Municipal de Saúde do Rio de Janeiro</span>
            </div>

            <div className="login-seguranca">
              <GoCheckCircle />
              <div>
                <strong>Ambiente seguro</strong>
                <span>Seus dados são protegidos com segurança e privacidade.</span>
              </div>
            </div>

            <div className="ze-gotinha" role="img" aria-label="Zé Gotinha">
              <div className="gota-corpo">
                <span className="gota-olho esquerdo" />
                <span className="gota-olho direito" />
                <span className="gota-sorriso" />
                <span className="gota-braco esquerdo" />
                <span className="gota-braco direito" />
              </div>
              <div className="gota-sombra" />
            </div>
          </div>

          <div className="lado-direito">
            <img src={logoPrefeitura} alt="Prefeitura do Rio" className="logo-prefeitura login-logo" />

            {telaAutenticacao === 'cadastroAcademico' && renderCadastro('ACADEMICO')}
            {telaAutenticacao === 'cadastroSupervisor' && renderCadastro('SUPERVISOR')}

            {telaAutenticacao === 'recuperarSenha' && (
              <div className="login-card">
                <div className="login-card-cabecalho titulo-com-icone">
                  <FaEnvelope />
                  <h3>Esqueci a senha</h3>
                </div>
                <span className="mensagem-info">
                  Procure o supervisor ou a administração do sistema para redefinir sua senha.
                </span>
                <button className="btn-secundario" onClick={() => setTelaAutenticacao('login')}>
                  Voltar
                </button>
              </div>
            )}

            {telaAutenticacao === 'login' && (
              <div className="login-card">
                <div className="login-titulo">
                  <h3>Acesse sua conta</h3>
                  <span>Informe seus dados para entrar no portal.</span>
                </div>

                <div className="login-tabs">
                  <button
                    className={areaLogin === 'ACADEMICO' ? 'ativo' : ''}
                    onClick={() => {
                      setAreaLogin('ACADEMICO')
                      limparMensagens()
                    }}
                  >
                    <GoPerson /> Acadêmico
                  </button>
                  <button
                    className={areaLogin === 'SUPERVISOR' ? 'ativo' : ''}
                    onClick={() => {
                      setAreaLogin('SUPERVISOR')
                      limparMensagens()
                    }}
                  >
                    <FaUserTie /> Supervisor
                  </button>
                </div>

                <input
                  value={cpfLogin}
                  onChange={(e) => setCpfLogin(aplicarMascaraCpf(e.target.value))}
                  placeholder="CPF"
                />
                <input
                  type="password"
                  value={senhaLogin}
                  onChange={(e) => setSenhaLogin(e.target.value)}
                  placeholder="Senha"
                />

                {mensagemErro && <span className="mensagem-erro">{mensagemErro}</span>}
                {mensagemSucesso && <span className="mensagem-sucesso">{mensagemSucesso}</span>}

                <button className="btn-principal" onClick={lidarComLogin}>
                  Entrar no portal
                </button>

                <div className="login-links">
                  <button onClick={() => setTelaAutenticacao('recuperarSenha')}>Esqueci a senha</button>
                  <div className="login-cadastro-linha">
                    <span>Ainda não tem acesso?</span>
                    <button onClick={() => setTelaAutenticacao(areaLogin === 'SUPERVISOR' ? 'cadastroSupervisor' : 'cadastroAcademico')}>
                      Solicitar cadastro
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    )
  }

  const renderMensagens = () => (
    <>
      {mensagemErro && <span className="mensagem-erro painel">{mensagemErro}</span>}
      {mensagemSucesso && <span className="mensagem-sucesso painel">{mensagemSucesso}</span>}
    </>
  )

  const renderTabelaHistorico = (editavel: boolean) => (
    <div className="tabela-scroll">
      <table className="tabela-historico tabela-historico-mensal">
        <thead>
          <tr>
            <th>Data</th>
            <th>Tipo</th>
            <th>Entrada</th>
            <th>Saída</th>
            <th>Observação</th>
            {editavel && <th>Salvar</th>}
          </tr>
        </thead>
        <tbody>
          {historicoMensal.map((dia) => (
            <tr key={dia.dia}>
              <td className="coluna-data">{formatarData(dia.data)}</td>
              <td><StatusBadge status={dia.tipoDia !== 'UTIL' ? dia.tipoDia : dia.status} /></td>
              <td>{dia.tipoDia === 'FERIADO' ? '-' : formatarHora(dia.entrada || dia.horaEntrada)}</td>
              <td>{dia.tipoDia === 'FERIADO' ? '-' : formatarHora(dia.saida || dia.horaSaida)}</td>
              <td>
                {editavel ? (
                  <input
                    value={observacoes[dia.dia] || ''}
                    onChange={(e) => setObservacoes((atual) => ({ ...atual, [dia.dia]: e.target.value }))}
                    placeholder="Observação"
                  />
                ) : (
                  dia.observacaoSupervisor || dia.descricaoFeriado || '-'
                )}
              </td>
              {editavel && (
                <td>
                  <button className="btn-tabela-acao" onClick={() => salvarObservacao(dia)}>
                    <FaSave />
                    Salvar
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  if (usuarioLogado.tipoUsuario === 'ACADEMICO') {
    return (
      <main className="dashboard-page">
        <header className="dashboard-header">
          <div className="dashboard-brand">
            <img src={logoPrefeitura} alt="Prefeitura do Rio" className="dashboard-logo" />
            <div className="dashboard-linha" />
            <div className="dashboard-titulo">
              <h1>Portal Acadêmico</h1>
              <span className="header-orgao">Secretaria Municipal de Saúde do Rio de Janeiro</span>
            </div>
          </div>
          <div className="usuario-topo">
            <span>{usuarioLogado.nome}</span>
            <small>Acadêmico bolsista</small>
          </div>
        </header>

        <nav className="menu-principal">
          <button className={paginaAcademico === 'ponto' ? 'ativo' : ''} onClick={async () => {
            await atualizarUsuarioLogado()
            setPaginaAcademico('ponto')
          }}>
            <GoClock /> Ponto eletrônico
          </button>
          <button className={paginaAcademico === 'meusDados' ? 'ativo' : ''} onClick={async () => {
            await atualizarUsuarioLogado()
            setPaginaAcademico('meusDados')
          }}>
            <GoPerson /> Meus dados
          </button>
          <button
            className={paginaAcademico === 'historico' ? 'ativo' : ''}
            onClick={async () => {
              setPaginaAcademico('historico')
              await buscarHistoricoMensal(usuarioLogado.id, anoHistorico, mesHistorico)
            }}
          >
            <GoCalendar /> Histórico mensal
          </button>
          <button className="menu-extra" type="button"><GoChecklist /> Comunicados</button>
          <button className="menu-extra" type="button"><GoFile /> Documentos</button>
          <button className="menu-extra" type="button"><GoCheckCircle /> Ajuda</button>
          <button className="menu-sair" type="button" onClick={sair}><GoDownload /> Sair do portal</button>
        </nav>

        <span className="boas-vindas-fixa">Bem-vindo(a), {usuarioLogado.nome} bolsista</span>

        <section className="ponto-container">
          <div className={`ponto-card ${paginaAcademico === 'ponto' ? 'ponto-card-antigo' : ''}`}>
            {renderMensagens()}

            {paginaAcademico === 'ponto' && (
              <>
                <section className="ponto-antigo-layout">
                  <div className="portal-page-title">
                    <h2>Ponto eletrônico</h2>
                  </div>

                  <div className="ponto-antigo-resumo">
                    <div>
                      <GoPerson className="resumo-icone perfil" />
                      <small>Acadêmico</small>
                      <strong>{usuarioLogado.nome}</strong>
                      <span>CPF: {aplicarMascaraCpf(usuarioLogado.cpf)}</span>
                    </div>
                    <div>
                      <GoGraph className="resumo-icone calendario" />
                      <small>Órgão</small>
                      <strong>{orgaoAcademico}</strong>
                      <span>Subsecretaria de Gestão</span>
                    </div>
                    <div>
                      <GoClock className="resumo-icone horario" />
                      <small>Horário</small>
                      <strong>{horarioPrevistoAcademico}</strong>
                      <span>Jornada prevista</span>
                    </div>
                    <div>
                      <GoCalendar className="resumo-icone calendario" />
                      <small>Carga horária semanal</small>
                      <strong>{usuarioLogado.academico?.cargaHorariaSemanal || 30} horas</strong>
                      <span>{formatarDiaSemana(horaAtual)}, {formatarDataLonga(horaAtual)}</span>
                    </div>
                  </div>

                  <div className="ponto-acoes-grid">
                    <section className="ponto-antigo-secao">
                      <h3>Registrar ponto</h3>
                      <div className="botoes-status botoes-status-antigo">
                        <button onClick={registrarEntrada}><GoCheckCircle /> Marcar presença</button>
                        <button onClick={registrarSaida}><GoChecklist /> Registrar saída</button>
                      </div>
                    </section>

                    <section className="ponto-antigo-secao relogio-hoje-card">
                      <div className="tempo-card-grid">
                        <div>
                          <GoClock />
                          <strong>{horaAtual.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</strong>
                        </div>
                        <div>
                          <GoCalendar />
                          <strong>{formatarDataLonga(horaAtual)}</strong>
                          <span>{formatarDiaSemana(horaAtual)}</span>
                        </div>
                      </div>
                    </section>
                  </div>

                  <section className="ponto-antigo-secao">
                    <h3>Ponto do dia</h3>
                    <div className="tabela-scroll">
                      <table className="tabela-historico tabela-ponto-antigo">
                        <thead>
                          <tr>
                            <th>Data</th>
                            <th>Horário</th>
                            <th>Entrada</th>
                            <th>Saída</th>
                            <th>Status</th>
                            <th>Horas cumpridas</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>{horaAtual.toLocaleDateString('pt-BR')}</td>
                            <td>{horarioPrevistoAcademico}</td>
                            <td>{formatarHora(pontoHoje?.entrada || pontoHoje?.horaEntrada)}</td>
                            <td>{exibirSaidaPonto(pontoHoje)}</td>
                            <td><StatusBadge status={pontoHoje?.status} /></td>
                            <td>{exibirHorasPonto(pontoHoje)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </section>
                </section>
              </>
            )}

            {paginaAcademico === 'meusDados' && (
              <>
                <div className="ponto-card-topo topo-com-acoes">
                  <div>
                    <h2>Meus dados</h2>
                    <p>Ficha cadastral do acadêmico bolsista.</p>
                  </div>
                  <button className="btn-secundario compacto" onClick={() => setPaginaAcademico('ponto')}>
                    Voltar para o ponto
                  </button>
                </div>
                <div className="dados-resumo">
                  <div>
                    <small>Nome</small>
                    <strong>{usuarioLogado.nome}</strong>
                  </div>
                  <div>
                    <small>CPF</small>
                    <strong>{aplicarMascaraCpf(usuarioLogado.cpf)}</strong>
                  </div>
                  <div>
                    <small>Perfil</small>
                    <strong>Acadêmico bolsista</strong>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Dados pessoais</h3>
                  <div className="form-grid-duplo campos-sem-label">
                    <label>Nome completo<input value={usuarioLogado.nomeCompleto || usuarioLogado.nome} disabled placeholder="Nome completo" aria-label="Nome completo" /></label>
                    <label>CPF<input value={aplicarMascaraCpf(usuarioLogado.cpf)} disabled placeholder="CPF" aria-label="CPF" /></label>
                    <label>Data de nascimento<input type="date" value={dadosAcademico.dataNascimento} onChange={(e) => setDadosAcademico((a) => ({ ...a, dataNascimento: e.target.value }))} placeholder="Data de nascimento" aria-label="Data de nascimento" /></label>
                    <label>Sexo<input value={dadosAcademico.sexo} onChange={(e) => setDadosAcademico((a) => ({ ...a, sexo: e.target.value }))} placeholder="Sexo" aria-label="Sexo" /></label>
                    <label>Estado civil<input value={dadosAcademico.estadoCivil} onChange={(e) => setDadosAcademico((a) => ({ ...a, estadoCivil: e.target.value }))} placeholder="Estado civil" aria-label="Estado civil" /></label>
                    <label>Profissão<input value={dadosAcademico.profissao} onChange={(e) => setDadosAcademico((a) => ({ ...a, profissao: e.target.value }))} placeholder="Profissão" aria-label="Profissão" /></label>
                    <label>Escolaridade<input value={dadosAcademico.escolaridade} onChange={(e) => setDadosAcademico((a) => ({ ...a, escolaridade: e.target.value }))} placeholder="Escolaridade" aria-label="Escolaridade" /></label>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Dados acadêmicos</h3>
                  <div className="form-grid-duplo campos-sem-label">
                    <label>Tipo de ensino<select aria-label="Tipo de ensino" value={dadosAcademico.tipoEnsino} onChange={(e) => setDadosAcademico((a) => ({ ...a, tipoEnsino: e.target.value }))}><option value="">Tipo de ensino</option><option value="Médio">Médio</option><option value="Superior">Superior</option></select></label>
                    <label>Instituição de ensino<input value={dadosAcademico.instituicaoEnsino} onChange={(e) => setDadosAcademico((a) => ({ ...a, instituicaoEnsino: e.target.value }))} placeholder="Instituição de ensino" aria-label="Instituição de ensino" /></label>
                    <label>Curso<input value={dadosAcademico.curso} onChange={(e) => setDadosAcademico((a) => ({ ...a, curso: e.target.value }))} placeholder="Curso" aria-label="Curso" /></label>
                    <label>Período/Semestre atual<input value={dadosAcademico.periodoSemestre} onChange={(e) => setDadosAcademico((a) => ({ ...a, periodoSemestre: e.target.value }))} placeholder="Período ou semestre" aria-label="Período ou semestre atual" /></label>
                    <label className="campo-largo">Programa / Curso<input value={dadosAcademico.ensino} onChange={(e) => setDadosAcademico((a) => ({ ...a, ensino: e.target.value }))} placeholder="Programa ou curso" aria-label="Programa ou curso" /></label>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Dados de contato</h3>
                  <div className="form-grid-duplo campos-sem-label">
                    <label>Telefone celular<input value={dadosAcademico.telefoneCelular} onChange={(e) => setDadosAcademico((a) => ({ ...a, telefoneCelular: aplicarMascaraCelular(e.target.value) }))} placeholder="Telefone celular" aria-label="Telefone celular" /></label>
                    <label>E-mail<input type="email" value={dadosAcademico.email} onChange={(e) => setDadosAcademico((a) => ({ ...a, email: e.target.value }))} placeholder="E-mail" aria-label="E-mail" /></label>
                    <label>Telefone residencial<input value={dadosAcademico.telefoneResidencial} onChange={(e) => setDadosAcademico((a) => ({ ...a, telefoneResidencial: aplicarMascaraTelefone(e.target.value) }))} placeholder="Telefone residencial" aria-label="Telefone residencial" /></label>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Dados de endereço</h3>
                  <div className="form-grid-duplo campos-sem-label">
                    <label>CEP<input value={dadosAcademico.cep} onChange={(e) => setDadosAcademico((a) => ({ ...a, cep: aplicarMascaraCep(e.target.value) }))} placeholder="CEP" aria-label="CEP" /></label>
                    <label>Logradouro<input value={dadosAcademico.logradouro} onChange={(e) => setDadosAcademico((a) => ({ ...a, logradouro: e.target.value }))} placeholder="Logradouro" aria-label="Logradouro" /></label>
                    <label>Número<input value={dadosAcademico.numero} onChange={(e) => setDadosAcademico((a) => ({ ...a, numero: e.target.value }))} placeholder="Número" aria-label="Número" /></label>
                    <label>Complemento<input value={dadosAcademico.complemento} onChange={(e) => setDadosAcademico((a) => ({ ...a, complemento: e.target.value }))} placeholder="Complemento" aria-label="Complemento" /></label>
                    <label>Bairro<input value={dadosAcademico.bairro} onChange={(e) => setDadosAcademico((a) => ({ ...a, bairro: e.target.value }))} placeholder="Bairro" aria-label="Bairro" /></label>
                    <label>Cidade<input value={dadosAcademico.cidade} onChange={(e) => setDadosAcademico((a) => ({ ...a, cidade: e.target.value }))} placeholder="Cidade" aria-label="Cidade" /></label>
                    <label>Estado<input value={dadosAcademico.estado} onChange={(e) => setDadosAcademico((a) => ({ ...a, estado: e.target.value }))} placeholder="Estado" aria-label="Estado" /></label>
                    <label className="campo-largo">Endereço completo<input value={dadosAcademico.endereco} onChange={(e) => setDadosAcademico((a) => ({ ...a, endereco: e.target.value }))} placeholder="Endereço completo" aria-label="Endereço completo" /></label>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Vínculo institucional</h3>
                  <div className="perfil-grid painel-dados-fixos">
                    <div><small>Órgão</small><strong>{formatarOrgao(usuarioLogado.orgao)}</strong></div>
                    <div><small>Setor de alocação</small><strong>{usuarioLogado.academico?.setorAlocacao || 'A definir pelo supervisor'}</strong></div>
                    <div><small>Horário</small><strong>{formatarHorarioPrevisto(usuarioLogado.academico?.horario) || 'A definir pelo supervisor'}</strong></div>
                    <div><small>Carga horária</small><strong>{usuarioLogado.academico?.cargaHorariaSemanal || 30}h semanais</strong></div>
                    <div><small>Dados da contratação</small><strong>{usuarioLogado.academico?.dadosContratacao || 'A definir pelo supervisor'}</strong></div>
                    <div><small>Situação</small><strong>{usuarioLogado.academico?.situacaoAcademico || 'Acadêmico ativo'}</strong></div>
                  </div>
                </div>

                <button className="btn-principal compacto" onClick={salvarMeusDados}><FaSave /> Atualizar dados</button>
              </>
            )}

            {paginaAcademico === 'historico' && (
              <>
                <div className="ponto-card-topo historico-cabecalho">
                  <div>
                    <h2>Histórico mensal</h2>
                    <p>Selecione um mês para consultar entrada, saída e observações registradas.</p>
                  </div>
                  <button className="btn-secundario compacto" onClick={() => setPaginaAcademico('ponto')}>
                    Voltar para o ponto
                  </button>
                  <div className="meses-lista">
                    {meses2026.map((mes, indice) => (
                      <button
                        key={mes}
                        className={mesHistorico === indice + 1 ? 'ativo' : ''}
                        onClick={async () => {
                          setMesHistorico(indice + 1)
                          await buscarHistoricoMensal(usuarioLogado.id, anoHistorico, indice + 1)
                        }}
                      >
                        {mes}
                      </button>
                    ))}
                  </div>
                </div>
                {renderTabelaHistorico(false)}
              </>
            )}
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="dashboard-page supervisor-page">
      <header className="dashboard-header">
        <div className="dashboard-brand">
          <img src={logoPrefeitura} alt="Prefeitura do Rio" className="dashboard-logo" />
          <div className="dashboard-linha" />
          <div className="dashboard-titulo">
            <h1>Portal do Supervisor</h1>
            <span className="header-orgao">Subsecretaria de Gestão</span>
          </div>
        </div>
        <div className="usuario-topo">
          <span>{usuarioLogado.nome}</span>
          <small>Supervisor</small>
        </div>
      </header>

      <nav className="menu-principal">
        <button className={paginaSupervisor === 'dashboard' ? 'ativo' : ''} onClick={() => setPaginaSupervisor('dashboard')}>
          <GoGraph /> Acadêmicos
        </button>
        <button className={paginaSupervisor === 'relatorios' ? 'ativo' : ''} onClick={() => setPaginaSupervisor('relatorios')}>
          <GoFile /> Relatórios
        </button>
        <button className="menu-extra" type="button"><GoChecklist /> Comunicados</button>
        <button className="menu-extra" type="button"><GoFile /> Documentos</button>
        <button className="menu-extra" type="button"><GoCheckCircle /> Ajuda</button>
        <button className="menu-sair" type="button" onClick={sair}><GoDownload /> Sair do portal</button>
      </nav>

      <section className="supervisor-shell">
        {renderMensagens()}

        {paginaSupervisor === 'dashboard' && (
          <>
            <div className="supervisor-topo">
              <div>
                <h2>Bem-vindo(a), {usuarioLogado.nome}</h2>
                <span className="eyebrow">{formatarOrgao(usuarioLogado.orgao)}</span>
              </div>
              <button className="btn-secundario compacto" onClick={buscarAcademicos}>Atualizar</button>
            </div>

            <div className="metricas-grid metricas-grid-principal">
              <div><small>Total de acadêmicos</small><strong>{academicos.length}</strong></div>
              <div><small>Presentes</small><strong>{resumoSupervisor.presentes}</strong></div>
              <div><small>Ausentes</small><strong>{resumoSupervisor.ausentes}</strong></div>
            </div>

            <section className="tabela-card">
              <div className="tabela-card-topo">
                <div>
                  <h3>Acadêmicos</h3>
                  <p>Busque pelo nome do acadêmico.</p>
                </div>
                <label className="busca-box">
                  <FaSearch />
                  <input value={filtroAcademicos} onChange={(e) => setFiltroAcademicos(e.target.value)} placeholder="Busque pelo nome do acadêmico" />
                </label>
              </div>

              <div className="tabela-scroll">
                <table className="tabela-historico supervisor-table">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Órgão</th>
                      <th>Horário</th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {academicosFiltrados.length === 0 && (
                      <tr>
                        <td colSpan={5} className="tabela-vazia">
                          Nenhum acadêmico encontrado para este órgão.
                        </td>
                      </tr>
                    )}
                    {academicosFiltrados.map((academico) => (
                      <tr key={academico.id}>
                        <td><strong>{academico.nome}</strong></td>
                        <td>{formatarOrgao(academico.orgao)}</td>
                        <td>{academico.academico?.horario || 'A definir'}</td>
                        <td><StatusBadge status={academico.registroHoje?.status} /></td>
                        <td><button className="btn-tabela-acao" onClick={() => abrirAcademicoSupervisor(academico)}><FaUserEdit /> Visualizar/Editar</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <div className="pendencias-card">
              <div>
                <small>Pendências</small>
                <strong>{resumoSupervisor.pendencias}</strong>
              </div>
              <p>Registros sem entrada ou saída no dia atual.</p>
            </div>
          </>
        )}

        {paginaSupervisor === 'academico' && academicoSelecionado && (
          <div className="supervisor-conteudo">
            <div className="acoes-supervisor topo-acoes">
              <button className="btn-secundario compacto" onClick={() => setPaginaSupervisor('dashboard')}>Voltar</button>
              <button className="btn-principal compacto" onClick={() => setPaginaSupervisor('relatorios')}><GoDownload /> Gerar relatório</button>
            </div>
            <div className="abas-supervisor">
              <button className={abaAcademicoSupervisor === 'dados' ? 'ativo' : ''} onClick={() => setAbaAcademicoSupervisor('dados')}>Dados do acadêmico</button>
              <button className={abaAcademicoSupervisor === 'ponto' ? 'ativo' : ''} onClick={() => setAbaAcademicoSupervisor('ponto')}>Ponto Digital</button>
            </div>

            <section className={`ponto-card sem-margem ${abaAcademicoSupervisor === 'dados' ? '' : 'aba-oculta'}`}>
              <div className="ponto-card-topo">
                <h2>{academicoSelecionado.nome}</h2>
                <p>Dados pessoais, informações institucionais e acompanhamento de frequência.</p>
              </div>

              <div className="form-section">
                <h3>Dados pessoais</h3>
                <div className="form-grid-duplo campos-sem-label">
                  <label>Nome completo<input value={edicaoSupervisor.nomeCompleto} onChange={(e) => setEdicaoSupervisor((a) => ({ ...a, nomeCompleto: e.target.value }))} placeholder="Nome completo" aria-label="Nome completo" /></label>
                  <label>CPF<input value={aplicarMascaraCpf(academicoSelecionado.cpf)} disabled placeholder="CPF" aria-label="CPF" /></label>
                  <label>Data de nascimento<input type="date" value={edicaoSupervisor.dataNascimento} onChange={(e) => setEdicaoSupervisor((a) => ({ ...a, dataNascimento: e.target.value }))} placeholder="Data de nascimento" aria-label="Data de nascimento" /></label>
                  <label>Sexo<input value={edicaoSupervisor.sexo} onChange={(e) => setEdicaoSupervisor((a) => ({ ...a, sexo: e.target.value }))} placeholder="Sexo" aria-label="Sexo" /></label>
                  <label>Estado civil<input value={edicaoSupervisor.estadoCivil} onChange={(e) => setEdicaoSupervisor((a) => ({ ...a, estadoCivil: e.target.value }))} placeholder="Estado civil" aria-label="Estado civil" /></label>
                  <label>Profissão<input value={edicaoSupervisor.profissao} onChange={(e) => setEdicaoSupervisor((a) => ({ ...a, profissao: e.target.value }))} placeholder="Profissão" aria-label="Profissão" /></label>
                  <label>Escolaridade<input value={edicaoSupervisor.escolaridade} onChange={(e) => setEdicaoSupervisor((a) => ({ ...a, escolaridade: e.target.value }))} placeholder="Escolaridade" aria-label="Escolaridade" /></label>
                </div>
              </div>

              <div className="form-section">
                <h3>Dados acadêmicos</h3>
                <div className="form-grid-duplo campos-sem-label">
                  <label>Tipo de ensino<select aria-label="Tipo de ensino" value={edicaoSupervisor.tipoEnsino} onChange={(e) => setEdicaoSupervisor((a) => ({ ...a, tipoEnsino: e.target.value }))}><option value="">Tipo de ensino</option><option value="Médio">Médio</option><option value="Superior">Superior</option></select></label>
                  <label>Instituição de ensino<input value={edicaoSupervisor.instituicaoEnsino} onChange={(e) => setEdicaoSupervisor((a) => ({ ...a, instituicaoEnsino: e.target.value }))} placeholder="Instituição de ensino" aria-label="Instituição de ensino" /></label>
                  <label>Curso<input value={edicaoSupervisor.curso} onChange={(e) => setEdicaoSupervisor((a) => ({ ...a, curso: e.target.value }))} placeholder="Curso" aria-label="Curso" /></label>
                  <label>Período/Semestre atual<input value={edicaoSupervisor.periodoSemestre} onChange={(e) => setEdicaoSupervisor((a) => ({ ...a, periodoSemestre: e.target.value }))} placeholder="Período ou semestre" aria-label="Período ou semestre atual" /></label>
                </div>
              </div>

              <div className="form-section">
                <h3>Contato e endereço</h3>
                <div className="form-grid-duplo campos-sem-label">
                  <label>Telefone celular<input value={edicaoSupervisor.telefoneCelular} onChange={(e) => setEdicaoSupervisor((a) => ({ ...a, telefoneCelular: aplicarMascaraCelular(e.target.value) }))} placeholder="Telefone celular" aria-label="Telefone celular" /></label>
                  <label>E-mail<input type="email" value={edicaoSupervisor.email} onChange={(e) => setEdicaoSupervisor((a) => ({ ...a, email: e.target.value }))} placeholder="E-mail" aria-label="E-mail" /></label>
                  <label>Telefone residencial<input value={edicaoSupervisor.telefoneResidencial} onChange={(e) => setEdicaoSupervisor((a) => ({ ...a, telefoneResidencial: aplicarMascaraTelefone(e.target.value) }))} placeholder="Telefone residencial" aria-label="Telefone residencial" /></label>
                  <label>CEP<input value={edicaoSupervisor.cep} onChange={(e) => setEdicaoSupervisor((a) => ({ ...a, cep: aplicarMascaraCep(e.target.value) }))} placeholder="CEP" aria-label="CEP" /></label>
                  <label>Logradouro<input value={edicaoSupervisor.logradouro} onChange={(e) => setEdicaoSupervisor((a) => ({ ...a, logradouro: e.target.value }))} placeholder="Logradouro" aria-label="Logradouro" /></label>
                  <label>Número<input value={edicaoSupervisor.numero} onChange={(e) => setEdicaoSupervisor((a) => ({ ...a, numero: e.target.value }))} placeholder="Número" aria-label="Número" /></label>
                  <label>Complemento<input value={edicaoSupervisor.complemento} onChange={(e) => setEdicaoSupervisor((a) => ({ ...a, complemento: e.target.value }))} placeholder="Complemento" aria-label="Complemento" /></label>
                  <label>Bairro<input value={edicaoSupervisor.bairro} onChange={(e) => setEdicaoSupervisor((a) => ({ ...a, bairro: e.target.value }))} placeholder="Bairro" aria-label="Bairro" /></label>
                  <label>Cidade<input value={edicaoSupervisor.cidade} onChange={(e) => setEdicaoSupervisor((a) => ({ ...a, cidade: e.target.value }))} placeholder="Cidade" aria-label="Cidade" /></label>
                  <label>Estado<input value={edicaoSupervisor.estado} onChange={(e) => setEdicaoSupervisor((a) => ({ ...a, estado: e.target.value }))} placeholder="Estado" aria-label="Estado" /></label>
                  <label className="campo-largo">Endereço completo<input value={edicaoSupervisor.endereco} onChange={(e) => setEdicaoSupervisor((a) => ({ ...a, endereco: e.target.value }))} placeholder="Endereço completo" aria-label="Endereço completo" /></label>
                </div>
              </div>

              <div className="form-section">
                <h3>Dados institucionais</h3>
                <div className="form-grid-duplo campos-sem-label">
                  <label>Órgão<input value={edicaoSupervisor.orgao} onChange={(e) => setEdicaoSupervisor((a) => ({ ...a, orgao: e.target.value }))} placeholder="Órgão" aria-label="Órgão" /></label>
                  <label>Programa/curso<input value={edicaoSupervisor.ensino} onChange={(e) => setEdicaoSupervisor((a) => ({ ...a, ensino: e.target.value }))} placeholder="Programa/curso" aria-label="Programa/curso" /></label>
                  <label>Setor de alocação<input value={edicaoSupervisor.setorAlocacao} onChange={(e) => setEdicaoSupervisor((a) => ({ ...a, setorAlocacao: e.target.value }))} placeholder="Setor de alocação" aria-label="Setor de alocação" /></label>
                  <label>Horário de entrada<input type="time" value={horarioSupervisor.inicio} onChange={(e) => setEdicaoSupervisor((a) => ({ ...a, horario: montarHorarioTela(a.horario, 'inicio', e.target.value) }))} placeholder="Entrada" aria-label="Horário de entrada" /></label>
                  <label>Horário de saída<input type="time" value={horarioSupervisor.fim} onChange={(e) => setEdicaoSupervisor((a) => ({ ...a, horario: montarHorarioTela(a.horario, 'fim', e.target.value) }))} placeholder="Saída" aria-label="Horário de saída" /></label>
                  <label>Carga horária semanal<input type="number" value={edicaoSupervisor.cargaHorariaSemanal} onChange={(e) => setEdicaoSupervisor((a) => ({ ...a, cargaHorariaSemanal: Number(e.target.value) }))} placeholder="Carga horária semanal" aria-label="Carga horária semanal" /></label>
                  <label>Dados da contratação<input value={edicaoSupervisor.dadosContratacao} onChange={(e) => setEdicaoSupervisor((a) => ({ ...a, dadosContratacao: e.target.value }))} placeholder="Dados da contratação" aria-label="Dados da contratação" /></label>
                  <label>Situação do acadêmico<select aria-label="Situação do acadêmico" value={edicaoSupervisor.situacaoAcademico} onChange={(e) => setEdicaoSupervisor((a) => ({ ...a, situacaoAcademico: e.target.value }))}><option>Acadêmico ativo</option><option>Acadêmico desativado</option></select></label>
                </div>
              </div>
              <div className="acoes-supervisor">
                <button className="btn-principal compacto" onClick={salvarAcademicoSupervisor}><FaSave /> Salvar alterações</button>
              </div>
            </section>

            <section className={`ponto-card sem-margem ${abaAcademicoSupervisor === 'ponto' ? '' : 'aba-oculta'}`}>
              <div className="ponto-card-topo">
                <h2>Ponto Digital</h2>
              </div>
              <div className="tabela-scroll">
                <table className="tabela-historico tabela-ponto-antigo">
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Horário</th>
                      <th>Entrada</th>
                      <th>Saída</th>
                      <th>Status</th>
                      <th>Horas cumpridas</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{horaAtual.toLocaleDateString('pt-BR')}</td>
                      <td>{formatarHorarioPrevisto(academicoSelecionado.academico?.horario)}</td>
                      <td>{formatarHora(academicoSelecionado.registroHoje?.entrada || academicoSelecionado.registroHoje?.horaEntrada)}</td>
                      <td>{exibirSaidaPonto(academicoSelecionado.registroHoje)}</td>
                      <td><StatusBadge status={academicoSelecionado.registroHoje?.status} /></td>
                      <td>{exibirHorasPonto(academicoSelecionado.registroHoje)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="ajuste-ponto-inline">
                <div className="form-grid-duplo campos-sem-label">
                  <label>Data<input type="date" value={dataAusencia} onChange={(e) => setDataAusencia(e.target.value)} placeholder="Data" aria-label="Data" /></label>
                  <label>Tipo<select aria-label="Tipo" value={tipoAusencia} onChange={(e) => setTipoAusencia(e.target.value)}><option value="AUSENTE">Falta</option><option value="JUSTIFICADA">Falta justificada</option><option value="REGULARIZADA">Presença regularizada</option></select></label>
                </div>
                <button className="btn-principal compacto" onClick={registrarAusencia}><GoChecklist /> Salvar ajuste do ponto</button>
              </div>
            </section>

            <section className={`ponto-card sem-margem ${abaAcademicoSupervisor === 'ponto' ? '' : 'aba-oculta'}`}>
              <div className="ponto-card-topo historico-cabecalho">
                <h2>Histórico mensal</h2>
                <div className="meses-lista">
                  {meses2026.map((mes, indice) => (
                    <button key={mes} className={mesHistorico === indice + 1 ? 'ativo' : ''} onClick={async () => {
                      setMesHistorico(indice + 1)
                      await buscarHistoricoMensal(academicoSelecionado.id, anoHistorico, indice + 1)
                    }}>{mes}</button>
                  ))}
                </div>
              </div>
              {renderTabelaHistorico(true)}
            </section>
          </div>
        )}

        {paginaSupervisor === 'relatorios' && (
          <section className="ponto-card sem-margem">
            <div className="ponto-card-topo topo-com-acoes">
              <div>
                <h2>Relatórios e documentos</h2>
                <p>Gere a folha de frequência mensal e a solicitação de crachá do acadêmico.</p>
              </div>
              <button className="btn-secundario compacto" onClick={() => setPaginaSupervisor('dashboard')}>
                Voltar
              </button>
            </div>
            <div className="form-grid-triplo campos-sem-label">
              <label>Acadêmico<select aria-label="Acadêmico" value={relatorioAcademicoId} onChange={(e) => setRelatorioAcademicoId(e.target.value)}><option value="">Acadêmico</option>{academicos.map((academico) => <option key={academico.id} value={academico.id}>{academico.nome}</option>)}</select></label>
              <label>Mês<select aria-label="Mês" value={relatorioMes} onChange={(e) => setRelatorioMes(Number(e.target.value))}>{meses2026.map((mes, indice) => <option key={mes} value={indice + 1}>{mes}</option>)}</select></label>
              <label>Ano<input type="number" value={relatorioAno} onChange={(e) => setRelatorioAno(Number(e.target.value))} placeholder="Ano" aria-label="Ano" /></label>
            </div>

            <div className="documentos-grid">
              <div>
                <h3>Ficha de presença</h3>
                <p>Modelo mensal com entrada, saída, assinatura do estagiário, observações do supervisor e carga horária total.</p>
                <button className="btn-principal compacto" onClick={gerarRelatorio}><GoDownload /> Exportar folha de frequência</button>
              </div>
              <div>
                <h3>Solicitação de crachá</h3>
                <p>Encaminhe por e-mail a solicitação de crachá do acadêmico selecionado.</p>
                <button className="btn-principal compacto" onClick={encaminharCrachaPorEmail}><FaEnvelope /> Encaminhar por e-mail</button>
              </div>
            </div>
          </section>
        )}
      </section>
    </main>
  )
}

export default App
