using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;

namespace PontoApi.Services;

public static class Texto
{
    public static string SomenteNumeros(string? valor) =>
        Regex.Replace(valor ?? string.Empty, "[^0-9]", "");

    public static string NormalizarTipo(string? tipo) =>
        (tipo ?? string.Empty).Trim().ToUpperInvariant() == "SUPERVISOR" ? "SUPERVISOR" : "ACADEMICO";

    public static string HashSenha(string senha)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(senha));
        return Convert.ToHexString(bytes);
    }
}
