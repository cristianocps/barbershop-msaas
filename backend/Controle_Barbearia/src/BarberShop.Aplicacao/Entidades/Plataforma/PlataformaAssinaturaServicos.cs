using BarberShop.Dominio.Entidade.DTOs;
using BarberShop.Dominio.Entidade.Plataforma;
using BarberShop.Dominio.Entidade.Plataforma.DTOs;
using BarberShop.Dominio.Helpers;
using BarberShop.Dominio.Interfaces.Pagamentos;
using BarberShop.Dominio.Interfaces.Repositorios.Plataforma;
using BarberShop.Dominio.Interfaces.Servicos.Plataforma;
using BarberShop.Infraestrutura.Pagamentos;
using BarberShop.Dominio.Entidade.Reflection.Texto;
using Microsoft.Extensions.Options;

namespace BarberShop.Aplicacao.Entidades.Plataforma
{
    public class PlataformaAssinaturaServicos : IPlataformaAssinaturaServicos
    {
        private readonly IPlataformaAssinaturaRepositorio _repo;
        private readonly IInfinitePayCheckoutClient _infinitePay;
        private readonly PlataformaBillingSettings _billing;
        private readonly TransferenciaIdentidadeDTO _identidade;

        public PlataformaAssinaturaServicos(
            IPlataformaAssinaturaRepositorio repo,
            IInfinitePayCheckoutClient infinitePay,
            IOptions<PlataformaBillingSettings> billing,
            TransferenciaIdentidadeDTO identidade)
        {
            _repo = repo;
            _infinitePay = infinitePay;
            _billing = billing.Value;
            _identidade = identidade;
        }

        private long ResolverIdEmpresa(long? idEmpresa)
        {
            var id = idEmpresa ?? _identidade.IdEmpresaLogado;
            if (id is null or <= 0)
                throw new TratamentoExcecao("Empresa não identificada.");
            return id.Value;
        }

        public async Task<AssinaturaStatusDTO> ObterStatusAsync(long? idEmpresa = null)
        {
            var id = ResolverIdEmpresa(idEmpresa);
            if (await _repo.ObterPorEmpresaAsync(id).ConfigureAwait(false) == null)
            {
                await _repo.CriarAssinaturaInicialAsync(id, _billing.TrialDias, _billing.MensalidadeCentavos)
                    .ConfigureAwait(false);
            }
            return await _repo.ObterStatusAsync(id).ConfigureAwait(false);
        }

        public Task<bool> EstaBloqueadaAsync(long idEmpresa)
            => _repo.EstaBloqueadaAsync(idEmpresa);

        public async Task<AssinaturaLinkRetornoDTO> GerarLinkPagamentoAsync(long? idEmpresa = null)
        {
            var id = ResolverIdEmpresa(idEmpresa);
            if (string.IsNullOrWhiteSpace(_billing.Handle))
                throw new TratamentoExcecao("Conta Infinite Pay da plataforma não configurada.");

            var status = await _repo.ObterStatusAsync(id).ConfigureAwait(false);
            var centavos = status.ValorMensalCentavos;
            if (centavos < 100) centavos = 100;

            var (idCobranca, orderNsu, _) = await _repo.CriarCobrancaPendenteAsync(id, centavos).ConfigureAwait(false);
            var redirect = $"{_billing.RedirectUrlBase.TrimEnd('/')}?order_nsu={Uri.EscapeDataString(orderNsu)}";

            var url = await _infinitePay.CriarLinkPagamentoAsync(new InfinitePayLinkRequest
            {
                Handle = _billing.Handle,
                OrderNsu = orderNsu,
                RedirectUrl = redirect,
                WebhookUrl = _billing.WebhookUrl,
                Items = new List<InfinitePayLinkItem>
                {
                    new() { Quantity = 1, PriceCents = centavos, Description = "Mensalidade BarberShop" }
                }
            }).ConfigureAwait(false);

            await _repo.SalvarUrlCobrancaAsync(idCobranca, url).ConfigureAwait(false);

            return new AssinaturaLinkRetornoDTO
            {
                Url = url,
                OrderNsu = orderNsu,
                IdCobranca = idCobranca
            };
        }

        public async Task ProcessarWebhookAsync(string orderNsu, string? transactionNsu, int paidAmountCents, string? webhookSecret)
        {
            if (!string.IsNullOrWhiteSpace(_billing.WebhookSecret)
                && !string.Equals(_billing.WebhookSecret.Trim(), webhookSecret?.Trim(), StringComparison.Ordinal))
                throw new TratamentoExcecao("Webhook Infinite Pay: segredo inválido.");

            var (idEmpresa, idCobranca) = PedidoPlataformaNsu.Parse(orderNsu);
            await _repo.ConfirmarPagamentoAsync(idEmpresa, idCobranca, transactionNsu, paidAmountCents).ConfigureAwait(false);
        }

        public Task<IReadOnlyList<PlataformaEmpresaResumoDTO>> ListarEmpresasAsync(string? filtroStatus = null)
            => _repo.ListarEmpresasAsync(filtroStatus);

        public Task<IReadOnlyList<PlataformaCobranca>> ListarCobrancasAsync(long idEmpresa)
            => _repo.ListarCobrancasAsync(idEmpresa);

        public Task AplicarOverrideAsync(long idEmpresa, PlataformaAssinaturaOverrideDTO dados)
            => _repo.AplicarOverrideAsync(idEmpresa, dados);

        public void Dispose()
        {
            _repo?.Dispose();
            GC.SuppressFinalize(this);
        }
    }
}
