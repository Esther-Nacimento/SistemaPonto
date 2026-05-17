using System.Net.Mail;
using System.Text.RegularExpressions;
using PontoApi.Models;

namespace PontoApi.Services;

public static class Validacao
{
    public static string? Cadastro(CadastroUsuarioRequest dados)
    {
        if (string.IsNullOrWhiteSpace(dados.NomeCompleto))
            return "Nome completo e obrigatorio.";

        // Ambiente local: qualquer CPF com 11 numeros pode ser usado para testes.
        if (Texto.SomenteNumeros(dados.Cpf).Length != 11)
            return "Informe um CPF com 11 numeros.";

        if (!Email(dados.Email))
            return "Informe um e-mail valido.";

        if (string.IsNullOrWhiteSpace(dados.Orgao))
            return "Orgao e obrigatorio.";

        if (dados.Senha != dados.ConfirmarSenha)
            return "A confirmacao de senha nao confere.";

        if (!SenhaForte(dados.Senha))
            return "A senha deve ter letra maiuscula, letra minuscula, numero e caractere especial.";

        return null;
    }

    public static bool Email(string email)
    {
        try
        {
            _ = new MailAddress(email);
            return true;
        }
        catch
        {
            return false;
        }
    }

    private static bool SenhaForte(string senha) =>
        senha.Length >= 8
        && Regex.IsMatch(senha, "[A-Z]")
        && Regex.IsMatch(senha, "[a-z]")
        && Regex.IsMatch(senha, "[0-9]")
        && Regex.IsMatch(senha, "[^a-zA-Z0-9]");
}
