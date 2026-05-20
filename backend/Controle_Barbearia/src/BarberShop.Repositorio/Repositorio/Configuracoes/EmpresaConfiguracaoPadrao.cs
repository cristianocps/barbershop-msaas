using BarberShop.Dominio.Interfaces.Base;

namespace BarberShop.Repositorio.Repositorio.Configuracoes;

/// <summary>
/// Configurações iniciais aplicadas automaticamente ao criar uma nova barbearia.
/// </summary>
public static class EmpresaConfiguracaoPadrao
{
    public static readonly string[] TiposChavePix =
    [
        "CPF",
        "E-mail",
        "Telefone",
        "Chave aleatória"
    ];

    public static async Task AplicarAsync(IDbConnectionFactory db, long idEmpresa, long idUsuario)
    {
        if (idEmpresa <= 0)
            return;

        var idUsuarioFinal = idUsuario > 0 ? idUsuario : 1;

        await SeedTiposChavePixAsync(db, idEmpresa, idUsuarioFinal).ConfigureAwait(false);
        await SeedPerfisAsync(db, idEmpresa).ConfigureAwait(false);
    }

    /// <summary>
    /// Aplica configurações padrão em todas as barbearias já cadastradas (somente o que estiver faltando).
    /// </summary>
    public static async Task AplicarEmTodasAsync(IDbConnectionFactory db)
    {
        const string sql = "SELECT id AS Id, idusuario AS IdUsuario FROM public.empresas ORDER BY id";
        var empresas = await db.QueryAsync<EmpresaResumo>(sql).ConfigureAwait(false);

        foreach (var empresa in empresas)
            await AplicarAsync(db, empresa.Id, empresa.IdUsuario).ConfigureAwait(false);
    }

    private sealed class EmpresaResumo
    {
        public long Id { get; set; }
        public long IdUsuario { get; set; }
    }

    private static async Task SeedTiposChavePixAsync(IDbConnectionFactory db, long idEmpresa, long idUsuario)
    {
        const string sql = """
            INSERT INTO public.tipochave (idempresa, idusuario, descricao, dtcriacao, status)
            SELECT @IdEmpresa, @IdUsuario, @Descricao, NOW(), 1
            WHERE NOT EXISTS (
                SELECT 1 FROM public.tipochave t
                WHERE t.idempresa = @IdEmpresa AND t.descricao = @Descricao
            );
            """;

        foreach (var descricao in TiposChavePix)
        {
            await db.ExecuteAsync(sql, new
            {
                IdEmpresa = idEmpresa,
                IdUsuario = idUsuario,
                Descricao = descricao
            }).ConfigureAwait(false);
        }
    }

    private static async Task SeedPerfisAsync(IDbConnectionFactory db, long idEmpresa)
    {
        const string sql = """
            INSERT INTO public.perfil (idempresa, codigo, idrole, descricao, status)
            SELECT
                @IdEmpresa,
                CASE ar."Name"
                    WHEN 'Consulta' THEN 1
                    WHEN 'Usuario' THEN 2
                    WHEN 'Profissional' THEN 3
                    WHEN 'Gerente' THEN 4
                    WHEN 'Admin' THEN 5
                    WHEN 'Desenvolvedor' THEN 6
                END,
                ar."Id",
                CASE ar."Name"
                    WHEN 'Consulta' THEN 'Consulta'
                    WHEN 'Usuario' THEN 'Usuário'
                    WHEN 'Profissional' THEN 'Profissional'
                    WHEN 'Gerente' THEN 'Gerente'
                    WHEN 'Admin' THEN 'Administrador'
                    WHEN 'Desenvolvedor' THEN 'Desenvolvedor'
                END,
                1
            FROM "AspNetRoles" ar
            WHERE ar."Name" IN ('Consulta', 'Usuario', 'Profissional', 'Gerente', 'Admin', 'Desenvolvedor')
              AND NOT EXISTS (
                  SELECT 1 FROM public.perfil p
                  WHERE p.idempresa = @IdEmpresa AND p.idrole = ar."Id"
              );
            """;

        await db.ExecuteAsync(sql, new { IdEmpresa = idEmpresa }).ConfigureAwait(false);
    }
}
