using BarberShop.Dominio.Entidade.Agendamentos;
using BarberShop.Dominio.Entidade.DTOs;
using BarberShop.Dominio.Interfaces.Pagamentos;
using BarberShop.Dominio.Interfaces.Repositorios.Agendamentos;
using BarberShop.Dominio.Interfaces.Servicos.Agendamentos;
using BarberShop.Infraestrutura.Pagamentos;
using Microsoft.Extensions.Options;

namespace BarberShop.Aplicacao.Entidades.Agendamentos
{
    public class AgendamentoServicos : IAgendamentoServicos
    {
        private readonly IAgendamentoRepositorio _agendamentoRepositorio;
        private readonly IInfinitePayCheckoutClient _infinitePay;
        private readonly InfinitePaySettings _infinitePaySettings;

        public AgendamentoServicos(
            IAgendamentoRepositorio agendamentoRepositorio,
            IInfinitePayCheckoutClient infinitePay,
            IOptions<InfinitePaySettings> infinitePaySettings)
        {
            _agendamentoRepositorio = agendamentoRepositorio;
            _infinitePay = infinitePay;
            _infinitePaySettings = infinitePaySettings.Value;
        }

        public async Task<long> AlterarAgendamentos(Agendamento dados)
        {
            return await _agendamentoRepositorio.AlterarAgendamentos(dados).ConfigureAwait(true);
        }

        public async Task<long> AlterarStatusAgendamento(long id, int status)
        {
            return await _agendamentoRepositorio.AlterarStatusAgendamento(id, status).ConfigureAwait(true);
        }

        public async Task<IEnumerable<DataSelect2DTO>> CarregarComboAgendamentos(string search, int page, int? length = 10)
        {
            return await _agendamentoRepositorio.CarregarComboAgendamentos(search, page, length).ConfigureAwait(false);
        }

        public async Task<RetornoGridPaginado<Agendamento>> CarregarGridAgendamentos(DataTableSearch search, int start, int draw, int? length = 10)
        {
            return await _agendamentoRepositorio.CarregarGridAgendamentos(search, start, draw, length).ConfigureAwait(false);
        }

        public async Task<Agendamento> Editar(long idItem)
        {
            return await _agendamentoRepositorio.Editar(idItem).ConfigureAwait(false);
        }

        public async Task<IEnumerable<AgendamentoPendenteDTO>> GetAgendamentosPendentesHoje()
        {
            return await _agendamentoRepositorio.GetAgendamentosPendentesHoje().ConfigureAwait(false);
        }

        public async Task<IEnumerable<AgendamentoCalendarioDTO>> CarregarCalendario(DateTime inicio, DateTime fim)
        {
            return await _agendamentoRepositorio.CarregarCalendario(inicio, fim).ConfigureAwait(false);
        }

        public Task ConfirmarAgendamentoAsync(long id)
            => _agendamentoRepositorio.ConfirmarAgendamentoAsync(id);

        public Task CancelarAgendamentoAsync(long id, string? motivo)
            => _agendamentoRepositorio.CancelarAgendamentoAsync(id, motivo);

        public Task ConcluirAgendamentoAsync(long id, ConcluirAgendamentoDTO dados)
            => _agendamentoRepositorio.ConcluirAgendamentoAsync(id, dados);

        public async Task<PagamentoLinkRetornoDTO> GerarLinkPagamentoAsync(long id)
        {
            var prep = await _agendamentoRepositorio.PrepararPagamentoInfiniteLinkAsync(id).ConfigureAwait(false);
            var centavos = (int)Math.Round(prep.Valor * 100, MidpointRounding.AwayFromZero);
            if (centavos < 100) centavos = 100;

            var redirect = $"{_infinitePaySettings.RedirectUrlBase.TrimEnd('/')}?order_nsu={Uri.EscapeDataString(prep.OrderNsu)}";
            var url = await _infinitePay.CriarLinkPagamentoAsync(new InfinitePayLinkRequest
            {
                Handle = prep.Handle,
                OrderNsu = prep.OrderNsu,
                RedirectUrl = redirect,
                WebhookUrl = _infinitePaySettings.WebhookUrl,
                Items = new List<InfinitePayLinkItem>
                {
                    new() { Quantity = 1, PriceCents = centavos, Description = prep.Descricao }
                }
            }).ConfigureAwait(false);

            await _agendamentoRepositorio.SalvarUrlPagamentoLinkAsync(prep.IdPagamento, url).ConfigureAwait(false);

            return new PagamentoLinkRetornoDTO
            {
                Url = url,
                IdPagamento = prep.IdPagamento,
                GatewayOrderNsu = prep.OrderNsu
            };
        }

        public Task<TapUrlRetornoDTO> ObterTapUrlAsync(long id, string metodo, int parcelas)
            => _agendamentoRepositorio.ObterTapUrlAsync(id, metodo, parcelas);

        public Task ProcessarTapCallbackAsync(TapCallbackDTO dados)
            => _agendamentoRepositorio.ProcessarTapCallbackAsync(dados);

        public Task<AgendamentoPagamento?> ObterPagamentoPorAgendamentoAsync(long id)
            => _agendamentoRepositorio.ObterPagamentoPorAgendamentoAsync(id);

        public void Dispose()
        {
            _agendamentoRepositorio?.Dispose();
            GC.SuppressFinalize(this);
        }
    }
}
