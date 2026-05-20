using BarberShop.Dominio.Entidade.Plataforma;
using BarberShop.Dominio.Entidade.Plataforma.DTOs;

namespace BarberShop.Dominio.Interfaces.Servicos.Plataforma
{
    public interface IPlataformaAssinaturaServicos : IDisposable
    {
        Task<AssinaturaStatusDTO> ObterStatusAsync(long? idEmpresa = null);
        Task<AssinaturaLinkRetornoDTO> GerarLinkPagamentoAsync(long? idEmpresa = null);
        Task ProcessarWebhookAsync(string orderNsu, string? transactionNsu, int paidAmountCents, string? webhookSecret);
        Task<IReadOnlyList<PlataformaEmpresaResumoDTO>> ListarEmpresasAsync(string? filtroStatus = null);
        Task<IReadOnlyList<PlataformaCobranca>> ListarCobrancasAsync(long idEmpresa);
        Task AplicarOverrideAsync(long idEmpresa, PlataformaAssinaturaOverrideDTO dados);
        Task<bool> EstaBloqueadaAsync(long idEmpresa);
    }
}
