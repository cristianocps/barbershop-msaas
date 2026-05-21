using BarberShop.Dominio.Interfaces.Repositorios.Configuracoes;

namespace BarberShop.Dominio.Interfaces.Servicos.Configuracoes
{
    public interface IOnboardingServicos
    {
        Task<OnboardingStatusDto> ObterStatusAsync();
        Task MarcarCompletoAsync();
        Task SalvarEtapasTourAsync(string json);
    }
}
