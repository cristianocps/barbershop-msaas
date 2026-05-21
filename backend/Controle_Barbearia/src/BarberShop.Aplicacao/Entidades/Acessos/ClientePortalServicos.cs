using BarberShop.Dominio.Entidade.Acessos;
using BarberShop.Dominio.Interfaces.Repositorios.Acessos;
using BarberShop.Dominio.Interfaces.Servicos.Acessos;

namespace BarberShop.Aplicacao.Entidades.Acessos
{
    public class ClientePortalServicos : IClientePortalServicos
    {
        private readonly IClientePortalRepositorio _repo;
        private readonly IContaClienteRepositorio _contaRepo;

        public ClientePortalServicos(IClientePortalRepositorio repo, IContaClienteRepositorio contaRepo)
        {
            _repo = repo;
            _contaRepo = contaRepo;
        }

        public async Task<IEnumerable<ClienteAgendamentoDto>> ListarAgendamentosAsync(string idClains)
        {
            var idConta = await _repo.ObterIdContaPorIdClainsAsync(idClains).ConfigureAwait(false);
            if (idConta <= 0) return [];
            return await _repo.ListarAgendamentosAsync(idConta).ConfigureAwait(false);
        }

        public Task<ContaCliente?> ObterPerfilAsync(string idClains)
            => _contaRepo.ObterPorIdClainsAsync(idClains);

        public async Task AtualizarPerfilAsync(string idClains, ContaCliente conta)
        {
            conta.IdClains = idClains;
            await _contaRepo.CriarOuAtualizarAsync(conta).ConfigureAwait(false);
        }
    }
}
