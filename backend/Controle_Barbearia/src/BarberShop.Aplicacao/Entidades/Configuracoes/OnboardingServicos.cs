using BarberShop.Dominio.Entidade.DTOs;
using BarberShop.Dominio.Interfaces.Repositorios.Configuracoes;
using BarberShop.Dominio.Interfaces.Servicos.Configuracoes;

namespace BarberShop.Aplicacao.Entidades.Configuracoes
{
    public class OnboardingServicos : IOnboardingServicos
    {
        private readonly IOnboardingRepositorio _repo;
        private readonly TransferenciaIdentidadeDTO _identidade;

        public OnboardingServicos(IOnboardingRepositorio repo, TransferenciaIdentidadeDTO identidade)
        {
            _repo = repo;
            _identidade = identidade;
        }

        private long EmpresaIdOuDemo => _identidade.IdEmpresaLogado is > 0 ? _identidade.IdEmpresaLogado.Value : 1;

        public Task<OnboardingStatusDto> ObterStatusAsync()
        {
            var idUsuario = _identidade.IdUsuarioLogado ?? 0;
            return _repo.ObterStatusAsync(EmpresaIdOuDemo, idUsuario);
        }

        public Task MarcarCompletoAsync()
        {
            return _repo.MarcarCompletoAsync(EmpresaIdOuDemo);
        }

        public Task SalvarEtapasTourAsync(string json)
        {
            return _repo.AtualizarEtapasJsonAsync(EmpresaIdOuDemo, json);
        }
    }
}
