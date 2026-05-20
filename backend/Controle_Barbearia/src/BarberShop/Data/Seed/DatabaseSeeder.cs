using BarberShop.Dominio.Interfaces.Base;
using BarberShop.Repositorio.Repositorio.Configuracoes;
using Microsoft.AspNetCore.Identity;
using Npgsql;
using System.Reflection;
using static BarberShop.Dominio.Enuns.IGroupPolicies;

namespace BarberShop.Data.Seed;

public sealed class DatabaseSeeder : IDatabaseSeeder
{
    private static readonly string[] IdentityRoles =
    [
        nameof(UserRoles.Consulta),
        nameof(UserRoles.Usuario),
        nameof(UserRoles.Profissional),
        nameof(UserRoles.Gerente),
        nameof(UserRoles.Admin),
        nameof(UserRoles.Desenvolvedor)
    ];

    private readonly string _connectionString;
    private readonly UserManager<IdentityUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly ILogger<DatabaseSeeder> _logger;
    private readonly IConfiguration _configuration;
    private readonly IDbConnectionFactory _db;

    public DatabaseSeeder(
        IConfiguration configuration,
        UserManager<IdentityUser> userManager,
        RoleManager<IdentityRole> roleManager,
        IDbConnectionFactory dbConnectionFactory,
        ILogger<DatabaseSeeder> logger)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
        _userManager = userManager;
        _roleManager = roleManager;
        _db = dbConnectionFactory;
        _logger = logger;
        _configuration = configuration;
    }

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        await ApplyBusinessSchemaAsync(cancellationToken).ConfigureAwait(false);
        await SeedIdentityRolesAsync(cancellationToken).ConfigureAwait(false);
        await SeedBusinessDataAsync(cancellationToken).ConfigureAwait(false);
        await BackfillConfiguracoesEmpresasAsync(cancellationToken).ConfigureAwait(false);
    }

    private async Task BackfillConfiguracoesEmpresasAsync(CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        await EmpresaConfiguracaoPadrao.AplicarEmTodasAsync(_db).ConfigureAwait(false);
        _logger.LogInformation("Configurações padrão aplicadas em todas as barbearias existentes.");
    }

    private static readonly string[] SchemaScripts =
    [
        "BarberShop.Data.Scripts.001_business_schema.sql",
        "BarberShop.Data.Scripts.002_fn_obter_credenciais.sql",
        "BarberShop.Data.Scripts.003_duracao_servicos_agendamentos.sql",
        "BarberShop.Data.Scripts.004_cliente_cpf.sql",
    ];

    private async Task ApplyBusinessSchemaAsync(CancellationToken cancellationToken)
    {
        var assembly = typeof(DatabaseSeeder).Assembly;

        await using var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync(cancellationToken).ConfigureAwait(false);

        foreach (var resourceName in SchemaScripts)
        {
            await using var stream = assembly.GetManifestResourceStream(resourceName)
                ?? throw new InvalidOperationException($"Recurso SQL não encontrado: {resourceName}");

            using var reader = new StreamReader(stream);
            var sql = await reader.ReadToEndAsync(cancellationToken).ConfigureAwait(false);

            // Scripts com $$ (functions/procedures) não podem ser divididos por ';'
            var statements = sql.Contains("$$", StringComparison.Ordinal)
                ? [sql]
                : SplitSqlStatements(sql).ToArray();

            foreach (var statement in statements)
            {
                await using var command = new NpgsqlCommand(statement, connection);
                await command.ExecuteNonQueryAsync(cancellationToken).ConfigureAwait(false);
            }
        }

        _logger.LogInformation("Schema de negócio aplicado (idempotente).");
    }

    private async Task SeedIdentityRolesAsync(CancellationToken cancellationToken)
    {
        foreach (var roleName in IdentityRoles)
        {
            if (await _roleManager.RoleExistsAsync(roleName).ConfigureAwait(false))
                continue;

            var result = await _roleManager.CreateAsync(new IdentityRole(roleName)).ConfigureAwait(false);
            if (!result.Succeeded)
            {
                var errors = string.Join("; ", result.Errors.Select(e => e.Description));
                _logger.LogWarning("Falha ao criar role {Role}: {Errors}", roleName, errors);
            }
            else
            {
                _logger.LogInformation("Role Identity criada: {Role}", roleName);
            }
        }
    }

    private async Task SeedBusinessDataAsync(CancellationToken cancellationToken)
    {
        await using var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync(cancellationToken).ConfigureAwait(false);

        var empresaCount = await ScalarAsync<long>(connection, "SELECT COUNT(*) FROM public.empresas", cancellationToken)
            .ConfigureAwait(false);

        if (empresaCount > 0)
        {
            _logger.LogInformation("Dados de negócio já existem — seed ignorado.");
            return;
        }

        var adminEmail = _configuration["Seed:AdminEmail"] ?? "admin@demo.barbershop";
        var adminPassword = _configuration["Seed:AdminPassword"] ?? "Admin@123";

        var adminUser = await _userManager.FindByEmailAsync(adminEmail).ConfigureAwait(false);
        if (adminUser == null)
        {
            adminUser = new IdentityUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                EmailConfirmed = true
            };

            var createResult = await _userManager.CreateAsync(adminUser, adminPassword).ConfigureAwait(false);
            if (!createResult.Succeeded)
            {
                var errors = string.Join("; ", createResult.Errors.Select(e => e.Description));
                throw new InvalidOperationException($"Não foi possível criar usuário admin: {errors}");
            }

            _logger.LogInformation("Usuário Identity admin criado: {Email}", adminEmail);
        }

        var adminRole = await _roleManager.FindByNameAsync(nameof(UserRoles.Admin)).ConfigureAwait(false);
        if (adminRole != null && !await _userManager.IsInRoleAsync(adminUser, adminRole.Name!).ConfigureAwait(false))
        {
            await _userManager.AddToRoleAsync(adminUser, adminRole.Name!).ConfigureAwait(false);
        }

        await using var tx = await connection.BeginTransactionAsync(cancellationToken).ConfigureAwait(false);

        // Usuário de negócio (id fixo 1 — referenciado no registro público com IdEmpresa = 1)
        await ExecuteAsync(connection, tx, """
            INSERT INTO public.usuarios (id, idempresa, documento, descricao, email, cidade, logon, senha, idclains, dtcriacao, telefone, status)
            VALUES (1, 1, '00000000000', 'Administrador Demo', @email, 'São Paulo', @email, '', @idClaims, NOW(), '11999990000', 1)
            ON CONFLICT (id) DO NOTHING
            """,
            new { email = adminEmail, idClaims = adminUser.Id },
            cancellationToken).ConfigureAwait(false);

        await ExecuteAsync(connection, tx, """
            INSERT INTO public.empresas (id, idusuario, descricao, cidade, dtcriacao, telefone, endereco, logo_data, status, slug)
            VALUES (1, 1, 'Barbearia Demo', 'São Paulo', NOW(), '1133334444', 'Rua das Flores, 100', NULL, 1, 'barbearia-demo')
            ON CONFLICT (id) DO NOTHING
            """, null, cancellationToken).ConfigureAwait(false);

        await ExecuteAsync(connection, tx, """
            INSERT INTO public.servicos (id, idempresa, idusuario, descricao, unidade, valor_unitario, duracao_minutos, dtcriacao, status) VALUES
            (1, 1, 1, 'Corte masculino', 'un', 45.00, 30, NOW(), 1),
            (2, 1, 1, 'Barba', 'un', 35.00, 20, NOW(), 1),
            (3, 1, 1, 'Corte + Barba', 'un', 70.00, 50, NOW(), 1)
            ON CONFLICT (id) DO NOTHING
            """, null, cancellationToken).ConfigureAwait(false);

        await ExecuteAsync(connection, tx, """
            INSERT INTO public.profissionais (id, idempresa, idusuario, descricao, telefone, cor_agenda, dtcriacao, status) VALUES
            (1, 1, 1, 'João Silva', '11988887777', '#3B82F6', NOW(), 1),
            (2, 1, 1, 'Carlos Mendes', '11977776666', '#10B981', NOW(), 1)
            ON CONFLICT (id) DO NOTHING
            """, null, cancellationToken).ConfigureAwait(false);

        await ExecuteAsync(connection, tx, """
            INSERT INTO public.profissionais_horarios (idempresa, idprofissional, dia_semana, hora_inicio, hora_fim, duracao_minutos, dtcriacao, status)
            SELECT 1, p.id, d.dia, TIME '09:00', TIME '18:00', 30, NOW(), 1
            FROM public.profissionais p
            CROSS JOIN (VALUES (1),(2),(3),(4),(5),(6)) AS d(dia)
            WHERE p.idempresa = 1
            """, null, cancellationToken).ConfigureAwait(false);

        await ExecuteAsync(connection, tx, """
            INSERT INTO public.clientes (id, idempresa, idusuario, descricao, telefone, endereco, dtcriacao, status) VALUES
            (1, 1, 1, 'Pedro Santos', '11966665555', NULL, NOW(), 1),
            (2, 1, 1, 'Lucas Oliveira', '11955554444', NULL, NOW(), 1),
            (3, 1, 1, 'Marcos Souza', '11944443333', NULL, NOW(), 1)
            ON CONFLICT (id) DO NOTHING
            """, null, cancellationToken).ConfigureAwait(false);

        var agendamentoData = DateTime.UtcNow.Date.AddDays(1).AddHours(10);
        await ExecuteAsync(connection, tx, """
            INSERT INTO public.agendamentos (id, idempresa, idprofissional, idusuario, idcliente, descricao, dtagendamento, dtcriacao, telefone, observacao, status)
            VALUES (1, 1, 1, 1, 1, 'Corte masculino', @dt, NOW(), '11966665555', 'Cliente preferencial', 1)
            ON CONFLICT (id) DO NOTHING
            """,
            new { dt = agendamentoData },
            cancellationToken).ConfigureAwait(false);

        await ExecuteAsync(connection, tx, """
            INSERT INTO public.agendamento_itens (idempresa, idusuario, idagendamento, idservico, valor_cobrado, status)
            VALUES (1, 1, 1, 1, 45.00, 1)
            """, null, cancellationToken).ConfigureAwait(false);

        await ResetSequencesAsync(connection, tx, cancellationToken).ConfigureAwait(false);

        await tx.CommitAsync(cancellationToken).ConfigureAwait(false);

        _logger.LogInformation(
            "Seed concluído — empresa 'Barbearia Demo' (slug: barbearia-demo). Login admin: {Email} / {Password}",
            adminEmail,
            adminPassword);
    }

    private static async Task ResetSequencesAsync(NpgsqlConnection connection, NpgsqlTransaction tx, CancellationToken cancellationToken)
    {
        string[] tables = ["empresas", "usuarios", "perfil", "servicos", "profissionais", "clientes", "agendamentos", "tipochave"];

        foreach (var table in tables)
        {
            await ExecuteAsync(connection, tx, $"""
                SELECT setval(
                    pg_get_serial_sequence('public.{table}', 'id'),
                    COALESCE((SELECT MAX(id) FROM public.{table}), 1)
                )
                """, null, cancellationToken).ConfigureAwait(false);
        }
    }

    private static IEnumerable<string> SplitSqlStatements(string sql)
    {
        var withoutLineComments = string.Join('\n',
            sql.Split('\n').Select(line =>
            {
                var idx = line.IndexOf("--", StringComparison.Ordinal);
                return idx >= 0 ? line[..idx] : line;
            }));

        return withoutLineComments
            .Split(';', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Where(s => s.Length > 0);
    }

    private static async Task<T> ScalarAsync<T>(NpgsqlConnection connection, string sql, CancellationToken cancellationToken)
    {
        await using var command = new NpgsqlCommand(sql, connection);
        var result = await command.ExecuteScalarAsync(cancellationToken).ConfigureAwait(false);
        return (T)Convert.ChangeType(result!, typeof(T));
    }

    private static async Task ExecuteAsync(
        NpgsqlConnection connection,
        NpgsqlTransaction? tx,
        string sql,
        object? parameters,
        CancellationToken cancellationToken)
    {
        await using var command = new NpgsqlCommand(sql, connection, tx);
        if (parameters != null)
        {
            foreach (var prop in parameters.GetType().GetProperties(BindingFlags.Instance | BindingFlags.Public))
            {
                command.Parameters.AddWithValue(prop.Name, prop.GetValue(parameters) ?? DBNull.Value);
            }
        }

        await command.ExecuteNonQueryAsync(cancellationToken).ConfigureAwait(false);
    }
}
