using PontoApi.Data;
using PontoApi.Endpoints;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("Livre", policy =>
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

app.UseCors("Livre");

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string DefaultConnection nao encontrada.");

await Banco.CriarEstrutura(connectionString);
await Banco.SincronizarVinculosInstitucionais(connectionString);

app.MapAuthEndpoints(connectionString);
app.MapUsuarioEndpoints(connectionString);
app.MapPontoEndpoints(connectionString);
app.MapSupervisorEndpoints(connectionString);

app.MapGet("/", () => Results.Ok(new
{
    sistema = "Sistema de Ponto Academico",
    api = "nova-api-postgresql",
    status = "online"
}));

app.Run();
