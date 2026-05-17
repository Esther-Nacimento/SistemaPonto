using Npgsql;

namespace PontoApi.Services;

public static class Resposta
{
    public static object Usuario(NpgsqlDataReader reader)
    {
        var tipo = reader.GetString(reader.GetOrdinal("tipo_usuario"));

        return new
        {
            id = reader.GetInt32(reader.GetOrdinal("id")),
            nome = reader.GetString(reader.GetOrdinal("nome_completo")),
            nomeCompleto = reader.GetString(reader.GetOrdinal("nome_completo")),
            cpf = reader.GetString(reader.GetOrdinal("cpf")),
            tipoUsuario = tipo,
            dataNascimento = Valor.Data(reader, "data_nascimento"),
            email = reader.GetString(reader.GetOrdinal("email")),
            orgao = reader.GetString(reader.GetOrdinal("orgao")),
            orgaoId = Valor.InteiroNulo(reader, "orgao_id"),
            academico = tipo == "ACADEMICO" ? PerfilAcademico(reader) : null
        };
    }

    public static object AcademicoSupervisor(NpgsqlDataReader reader)
    {
        return new
        {
            id = reader.GetInt32(reader.GetOrdinal("id")),
            nome = reader.GetString(reader.GetOrdinal("nome_completo")),
            nomeCompleto = reader.GetString(reader.GetOrdinal("nome_completo")),
            cpf = reader.GetString(reader.GetOrdinal("cpf")),
            tipoUsuario = reader.GetString(reader.GetOrdinal("tipo_usuario")),
            dataNascimento = Valor.Data(reader, "data_nascimento"),
            email = reader.GetString(reader.GetOrdinal("email")),
            orgao = reader.GetString(reader.GetOrdinal("orgao")),
            orgaoId = Valor.InteiroNulo(reader, "orgao_id"),
            academico = PerfilAcademico(reader),
            registroHoje = Valor.Nulo(reader, "ponto_id") ? null : Ponto(reader, "ponto_")
        };
    }

    public static object? PerfilAcademico(NpgsqlDataReader reader)
    {
        if (!Valor.TemColuna(reader, "ensino") || Valor.Nulo(reader, "ensino"))
            return null;

        return new
        {
            ensino = Valor.Texto(reader, "ensino"),
            endereco = Valor.Texto(reader, "endereco"),
            sexo = Valor.Texto(reader, "sexo"),
            estadoCivil = Valor.Texto(reader, "estado_civil"),
            profissao = Valor.Texto(reader, "profissao"),
            escolaridade = Valor.Texto(reader, "escolaridade"),
            tipoEnsino = Valor.Texto(reader, "tipo_ensino"),
            instituicaoEnsino = Valor.Texto(reader, "instituicao_ensino"),
            curso = Valor.Texto(reader, "curso"),
            periodoSemestre = Valor.Texto(reader, "periodo_semestre"),
            telefoneCelular = Valor.Texto(reader, "telefone_celular"),
            telefoneResidencial = Valor.Texto(reader, "telefone_residencial"),
            cep = Valor.Texto(reader, "cep"),
            logradouro = Valor.Texto(reader, "logradouro"),
            numero = Valor.Texto(reader, "numero"),
            complemento = Valor.Texto(reader, "complemento"),
            bairro = Valor.Texto(reader, "bairro"),
            cidade = Valor.Texto(reader, "cidade"),
            estado = Valor.Texto(reader, "estado"),
            dadosContratacao = Valor.Texto(reader, "dados_contratacao"),
            setorAlocacao = Valor.Texto(reader, "setor_alocacao"),
            orgaoId = Valor.InteiroNulo(reader, "orgao_id"),
            horario = Valor.Texto(reader, "horario"),
            horarioInicio = Valor.Hora(reader, "horario_inicio"),
            horarioFim = Valor.Hora(reader, "horario_fim"),
            cargaHorariaSemanal = Valor.Inteiro(reader, "carga_horaria_semanal"),
            situacaoAcademico = Valor.Texto(reader, "situacao_academico", "Acadêmico ativo"),
            supervisorId = Valor.InteiroNulo(reader, "supervisor_id")
        };
    }

    public static object Ponto(NpgsqlDataReader reader, string prefixo = "")
    {
        var status = Valor.Texto(reader, $"{prefixo}status");
        var entrada = Valor.Data(reader, $"{prefixo}entrada");
        var saida = Valor.Data(reader, $"{prefixo}saida");

        return new
        {
            id = Valor.Inteiro(reader, $"{prefixo}id"),
            data = Valor.Data(reader, $"{prefixo}data"),
            entrada,
            saida,
            horaEntrada = entrada,
            horaSaida = saida,
            horasCumpridas = Valor.Double(reader, $"{prefixo}horas_cumpridas"),
            status,
            presente = status is "PRESENTE" or "PRESENCA_REGULARIZADA",
            ausente = status is "AUSENTE" or "FALTA_JUSTIFICADA" or "FALTA_NAO_JUSTIFICADA"
        };
    }

    public static object Historico(NpgsqlDataReader reader)
    {
        var entrada = Valor.Data(reader, "ponto_entrada") ?? Valor.Data(reader, "entrada");
        var saida = Valor.Data(reader, "ponto_saida") ?? Valor.Data(reader, "saida");
        var ano = Valor.Inteiro(reader, "ano");
        var mes = Valor.Inteiro(reader, "mes");
        var dia = Valor.Inteiro(reader, "dia");

        return new
        {
            id = Valor.Inteiro(reader, "id"),
            academicoId = Valor.Inteiro(reader, "academico_id"),
            ano,
            mes,
            dia,
            data = new DateTime(ano, mes, dia),
            entrada,
            saida,
            horaEntrada = entrada,
            horaSaida = saida,
            horasCumpridas = Valor.Double(reader, "horas_cumpridas"),
            status = Valor.Texto(reader, "ponto_status", "AUSENTE"),
            observacaoSupervisor = Valor.Texto(reader, "observacao_supervisor"),
            tipoDia = Valor.Texto(reader, "tipo_dia"),
            descricaoFeriado = Valor.Texto(reader, "descricao_feriado")
        };
    }
}
