using BarberShop.Dominio.Entidade.Acessos;
using BarberShop.Dominio.Interfaces.Base;
using BarberShop.Dominio.Interfaces.Repositorios.Acessos;
using BarberShop.Dominio.Entidade.Reflection.Texto;
using BarberShop.Infraestrutura.padronizar;

namespace BarberShop.Repositorio.Repositorio.Acessos
{
    public class ContaClienteRepositorio : IContaClienteRepositorio
    {
        private readonly IDbConnectionFactory _db;

        public ContaClienteRepositorio(IDbConnectionFactory db) => _db = db;

        public async Task<long> CriarOuAtualizarAsync(ContaCliente conta)
        {
            const string sql = """
                INSERT INTO public.contas_cliente (idclains, email, nome, telefone, dtcriacao, status)
                VALUES (@IdClains, @Email, @Nome, @Telefone, NOW(), @Status)
                ON CONFLICT (idclains) DO UPDATE SET
                    email = EXCLUDED.email,
                    nome = EXCLUDED.nome,
                    telefone = COALESCE(EXCLUDED.telefone, public.contas_cliente.telefone),
                    status = EXCLUDED.status
                RETURNING id;
                """;

            try
            {
                return await _db.QuerySingleOrDefaultAsync<long>(sql, conta).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                throw new TratamentoExcecao($"Erro ao salvar conta do cliente: {ex.Message}");
            }
        }

        public async Task<ContaCliente?> ObterPorIdClainsAsync(string idClains)
        {
            const string sql = """
                SELECT id AS ID, idclains AS IdClains, email AS Email, nome AS Nome,
                       telefone AS Telefone, dtcriacao AS DtCriacao, status AS Status
                FROM public.contas_cliente
                WHERE idclains = @IdClains
                LIMIT 1;
                """;

            return await _db.QuerySingleOrDefaultAsync<ContaCliente>(sql, new { IdClains = idClains }).ConfigureAwait(false);
        }

        public async Task<ContaCliente?> ObterPorIdAsync(long id)
        {
            const string sql = """
                SELECT id AS ID, idclains AS IdClains, email AS Email, nome AS Nome,
                       telefone AS Telefone, dtcriacao AS DtCriacao, status AS Status
                FROM public.contas_cliente
                WHERE id = @Id
                LIMIT 1;
                """;

            return await _db.QuerySingleOrDefaultAsync<ContaCliente>(sql, new { Id = id }).ConfigureAwait(false);
        }

        public async Task VincularClientesPorTelefoneOuEmailAsync(long idConta, string telefone, string email)
        {
            const string sql = """
                UPDATE public.clientes
                SET idconta = @IdConta
                WHERE idconta IS NULL
                  AND (
                    (telefone <> '' AND telefone = @Telefone)
                    OR LOWER(TRIM(descricao)) = LOWER(TRIM(@Email))
                  );
                """;

            await _db.ExecuteAsync(sql, new { IdConta = idConta, Telefone = telefone ?? "", Email = email }).ConfigureAwait(false);
        }
    }
}
