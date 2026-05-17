using Npgsql;
using PontoApi.Data;
using PontoApi.Services;

namespace PontoApi.Endpoints;

public static class PontoEndpoints
{
    public static void MapPontoEndpoints(this WebApplication app, string connectionString)
    {
        app.MapGet("/api/ponto/hoje/{academicoId:int}", async (int academicoId) =>
        {
            var ponto = await Banco.BuscarPonto(connectionString, academicoId, DateTime.Today);
            return ponto == null
                ? Results.NotFound(new { mensagem = "Nenhum ponto registrado hoje." })
                : Results.Ok(ponto);
        });

        app.MapGet("/api/ponto/historico/{academicoId:int}", async (int academicoId) =>
        {
            await using var con = await Banco.Abrir(connectionString);
            await using var cmd = new NpgsqlCommand("""
                SELECT id, data, entrada, saida, horas_cumpridas, status
                FROM app_pontos
                WHERE academico_id = @academicoId
                ORDER BY data DESC
                """, con);

            cmd.Parameters.AddWithValue("academicoId", academicoId);

            var pontos = new List<object>();
            await using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
                pontos.Add(Resposta.Ponto(reader));

            return Results.Ok(pontos);
        });

        app.MapGet("/api/ponto/historico-mensal/{academicoId:int}/{ano:int}/{mes:int}", async (int academicoId, int ano, int mes) =>
        {
            if (mes < 1 || mes > 12)
                return Results.BadRequest(new { mensagem = "Mes invalido." });

            var dias = await Banco.HistoricoMensal(connectionString, academicoId, ano, mes);
            return Results.Ok(dias);
        });

        app.MapPost("/api/ponto/presente/{academicoId:int}", async (int academicoId) =>
        {
            var data = DateTime.Today;
            await using var con = await Banco.Abrir(connectionString);
            var ponto = await Banco.BuscarPontoRegistro(con, academicoId, data);

            if (ponto == null)
            {
                await using var inserir = new NpgsqlCommand("""
                    INSERT INTO app_pontos (academico_id, data, entrada, status)
                    VALUES (@academicoId, @data, now(), 'PRESENTE')
                    """, con);

                inserir.Parameters.AddWithValue("academicoId", academicoId);
                inserir.Parameters.AddWithValue("data", data);
                await inserir.ExecuteNonQueryAsync();
            }
            else if (ponto.Entrada == null)
            {
                await using var atualizar = new NpgsqlCommand("""
                    UPDATE app_pontos
                    SET entrada = now(), status = 'PRESENTE', atualizado_em = now()
                    WHERE id = @id
                    """, con);

                atualizar.Parameters.AddWithValue("id", ponto.Id);
                await atualizar.ExecuteNonQueryAsync();
            }

            await Banco.SincronizarHistorico(con, academicoId, data);
            return Results.Ok(await Banco.BuscarPonto(connectionString, academicoId, data));
        });

        app.MapPost("/api/ponto/saida/{academicoId:int}", async (int academicoId) =>
        {
            var data = DateTime.Today;
            await using var con = await Banco.Abrir(connectionString);
            var ponto = await Banco.BuscarPontoRegistro(con, academicoId, data);

            if (ponto == null || ponto.Entrada == null)
                return Results.BadRequest(new { mensagem = "Registre a entrada antes da saida." });

            var saida = DateTime.Now;
            var horas = Math.Max(0, Math.Round((saida - ponto.Entrada.Value).TotalHours, 2));

            await using var cmd = new NpgsqlCommand("""
                UPDATE app_pontos
                SET saida = @saida, horas_cumpridas = @horas, status = 'PRESENTE', atualizado_em = now()
                WHERE id = @id
                """, con);

            cmd.Parameters.AddWithValue("id", ponto.Id);
            cmd.Parameters.AddWithValue("saida", saida);
            cmd.Parameters.AddWithValue("horas", horas);
            await cmd.ExecuteNonQueryAsync();

            await Banco.SincronizarHistorico(con, academicoId, data);
            return Results.Ok(await Banco.BuscarPonto(connectionString, academicoId, data));
        });
    }
}
