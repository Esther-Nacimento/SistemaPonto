using Npgsql;

namespace PontoApi.Services;

public static class Valor
{
    public static bool TemColuna(NpgsqlDataReader reader, string nome)
    {
        for (var i = 0; i < reader.FieldCount; i++)
        {
            if (reader.GetName(i).Equals(nome, StringComparison.OrdinalIgnoreCase))
                return true;
        }

        return false;
    }

    public static bool Nulo(NpgsqlDataReader reader, string nome) =>
        !TemColuna(reader, nome) || reader.IsDBNull(reader.GetOrdinal(nome));

    public static string Texto(NpgsqlDataReader reader, string nome, string padrao = "") =>
        Nulo(reader, nome) ? padrao : reader.GetString(reader.GetOrdinal(nome));

    public static int Inteiro(NpgsqlDataReader reader, string nome) =>
        Nulo(reader, nome) ? 0 : reader.GetInt32(reader.GetOrdinal(nome));

    public static int? InteiroNulo(NpgsqlDataReader reader, string nome) =>
        Nulo(reader, nome) ? null : reader.GetInt32(reader.GetOrdinal(nome));

    public static double Double(NpgsqlDataReader reader, string nome) =>
        Nulo(reader, nome) ? 0 : reader.GetDouble(reader.GetOrdinal(nome));

    public static DateTime? Data(NpgsqlDataReader reader, string nome) =>
        Nulo(reader, nome) ? null : reader.GetDateTime(reader.GetOrdinal(nome));

    public static string Hora(NpgsqlDataReader reader, string nome) =>
        Nulo(reader, nome) ? string.Empty : reader.GetFieldValue<TimeSpan>(reader.GetOrdinal(nome)).ToString(@"hh\:mm");
}
