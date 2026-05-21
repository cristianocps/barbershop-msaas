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

        public Task<OnboardingStatusDto> ObterStatusAsync()
        {
            var idEmpresa = _identidade.IdEmpresaLogado ?? 1;
            var idUsuario = _identidade.IdUsuarioLogado ?? 0;
            return _repo.ObterStatusAsync(idEmpresa, idUsuario);
        }

        public Task MarcarCompletoAsync()
        {
            var idEmpresa = _identidade.IdEmpresaLogado ?? 1;
            return _repo.MarcarCompletoAsync(idEmpresa);
        }

        public Task SalvarEtapasTourAsync(string json)
        {
            var idEmpresa = _identidade.IdEmpresaLogado ?? 1;
            return _repo.AtualizarEtapasJsonAsync(idEmpresa, json);
        }
    }
}
