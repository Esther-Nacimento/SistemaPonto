using Npgsql;
using NpgsqlTypes;
using PontoApi.Data;
using PontoApi.Models;
using PontoApi.Services;

namespace PontoApi.Endpoints;

public static class SupervisorEndpoints
{
    public static void MapSupervisorEndpoints(this WebApplication app, string connectionString)
    {
        app.MapGet("/api/supervisor/academicos", async (int supervisorId, string? busca) =>
        {
            var supervisor = await Banco.BuscarUsuarioInterno(connectionString, supervisorId);
            if (supervisor == null || supervisor.TipoUsuario != "SUPERVISOR")
                return Results.BadRequest(new { mensagem = "Supervisor invalido." });

            await using var con = await Banco.Abrir(connectionString);
            await using var cmd = new NpgsqlCommand("""
                WITH supervisor_base AS (
                    SELECT
                        @orgaoId::integer AS orgao_id,
                        LOWER(TRIM(TRANSLATE(
                            @orgao,
                            'ÁÀÂÃÄáàâãäÉÈÊËéèêëÍÌÎÏíìîïÓÒÔÕÖóòôõöÚÙÛÜúùûüÇç',
                            'AAAAAaaaaaEEEEeeeeIIIIiiiiOOOOOoooooUUUUuuuuCc'
                        ))) AS orgao_normalizado
                )
                SELECT u.*, a.*,
                       p.id AS ponto_id, p.data AS ponto_data, p.entrada AS ponto_entrada,
                       p.saida AS ponto_saida, p.horas_cumpridas AS ponto_horas_cumpridas,
                       p.status AS ponto_status
                FROM app_usuarios u
                JOIN app_academicos a ON a.usuario_id = u.id
                CROSS JOIN supervisor_base s
                LEFT JOIN app_pontos p ON p.academico_id = u.id AND p.data = CURRENT_DATE
                WHERE u.tipo_usuario = 'ACADEMICO'
                  AND (
                    (s.orgao_id IS NOT NULL AND (u.orgao_id = s.orgao_id OR a.orgao_id = s.orgao_id))
                    OR LOWER(TRIM(TRANSLATE(
                        u.orgao,
                        'ÁÀÂÃÄáàâãäÉÈÊËéèêëÍÌÎÏíìîïÓÒÔÕÖóòôõöÚÙÛÜúùûüÇç',
                        'AAAAAaaaaaEEEEeeeeIIIIiiiiOOOOOoooooUUUUuuuuCc'
                    ))) = s.orgao_normalizado
                  )
                  AND (@busca = '' OR LOWER(u.nome_completo) LIKE @buscaLike)
                ORDER BY u.nome_completo
                """, con);

            var textoBusca = busca?.Trim().ToLowerInvariant() ?? string.Empty;
            cmd.Parameters.AddWithValue("orgao", supervisor.Orgao);
            cmd.Parameters.Add("orgaoId", NpgsqlDbType.Integer).Value = (object?)supervisor.OrgaoId ?? DBNull.Value;
            cmd.Parameters.AddWithValue("busca", textoBusca);
            cmd.Parameters.AddWithValue("buscaLike", $"%{textoBusca}%");

            var lista = new List<object>();
            await using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
                lista.Add(Resposta.AcademicoSupervisor(reader));

            return Results.Ok(lista);
        });

        app.MapGet("/api/supervisor/academicos/{id:int}", async (int id) =>
        {
            var usuario = await Banco.BuscarUsuarioResposta(connectionString, id, comPontoHoje: true);
            return usuario == null
                ? Results.NotFound(new { mensagem = "Academico nao encontrado." })
                : Results.Ok(usuario);
        });

        app.MapPut("/api/supervisor/academicos/{id:int}", async (int id, AtualizarAcademicoRequest dados) =>
        {
            await using var con = await Banco.Abrir(connectionString);
            await using var cmd = new NpgsqlCommand("""
                WITH orgao_upsert AS (
                    INSERT INTO app_orgaos (nome)
                    SELECT NULLIF(@orgao, '')
                    WHERE NULLIF(@orgao, '') IS NOT NULL
                    ON CONFLICT (nome) DO UPDATE SET nome = EXCLUDED.nome
                    RETURNING id
                ),
                usuario_atualizado AS (
                    UPDATE app_usuarios
                    SET nome_completo = COALESCE(NULLIF(@nome, ''), nome_completo),
                        email = COALESCE(NULLIF(@email, ''), email),
                        orgao = COALESCE(NULLIF(@orgao, ''), orgao),
                        orgao_id = COALESCE((SELECT id FROM orgao_upsert), orgao_id),
                        data_nascimento = COALESCE(@dataNascimento, data_nascimento),
                        atualizado_em = now()
                    WHERE id = @id AND tipo_usuario = 'ACADEMICO'
                    RETURNING id, orgao_id
                )
                INSERT INTO app_academicos (
                    usuario_id, ensino, endereco, sexo, estado_civil, profissao, escolaridade,
                    tipo_ensino, instituicao_ensino, curso, periodo_semestre, telefone_celular,
                    telefone_residencial, cep, logradouro, numero, complemento, bairro, cidade,
                    estado, dados_contratacao, setor_alocacao, orgao_id, horario, horario_inicio,
                    horario_fim, carga_horaria_semanal, situacao_academico, supervisor_id
                )
                SELECT
                    @id, @ensino, @endereco, @sexo, @estadoCivil, @profissao, @escolaridade,
                    @tipoEnsino, @instituicaoEnsino, @curso, @periodoSemestre, @telefoneCelular,
                    @telefoneResidencial, @cep, @logradouro, @numero, @complemento, @bairro,
                    @cidade, @estado, @dadosContratacao, @setorAlocacao,
                    COALESCE((SELECT id FROM orgao_upsert), usuario_atualizado.orgao_id),
                    @horario, @horarioInicio, @horarioFim, @cargaHorariaSemanal, @situacaoAcademico, @supervisorId
                FROM usuario_atualizado
                ON CONFLICT (usuario_id) DO UPDATE
                SET ensino = EXCLUDED.ensino,
                    endereco = EXCLUDED.endereco,
                    sexo = EXCLUDED.sexo,
                    estado_civil = EXCLUDED.estado_civil,
                    profissao = EXCLUDED.profissao,
                    escolaridade = EXCLUDED.escolaridade,
                    tipo_ensino = EXCLUDED.tipo_ensino,
                    instituicao_ensino = EXCLUDED.instituicao_ensino,
                    curso = EXCLUDED.curso,
                    periodo_semestre = EXCLUDED.periodo_semestre,
                    telefone_celular = EXCLUDED.telefone_celular,
                    telefone_residencial = EXCLUDED.telefone_residencial,
                    cep = EXCLUDED.cep,
                    logradouro = EXCLUDED.logradouro,
                    numero = EXCLUDED.numero,
                    complemento = EXCLUDED.complemento,
                    bairro = EXCLUDED.bairro,
                    cidade = EXCLUDED.cidade,
                    estado = EXCLUDED.estado,
                    dados_contratacao = EXCLUDED.dados_contratacao,
                    setor_alocacao = EXCLUDED.setor_alocacao,
                    orgao_id = EXCLUDED.orgao_id,
                    horario = EXCLUDED.horario,
                    horario_inicio = EXCLUDED.horario_inicio,
                    horario_fim = EXCLUDED.horario_fim,
                    carga_horaria_semanal = EXCLUDED.carga_horaria_semanal,
                    situacao_academico = EXCLUDED.situacao_academico,
                    supervisor_id = EXCLUDED.supervisor_id;
                """, con);

            cmd.Parameters.AddWithValue("id", id);
            cmd.Parameters.AddWithValue("nome", dados.NomeCompleto?.Trim() ?? string.Empty);
            cmd.Parameters.AddWithValue("email", dados.Email?.Trim() ?? string.Empty);
            cmd.Parameters.AddWithValue("orgao", dados.Orgao?.Trim() ?? string.Empty);
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
            cmd.Parameters.AddWithValue("dadosContratacao", dados.DadosContratacao?.Trim() ?? string.Empty);
            cmd.Parameters.AddWithValue("setorAlocacao", dados.SetorAlocacao?.Trim() ?? string.Empty);
            cmd.Parameters.AddWithValue("horario", dados.Horario?.Trim() ?? string.Empty);
            var (horarioInicio, horarioFim) = ExtrairHorario(dados.Horario);
            cmd.Parameters.Add("horarioInicio", NpgsqlDbType.Time).Value = (object?)horarioInicio ?? DBNull.Value;
            cmd.Parameters.Add("horarioFim", NpgsqlDbType.Time).Value = (object?)horarioFim ?? DBNull.Value;
            cmd.Parameters.AddWithValue("cargaHorariaSemanal", dados.CargaHorariaSemanal > 0 ? dados.CargaHorariaSemanal : 30);
            cmd.Parameters.AddWithValue("situacaoAcademico", dados.SituacaoAcademico?.Trim() ?? "Acadêmico ativo");
            cmd.Parameters.AddWithValue("supervisorId", (object?)dados.SupervisorId ?? DBNull.Value);
            try
            {
                await cmd.ExecuteNonQueryAsync();
            }
            catch (PostgresException ex) when (ex.SqlState == PostgresErrorCodes.UniqueViolation)
            {
                return Results.Conflict(new { mensagem = "E-mail ja cadastrado para outro usuario." });
            }

            return Results.Ok(await Banco.BuscarUsuarioResposta(connectionString, id, comPontoHoje: true));
        });

        app.MapPost("/api/supervisor/ausencias", async (RegistrarAusenciaRequest dados) =>
        {
            await using var con = await Banco.Abrir(connectionString);
            var data = dados.Data.Date;
            var status = dados.Tipo switch
            {
                "AUSENTE" => "AUSENTE",
                "JUSTIFICADA" => "PRESENCA_REGULARIZADA",
                "REGULARIZADA" => "PRESENCA_REGULARIZADA",
                _ => "FALTA_NAO_JUSTIFICADA"
            };

            await using var cmd = new NpgsqlCommand("""
                INSERT INTO app_pontos (academico_id, data, status, horas_cumpridas)
                VALUES (@academicoId, @data, @status, 0)
                ON CONFLICT (academico_id, data) DO UPDATE
                SET status = EXCLUDED.status,
                    entrada = app_pontos.entrada,
                    saida = app_pontos.saida,
                    horas_cumpridas = app_pontos.horas_cumpridas,
                    atualizado_em = now();

                INSERT INTO app_ausencias (academico_id, data, tipo, observacao, supervisor_id)
                VALUES (@academicoId, @data, @tipo, @observacao, @supervisorId);
                """, con);

            cmd.Parameters.AddWithValue("academicoId", dados.AcademicoId);
            cmd.Parameters.AddWithValue("data", data);
            cmd.Parameters.AddWithValue("status", status);
            cmd.Parameters.AddWithValue("tipo", dados.Tipo);
            cmd.Parameters.AddWithValue("observacao", dados.Observacao?.Trim() ?? string.Empty);
            cmd.Parameters.AddWithValue("supervisorId", dados.SupervisorId);
            await cmd.ExecuteNonQueryAsync();

            await Banco.SincronizarHistorico(con, dados.AcademicoId, data);
            if (!string.IsNullOrWhiteSpace(dados.Observacao))
                await Banco.SalvarObservacao(con, dados.AcademicoId, data, dados.Observacao, dados.SupervisorId);

            return Results.Ok(new { mensagem = "Ponto atualizado com sucesso." });
        });

        app.MapPut("/api/supervisor/historico/{academicoId:int}/{ano:int}/{mes:int}/{dia:int}/observacao", async (
            int academicoId,
            int ano,
            int mes,
            int dia,
            SalvarObservacaoRequest dados) =>
        {
            var data = new DateTime(ano, mes, dia);
            await using var con = await Banco.Abrir(connectionString);
            await Banco.SalvarObservacao(con, academicoId, data, dados.Observacao ?? string.Empty, dados.SupervisorId);

            var historico = await Banco.HistoricoMensal(connectionString, academicoId, ano, mes);
            return Results.Ok(historico.First(item => (int)item.GetType().GetProperty("dia")!.GetValue(item)! == dia));
        });
    }

    private static (TimeSpan? Inicio, TimeSpan? Fim) ExtrairHorario(string? horario)
    {
        if (string.IsNullOrWhiteSpace(horario))
            return (null, null);

        var partes = horario
            .Replace("às", "as", StringComparison.OrdinalIgnoreCase)
            .Split("as", StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries);

        if (partes.Length < 2)
            return (null, null);

        var inicioOk = TimeSpan.TryParse(partes[0], out var inicio);
        var fimOk = TimeSpan.TryParse(partes[1], out var fim);
        return (inicioOk ? inicio : null, fimOk ? fim : null);
    }
}
