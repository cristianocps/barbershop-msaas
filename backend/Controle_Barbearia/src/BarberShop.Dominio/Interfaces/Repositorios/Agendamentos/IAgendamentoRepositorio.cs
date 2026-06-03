using BarberShop.Dominio.Entidade.Agendamentos;
using BarberShop.Dominio.Entidade.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BarberShop.Dominio.Interfaces.Repositorios.Agendamentos
{
    public interface IAgendamentoRepositorio : IDisposable
    {
        Task<long> AlterarAgendamentos(Agendamento dados);
        Task<long> AlterarStatusAgendamento(long id, int status);
        Task<IEnumerable<DataSelect2DTO>> CarregarComboAgendamentos(string search, int page, int? length = 10);
        Task<RetornoGridPaginado<Agendamento>> CarregarGridAgendamentos(DataTableSearch search, int start, int draw, int? length = 10);
        Task<Agendamento> Editar(long idItem);
        Task<IEnumerable<AgendamentoPendenteDTO>> GetAgendamentosPendentesHoje();
        Task<IEnumerable<AgendamentoPendenteDTO>> GetAgendamentosProximos();
        Task<IEnumerable<AgendamentoCalendarioDTO>> CarregarCalendario(DateTime inicio, DateTime fim);
        Task ConfirmarAgendamentoAsync(long id);
        Task CancelarAgendamentoAsync(long id, string? motivo);
        Task ConcluirAgendamentoAsync(long id, ConcluirAgendamentoDTO dados);
        Task<(long IdPagamento, string OrderNsu, decimal Valor, string Descricao, string Handle)> PrepararPagamentoInfiniteLinkAsync(long idAgendamento);
        Task SalvarUrlPagamentoLinkAsync(long idPagamento, string url);
        Task<TapUrlRetornoDTO> ObterTapUrlAsync(long idAgendamento, string metodo, int parcelas);
        Task ProcessarTapCallbackAsync(TapCallbackDTO dados);
        Task ProcessarWebhookInfinitePayAsync(string orderNsu, string? transactionNsu, string? captureMethod, int paidAmountCents, string? receiptUrl, string? webhookSecretHeader = null);
        Task<AgendamentoPagamento?> ObterPagamentoPorAgendamentoAsync(long idAgendamento);
    }
}
