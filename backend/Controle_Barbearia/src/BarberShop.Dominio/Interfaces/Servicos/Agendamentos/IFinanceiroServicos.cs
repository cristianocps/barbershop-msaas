using BarberShop.Dominio.Entidade.DTOs;

namespace BarberShop.Dominio.Interfaces.Servicos.Agendamentos
{
    public interface IFinanceiroServicos : IDisposable
    {
        Task<FinanceiroResumoDTO> ObterResumoAsync(DateTime inicio, DateTime fim, long? idProfissional = null, int? tipoPagamento = null);
        Task<IEnumerable<FinanceiroLancamentoDTO>> ObterLancamentosAsync(DateTime inicio, DateTime fim, long? idProfissional = null, int? tipoPagamento = null);
    }
}
