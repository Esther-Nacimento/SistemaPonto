# Sistema de Ponto Acadêmico

Sistema fullstack para controle de ponto de acadêmicos bolsistas da Secretaria Municipal de Saúde do Rio de Janeiro.

O sistema possui dois portais:

- Portal Acadêmico: cadastro, dados pessoais, ponto eletrônico e histórico mensal.
- Portal do Supervisor: acompanhamento dos acadêmicos do mesmo órgão, edição de dados institucionais, ajuste de ponto, observações no histórico e relatórios.

## Tecnologias

- Front-end: React, Vite, TypeScript e CSS.
- Back-end: ASP.NET Core Web API.
- Banco de dados: PostgreSQL.
- Acesso ao banco: Npgsql.

## Banco de dados

O sistema usa o banco `sistema_ponto_db` no PostgreSQL.

Tabelas principais:

- `app_usuarios`: dados de login, CPF, e-mail, tipo de usuário e órgão.
- `app_academicos`: dados acadêmicos, contato, endereço, horário, carga horária e vínculo com supervisor.
- `app_supervisores`: vínculo do supervisor com o órgão.
- `app_pontos`: entrada, saída, status e horas cumpridas.
- `app_historicos`: histórico mensal, feriados e observações do supervisor.
- `app_ausencias`: registros de falta, falta justificada e presença regularizada.
- `app_orgaos`: órgãos/setores usados para vincular acadêmicos e supervisores.

Regras importantes:

- CPF é único.
- E-mail é único.
- Acadêmico e supervisor são vinculados pelo órgão.
- Supervisor visualiza acadêmicos do mesmo órgão.
- Acadêmico registra entrada e saída.
- Supervisor pode marcar falta, falta justificada ou presença regularizada.
- Falta justificada e presença regularizada aparecem como `Presente` no status do ponto.
- Falta sem justificativa aparece como `Falta`.
- Observações do supervisor ficam no histórico mensal.

## Configurar PostgreSQL

No pgAdmin 4:

1. Abra o pgAdmin.
2. Entre no servidor PostgreSQL com a senha do usuário `postgres`.
3. Clique com o botão direito em `Databases`.
4. Escolha `Create` e depois `Database`.
5. Crie o banco com o nome `sistema_ponto_db`.
6. Abra o `Query Tool`.
7. Execute o arquivo:

```text
database/postgresql-sistema-ponto.sql
```

## Configurar conexão

Confira a senha do PostgreSQL em:

```text
beckend-ponto/appsettings.json
beckend-ponto/appsettings.Development.json
```

Exemplo:

```json
"DefaultConnection": "Host=localhost;Port=5432;Database=sistema_ponto_db;Username=postgres;Password=0000"
```

Se sua senha não for `0000`, troque somente o valor de `Password`.

## Rodar o back-end

Na pasta principal do projeto:

```powershell
dotnet restore .\beckend-ponto\PontoApi.csproj
dotnet run --project .\beckend-ponto\PontoApi.csproj
```

A API abre normalmente em:

```text
http://localhost:5244
```

## Rodar o front-end

Em outro terminal:

```powershell
cd .\frontend-ponto
npm install
npm run dev
```

O front-end abre normalmente em:

```text
http://localhost:5173
```

## Fluxos principais para testar

1. Cadastre ou entre como supervisor.
2. Cadastre ou entre como acadêmico do mesmo órgão.
3. No Portal Acadêmico, marque presença.
4. Confira se a entrada aparece no Ponto Digital.
5. Registre saída e confira as horas cumpridas.
6. No Portal do Supervisor, abra o acadêmico em `Visualizar/Editar`.
7. Ajuste horário, carga horária e dados institucionais.
8. Em `Ponto Digital`, marque falta, falta justificada ou presença regularizada.
9. Em `Histórico mensal`, registre observações do supervisor.
10. Em `Relatórios`, exporte a folha de frequência ou encaminhe a solicitação de crachá por e-mail.

## Observações

- O back-end deve estar rodando antes do front-end.
- Sempre reinicie o back-end depois de alterar código C#.
- Se o front não atualizar depois de uma mudança, use `Ctrl + F5` no navegador.
- Pastas como `bin`, `obj`, `node_modules` e `dist` são geradas automaticamente e não precisam ser editadas manualmente.
