using BarberShop.Dominio.Entidade.DTOs;
using BarberShop.Dominio.Interfaces.Repositorios.Agendamentos;
using BarberShop.Dominio.Interfaces.Servicos.Agendamentos;

namespace BarberShop.Aplicacao.Entidades.Agendamentos
{
    public class FinanceiroServicos : IFinanceiroServicos
    {
        private readonly IFinanceiroRepositorio _financeiroRepositorio;

        public FinanceiroServicos(IFinanceiroRepositorio financeiroRepositorio)
        {
            _financeiroRepositorio = financeiroRepositorio;
        }

        public Task<FinanceiroResumoDTO> ObterResumoAsync(DateTime inicio, DateTime fim, long? idProfissional = null, int? tipoPagamento = null)
            => _financeiroRepositorio.ObterResumoAsync(inicio, fim, idProfissional, tipoPagamento);

        public Task<IEnumerable<FinanceiroLancamentoDTO>> ObterLancamentosAsync(DateTime inicio, DateTime fim, long? idProfissional = null, int? tipoPagamento = null)
            => _financeiroRepositorio.ObterLancamentosAsync(inicio, fim, idProfissional, tipoPagamento);

        public void Dispose()
        {
            _financeiroRepositorio?.Dispose();
            GC.SuppressFinalize(this);
        }
    }
}
