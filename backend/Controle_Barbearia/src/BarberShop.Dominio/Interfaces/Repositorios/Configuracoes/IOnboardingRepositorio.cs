namespace BarberShop.Dominio.Interfaces.Repositorios.Configuracoes
{
    public class OnboardingEtapaStatus
    {
        public string Key { get; set; } = string.Empty;
        public string Titulo { get; set; } = string.Empty;
        public bool Concluida { get; set; }
        public string? Rota { get; set; }
    }

    public class OnboardingStatusDto
    {
        public bool OnboardingCompleto { get; set; }
        public int Percentual { get; set; }
        public List<OnboardingEtapaStatus> Etapas { get; set; } = [];
        public long IdEmpresa { get; set; }
    }

    public interface IOnboardingRepositorio
    {
        Task<OnboardingStatusDto> ObterStatusAsync(long idEmpresa, long idUsuarioLogado);
        Task MarcarCompletoAsync(long idEmpresa);
        Task AtualizarEtapasJsonAsync(long idEmpresa, string json);
        Task AutoMarcarCompletoSeElegivelAsync(long idEmpresa);
    }
}
