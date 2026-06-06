using BarberShop.Dominio.Entidade.DTOs;
using BarberShop.Dominio.Interfaces.Base;
using BarberShop.Dominio.Interfaces.Repositorios.Configuracoes;
using System.Text.Json;

namespace BarberShop.Repositorio.Repositorio.Configuracoes
{
    public class OnboardingRepositorio : IOnboardingRepositorio
    {
        private readonly IDbConnectionFactory _db;
        private readonly TransferenciaIdentidadeDTO _identidade;

        public OnboardingRepositorio(IDbConnectionFactory db, TransferenciaIdentidadeDTO identidade)
        {
            _db = db;
            _identidade = identidade;
        }

        public async Task<OnboardingStatusDto> ObterStatusAsync(long idEmpresa, long idUsuarioLogado)
        {
            var empresaReal = idEmpresa > 1;

            var servicos = await ScalarCountAsync(
                "SELECT COUNT(*) FROM public.servicos WHERE idempresa = @IdEmpresa AND status = 1",
                idEmpresa).ConfigureAwait(false);

            var profissionais = await ScalarCountAsync(
                "SELECT COUNT(*) FROM public.profissionais WHERE idempresa = @IdEmpresa AND status = 1",
                idEmpresa).ConfigureAwait(false);

            var pix = await ScalarCountAsync(
                "SELECT COUNT(*) FROM public.dadosbancarios WHERE idempresa = @IdEmpresa AND status = 1",
                idEmpresa).ConfigureAwait(false);

            var infinite = await ScalarLongAsync(
                """
                SELECT CASE
                    WHEN COALESCE(TRIM(infinitepay_handle), '') <> '' THEN 1
                    ELSE 0
                END
                FROM public.empresas WHERE id = @IdEmpresa
                """,
                idEmpresa).ConfigureAwait(false);

            var onboardingCompleto = await ScalarLongAsync(
                "SELECT CASE WHEN onboarding_completo THEN 1 ELSE 0 END FROM public.empresas WHERE id = @IdEmpresa",
                idEmpresa).ConfigureAwait(false);

            var etapasTourJson = await _db.QuerySingleOrDefaultAsync<string?>(
                "SELECT onboarding_etapas::text FROM public.empresas WHERE id = @IdEmpresa",
                new { IdEmpresa = idEmpresa }).ConfigureAwait(false);

            Dictionary<string, bool>? etapasTour = null;
            if (!string.IsNullOrWhiteSpace(etapasTourJson))
            {
                try { etapasTour = JsonSerializer.Deserialize<Dictionary<string, bool>>(etapasTourJson); }
                catch { /* ignora JSON inválido */ }
            }

            var etapas = new List<OnboardingEtapaStatus>
            {
                new() { Key = "empresa", Titulo = "Cadastrar minha barbearia", Concluida = empresaReal, Rota = "/minha-barbearia" },
                new() { Key = "servicos", Titulo = "Configurar serviços", Concluida = servicos > 0 && empresaReal, Rota = "/servicos" },
                new() { Key = "profissionais", Titulo = "Cadastrar barbeiros", Concluida = profissionais > 0 && empresaReal, Rota = "/profissionais" },
                new() { Key = "pagamentos", Titulo = "Meios de pagamento", Concluida = (pix > 0 || infinite > 0) && empresaReal, Rota = "/configuracoes/dados-bancarios" },
            };

            var jaCompleto = onboardingCompleto.Equals(1);
            var concluidas = etapas.Count(e => e.Concluida);
            var percentual = jaCompleto
                ? 100
                : etapas.Count == 0 ? 0 : (int)Math.Round(100.0 * concluidas / etapas.Count);

            if (!jaCompleto && concluidas == etapas.Count && empresaReal)
                await MarcarCompletoAsync(idEmpresa).ConfigureAwait(false);

            return new OnboardingStatusDto
            {
                IdEmpresa = idEmpresa,
                OnboardingCompleto = jaCompleto || (concluidas == etapas.Count && empresaReal),
                Percentual = percentual,
                Etapas = etapas,
                EtapasTour = etapasTour
            };
        }

        public async Task MarcarCompletoAsync(long idEmpresa)
        {
            await _db.ExecuteAsync(
                "UPDATE public.empresas SET onboarding_completo = TRUE WHERE id = @IdEmpresa",
                new { IdEmpresa = idEmpresa }).ConfigureAwait(false);
        }

        public async Task AtualizarEtapasJsonAsync(long idEmpresa, string json)
        {
            await _db.ExecuteAsync(
                "UPDATE public.empresas SET onboarding_etapas = @Json::jsonb WHERE id = @IdEmpresa",
                new { IdEmpresa = idEmpresa, Json = json }).ConfigureAwait(false);
        }

        public async Task AutoMarcarCompletoSeElegivelAsync(long idEmpresa)
        {
            var status = await ObterStatusAsync(idEmpresa, 0).ConfigureAwait(false);
            if (status.Percentual >= 100 && status.IdEmpresa > 1)
                await MarcarCompletoAsync(idEmpresa).ConfigureAwait(false);
        }

        private async Task<long> ScalarCountAsync(string sql, long idEmpresa)
        {
            var result = await _db.QuerySingleOrDefaultAsync<long?>(sql, new { IdEmpresa = idEmpresa }).ConfigureAwait(false);
            return result ?? 0;
        }

        private async Task<long> ScalarLongAsync(string sql, long idEmpresa)
        {
            var result = await _db.QuerySingleOrDefaultAsync<long?>(sql, new { IdEmpresa = idEmpresa }).ConfigureAwait(false);
            return result ?? 0;
        }
    }
}
