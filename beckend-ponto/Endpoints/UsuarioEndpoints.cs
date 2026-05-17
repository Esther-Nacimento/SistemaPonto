using Npgsql;
using PontoApi.Data;
using PontoApi.Models;
using PontoApi.Services;

namespace PontoApi.Endpoints;

public static class UsuarioEndpoints
{
    public static void MapUsuarioEndpoints(this WebApplication app, string connectionString)
    {
        app.MapPost("/api/usuarios/cadastro-academico", async (CadastroUsuarioRequest dados) =>
        {
            var erro = Validacao.Cadastro(dados);
            if (erro != null) return Results.BadRequest(new { mensagem = erro });

            await using var con = await Banco.Abrir(connectionString);
            await using var tx = await con.BeginTransactionAsync();

            try
            {
                var cpf = Texto.SomenteNumeros(dados.Cpf);
                var usuarioId = await Banco.InserirUsuario(con, tx, dados, cpf, "ACADEMICO");

                await using var cmd = new NpgsqlCommand("""
                    INSERT INTO app_academicos (
                        usuario_id, ensino, endereco, sexo, dados_contratacao, setor_alocacao,
                        orgao_id, horario, carga_horaria_semanal, supervisor_id
                    )
                    VALUES (
                        @usuarioId, '', '', '', 'Academico bolsista',
                        'Prefeitura Municipal do Rio de Janeiro - Centro Administrativo Municipal Sao Sebastiao - Subsecretaria de Gestao - 6 andar',
                        (SELECT orgao_id FROM app_usuarios WHERE id = @usuarioId), 'A definir pelo supervisor', 30, NULL
                    )
                    ON CONFLICT (usuario_id) DO NOTHING
                    """, con, tx);

                cmd.Parameters.AddWithValue("usuarioId", usuarioId);
                await cmd.ExecuteNonQueryAsync();
                await tx.CommitAsync();

                return Results.Created($"/api/usuarios/{usuarioId}", await Banco.BuscarUsuarioResposta(connectionString, usuarioId));
            }
            catch (InvalidOperationException ex)
            {
                await tx.RollbackAsync();
                return Results.Conflict(new { mensagem = ex.Message });
            }
            catch (PostgresException ex) when (ex.SqlState == PostgresErrorCodes.UniqueViolation)
            {
                await tx.RollbackAsync();
                return Results.Conflict(new { mensagem = "CPF ou e-mail ja cadastrado." });
            }
        });

        app.MapPost("/api/usuarios/cadastro-supervisor", async (CadastroUsuarioRequest dados) =>
        {
            var erro = Validacao.Cadastro(dados);
            if (erro != null) return Results.BadRequest(new { mensagem = erro });

            await using var con = await Banco.Abrir(connectionString);
            await using var tx = await con.BeginTransactionAsync();

            try
            {
                var cpf = Texto.SomenteNumeros(dados.Cpf);
                var usuarioId = await Banco.InserirUsuario(con, tx, dados, cpf, "SUPERVISOR");
                await using var cmd = new NpgsqlCommand("""
                    INSERT INTO app_supervisores (usuario_id, orgao_id)
                    SELECT id, orgao_id
                    FROM app_usuarios
                    WHERE id = @usuarioId
                    ON CONFLICT (usuario_id) DO UPDATE SET orgao_id = EXCLUDED.orgao_id
                    """, con, tx);

                cmd.Parameters.AddWithValue("usuarioId", usuarioId);
                await cmd.ExecuteNonQueryAsync();
                await tx.CommitAsync();

                return Results.Created($"/api/usuarios/{usuarioId}", await Banco.BuscarUsuarioResposta(connectionString, usuarioId));
            }
            catch (InvalidOperationException ex)
            {
                await tx.RollbackAsync();
                return Results.Conflict(new { mensagem = ex.Message });
            }
            catch (PostgresException ex) when (ex.SqlState == PostgresErrorCodes.UniqueViolation)
            {
                await tx.RollbackAsync();
                return Results.Conflict(new { mensagem = "CPF ou e-mail ja cadastrado." });
            }
        });

        app.MapGet("/api/usuarios/{id:int}", async (int id) =>
        {
            var usuario = await Banco.BuscarUsuarioResposta(connectionString, id);
            return usuario == null
                ? Results.NotFound(new { mensagem = "Usuario nao encontrado." })
                : Results.Ok(usuario);
        });

        app.MapPut("/api/usuarios/{id:int}/meus-dados", async (int id, AtualizarMeusDadosRequest dados) =>
        {
            if (!Validacao.Email(dados.Email))
                return Results.BadRequest(new { mensagem = "Informe um e-mail valido." });

            await using var con = await Banco.Abrir(connectionString);
            await using var cmd = new NpgsqlCommand("""
                UPDATE app_usuarios
                SET email = @email,
                    data_nascimento = COALESCE(@dataNascimento, data_nascimento),
                    atualizado_em = now()
                WHERE id = @id AND tipo_usuario = 'ACADEMICO';

                UPDATE app_academicos
                SET ensino = @ensino,
                    endereco = @endereco,
                    sexo = @sexo,
                    estado_civil = @estadoCivil,
                    profissao = @profissao,
                    escolaridade = @escolaridade,
                    tipo_ensino = @tipoEnsino,
                    instituicao_ensino = @instituicaoEnsino,
                    curso = @curso,
                    periodo_semestre = @periodoSemestre,
                    telefone_celular = @telefoneCelular,
                    telefone_residencial = @telefoneResidencial,
                    cep = @cep,
                    logradouro = @logradouro,
                    numero = @numero,
                    complemento = @complemento,
                    bairro = @bairro,
                    cidade = @cidade,
                    estado = @estado
                WHERE usuario_id = @id;
                """, con);

            cmd.Parameters.AddWithValue("id", id);
            cmd.Parameters.AddWithValue("email", dados.Email.Trim());
            cmd.Parameters.AddWithValue("dataNascimento", (object?)dados.DataNascimento ?? DBNull.Value);
            cmd.Parameters.AddWithValue("ensino", dados.Ensino?.Trim() ?? string.Empty);
            cmd.Parameters.AddWithValue("endereco", dados.Endereco?.Trim() ?? string.Empty);
            cmd.Parameters.AddWithValue("sexo", dados.Sexo?.Trim() ?? string.Empty);
            cmd.Parameters.AddWithValue("estadoCivil", dados.EstadoCivil?.Trim() ?? string.Empty);
            cmd.Parameters.AddWithValue("profissao", dados.Profissao?.Trim() ?? string.Empty);
            cmd.Parameters.AddWithValue("escolaridade", dados.Escolaridade?.Trim() ?? string.Empty);
            cmd.Parameters.AddWithValue("tipoEnsino", dados.TipoEnsino?.Trim() ?? string.Empty);
            cmd.Parameters.AddWithValue("instituicaoEnsino", dados.InstituicaoEnsino?.Trim() ?? string.Empty);
            cmd.Parameters.AddWithValue("curso", dados.Curso?.Trim() ?? string.Empty);
            cmd.Parameters.AddWithValue("periodoSemestre", dados.PeriodoSemestre?.Trim() ?? string.Empty);
            cmd.Parameters.AddWithValue("telefoneCelular", dados.TelefoneCelular?.Trim() ?? string.Empty);
            cmd.Parameters.AddWithValue("telefoneResidencial", dados.TelefoneResidencial?.Trim() ?? string.Empty);
            cmd.Parameters.AddWithValue("cep", dados.Cep?.Trim() ?? string.Empty);
            cmd.Parameters.AddWithValue("logradouro", dados.Logradouro?.Trim() ?? string.Empty);
            cmd.Parameters.AddWithValue("numero", dados.Numero?.Trim() ?? string.Empty);
            cmd.Parameters.AddWithValue("complemento", dados.Complemento?.Trim() ?? string.Empty);
            cmd.Parameters.AddWithValue("bairro", dados.Bairro?.Trim() ?? string.Empty);
            cmd.Parameters.AddWithValue("cidade", dados.Cidade?.Trim() ?? string.Empty);
            cmd.Parameters.AddWithValue("estado", dados.Estado?.Trim() ?? string.Empty);
            try
            {
                await cmd.ExecuteNonQueryAsync();
            }
            catch (PostgresException ex) when (ex.SqlState == PostgresErrorCodes.UniqueViolation)
            {
                return Results.Conflict(new { mensagem = "E-mail ja cadastrado para outro usuario." });
            }

            return Results.Ok(await Banco.BuscarUsuarioResposta(connectionString, id));
        });
    }
}
