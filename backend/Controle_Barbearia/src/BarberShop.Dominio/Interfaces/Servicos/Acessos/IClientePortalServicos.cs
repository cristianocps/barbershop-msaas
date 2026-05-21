using BarberShop.Dominio.Entidade.Acessos;
using BarberShop.Dominio.Interfaces.Repositorios.Acessos;

namespace BarberShop.Dominio.Interfaces.Servicos.Acessos
{
    public interface IClientePortalServicos
    {
        Task<IEnumerable<ClienteAgendamentoDto>> ListarAgendamentosAsync(string idClains);
        Task<ContaCliente?> ObterPerfilAsync(string idClains);
        Task AtualizarPerfilAsync(string idClains, ContaCliente conta);
    }
}
