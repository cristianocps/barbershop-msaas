using BarberShop.Dominio.Interfaces.Repositorios.Acessos;
using BarberShop.Dominio.Interfaces.Base;

namespace BarberShop.Repositorio.Repositorio.Acessos
{
    public class ClientePortalRepositorio : IClientePortalRepositorio
    {
        private readonly IDbConnectionFactory _db;

        public ClientePortalRepositorio(IDbConnectionFactory db) => _db = db;

        public async Task<long> ObterIdContaPorIdClainsAsync(string idClains)
        {
            const string sql = "SELECT id FROM public.contas_cliente WHERE idclains = @IdClains LIMIT 1;";
            return await _db.QuerySingleOrDefaultAsync<long>(sql, new { IdClains = idClains }).ConfigureAwait(false);
        }

        public async Task<IEnumerable<ClienteAgendamentoDto>> ListarAgendamentosAsync(long idConta)
        {
            const string sql = """
                SELECT
                    a.id AS Id,
                    e.descricao AS EmpresaNome,
                    e.slug AS EmpresaSlug,
                    a.descricao AS Descricao,
                    a.dtagendamento AS DtAgendamento,
                    a.status AS Status,
                    a.telefone AS Telefone
                FROM public.agendamentos a
                INNER JOIN public.clientes c ON c.id = a.idcliente
                INNER JOIN public.empresas e ON e.id = a.idempresa
                WHERE c.idconta = @IdConta
                ORDER BY a.dtagendamento DESC
                LIMIT 200;
                """;

            return await _db.QueryAsync<ClienteAgendamentoDto>(sql, new { IdConta = idConta }).ConfigureAwait(false);
        }
    }
}
