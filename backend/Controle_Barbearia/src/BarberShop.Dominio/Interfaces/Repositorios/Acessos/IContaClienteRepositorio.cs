using BarberShop.Dominio.Entidade.Acessos;

namespace BarberShop.Dominio.Interfaces.Repositorios.Acessos
{
    public interface IContaClienteRepositorio
    {
        Task<long> CriarOuAtualizarAsync(ContaCliente conta);
        Task<ContaCliente?> ObterPorIdClainsAsync(string idClains);
        Task<ContaCliente?> ObterPorIdAsync(long id);
        Task VincularClientesPorTelefoneOuEmailAsync(long idConta, string telefone, string email);
    }
}
