namespace PontoApi.Models;

public record LoginRequest(string Cpf, string Senha, string? TipoUsuario);

public record CadastroUsuarioRequest(
    string NomeCompleto,
    string Cpf,
    DateTime? DataNascimento,
    string Orgao,
    string Email,
    string Senha,
    string ConfirmarSenha);

public record AtualizarMeusDadosRequest(
    string Ensino,
    DateTime? DataNascimento,
    string Endereco,
    string Sexo,
    string Email,
    string? EstadoCivil,
    string? Profissao,
    string? Escolaridade,
    string? TipoEnsino,
    string? InstituicaoEnsino,
    string? Curso,
    string? PeriodoSemestre,
    string? TelefoneCelular,
    string? TelefoneResidencial,
    string? Cep,
    string? Logradouro,
    string? Numero,
    string? Complemento,
    string? Bairro,
    string? Cidade,
    string? Estado);

public record AtualizarAcademicoRequest(
    string? NomeCompleto,
    string? Email,
    DateTime? DataNascimento,
    string? Orgao,
    string? Ensino,
    string? Endereco,
    string? Sexo,
    string? DadosContratacao,
    string? SetorAlocacao,
    string? Horario,
    int CargaHorariaSemanal,
    string? SituacaoAcademico,
    string? EstadoCivil,
    string? Profissao,
    string? Escolaridade,
    string? TipoEnsino,
    string? InstituicaoEnsino,
    string? Curso,
    string? PeriodoSemestre,
    string? TelefoneCelular,
    string? TelefoneResidencial,
    string? Cep,
    string? Logradouro,
    string? Numero,
    string? Complemento,
    string? Bairro,
    string? Cidade,
    string? Estado,
    int? SupervisorId);

public record RegistrarAusenciaRequest(
    int AcademicoId,
    DateTime Data,
    string Tipo,
    string Observacao,
    int SupervisorId);

public record SalvarObservacaoRequest(string Observacao, int? SupervisorId);
