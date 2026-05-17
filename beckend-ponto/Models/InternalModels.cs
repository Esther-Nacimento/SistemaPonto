namespace PontoApi.Models;

public record UsuarioInterno(
    int Id,
    string NomeCompleto,
    string Cpf,
    string Email,
    string TipoUsuario,
    string Orgao,
    int? OrgaoId);

public record PontoInterno(
    int Id,
    DateTime Data,
    DateTime? Entrada,
    DateTime? Saida,
    double HorasCumpridas,
    string Status);
