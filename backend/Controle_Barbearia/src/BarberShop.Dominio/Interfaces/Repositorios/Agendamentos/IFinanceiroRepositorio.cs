using BarberShop.Dominio.Entidade.DTOs;

namespace BarberShop.Dominio.Interfaces.Repositorios.Agendamentos
{
    public interface IFinanceiroRepositorio : IDisposable
    {
        Task<FinanceiroResumoDTO> ObterResumoAsync(DateTime inicio, DateTime fim, long? idProfissional = null, int? tipoPagamento = null);
        Task<IEnumerable<FinanceiroLancamentoDTO>> ObterLancamentosAsync(DateTime inicio, DateTime fim, long? idProfissional = null, int? tipoPagamento = null);
    }
}
