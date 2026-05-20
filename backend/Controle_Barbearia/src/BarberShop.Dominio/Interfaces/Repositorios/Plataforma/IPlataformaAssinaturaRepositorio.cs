using BarberShop.Dominio.Entidade.Plataforma;
using BarberShop.Dominio.Entidade.Plataforma.DTOs;

namespace BarberShop.Dominio.Interfaces.Repositorios.Plataforma
{
    public interface IPlataformaAssinaturaRepositorio : IDisposable
    {
        Task CriarAssinaturaInicialAsync(long idEmpresa, int trialDias, int valorMensalCentavos);
        Task<EmpresaAssinatura?> ObterPorEmpresaAsync(long idEmpresa);
        Task<AssinaturaStatusDTO> ObterStatusAsync(long idEmpresa);
        Task<bool> EstaBloqueadaAsync(long idEmpresa);
        Task AtualizarStatusComputadoAsync(long idEmpresa);
        Task ConfirmarPagamentoAsync(long idEmpresa, long idCobranca, string? transactionNsu, int paidAmountCents);
        Task SalvarUrlCobrancaAsync(long idCobranca, string url);
        Task<(long IdCobranca, string OrderNsu, int ValorCentavos)> CriarCobrancaPendenteAsync(long idEmpresa, int valorCentavos);
        Task<IReadOnlyList<PlataformaEmpresaResumoDTO>> ListarEmpresasAsync(string? filtroStatus = null);
        Task<IReadOnlyList<PlataformaCobranca>> ListarCobrancasAsync(long idEmpresa);
        Task AplicarOverrideAsync(long idEmpresa, PlataformaAssinaturaOverrideDTO dados);
        Task<long?> ResolverIdEmpresaPorSlugAsync(string slug);
        Task<long?> ResolverIdEmpresaPorEmailAsync(string email);
        Task<long?> ResolverIdEmpresaPorProfissionalAsync(long idProfissional);
    }
}
