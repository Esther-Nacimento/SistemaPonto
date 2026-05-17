using Npgsql;
using PontoApi.Data;
using PontoApi.Models;
using PontoApi.Services;

namespace PontoApi.Endpoints;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this WebApplication app, string connectionString)
    {
        app.MapPost("/api/login", async (LoginRequest dados) =>
        {
            await using var con = await Banco.Abrir(connectionString);
            var cpf = Texto.SomenteNumeros(dados.Cpf);
            var tipo = Texto.NormalizarTipo(dados.TipoUsuario);

            await using var cmd = new NpgsqlCommand("""
                SELECT u.*, a.*
                FROM app_usuarios u
                LEFT JOIN app_academicos a ON a.usuario_id = u.id
                WHERE u.cpf = @cpf
                """, con);

            cmd.Parameters.AddWithValue("cpf", cpf);

            await using var reader = await cmd.ExecuteReaderAsync();
            if (!await reader.ReadAsync())
                return Results.Json(new { mensagem = "CPF ou senha incorretos." }, statusCode: 401);

            var senhaHash = reader.GetString(reader.GetOrdinal("senha_hash"));
            var tipoUsuario = reader.GetString(reader.GetOrdinal("tipo_usuario"));

            if (senhaHash != Texto.HashSenha(dados.Senha) || Texto.NormalizarTipo(tipoUsuario) != tipo)
                return Results.Json(new { mensagem = "CPF ou senha incorretos." }, statusCode: 401);

            return Results.Ok(Resposta.Usuario(reader));
        });
    }
}
