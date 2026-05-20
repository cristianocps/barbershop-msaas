using BarberShop.Dominio.Entidade.Acessos;
using BarberShop.Dominio.Entidade.DTOs;
using BarberShop.Dominio.Enuns;
using BarberShop.Dominio.Interfaces.Base;
using BarberShop.Dominio.Interfaces.Repositorios.Agendamentos;
using BarberShop.Infraestrutura.padronizar;
using Microsoft.Extensions.Configuration;

namespace BarberShop.Repositorio.Repositorio.Agendamentos
{
    public class FinanceiroRepositorio : IFinanceiroRepositorio
    {
        private readonly TransferenciaIdentidadeDTO _identidade;
        private readonly IDbConnectionFactory _dbConnectionFactory;

        public FinanceiroRepositorio(IDbConnectionFactory dbConnectionFactory, IConfiguration? configuration, TransferenciaIdentidadeDTO identidade)
        {
            _dbConnectionFactory = dbConnectionFactory;
            _identidade = identidade;
        }

        public async Task<FinanceiroResumoDTO> ObterResumoAsync(DateTime inicio, DateTime fim, long? idProfissional = null, int? tipoPagamento = null)
        {
            var filtroProf = idProfissional.HasValue && idProfissional > 0
                ? " AND a.idprofissional = @IdProfissional " : "";
            var filtroTipo = tipoPagamento.HasValue && tipoPagamento > 0
                ? " AND p.tipo_pagamento = @TipoPagamento " : "";

            var sql = $@"
                SELECT
                    COALESCE(SUM(p.valor), 0) AS TotalRecebido,
                    COALESCE(SUM(CASE WHEN p.tipo_pagamento IN (1,2) THEN p.valor ELSE 0 END), 0) AS TotalPix,
                    COALESCE(SUM(CASE WHEN p.tipo_pagamento IN (3,4,6) THEN p.valor ELSE 0 END), 0) AS TotalCartao,
                    COALESCE(SUM(CASE WHEN p.tipo_pagamento = 5 THEN p.valor ELSE 0 END), 0) AS TotalDinheiro,
                    COALESCE(SUM(CASE WHEN p.gateway LIKE 'infinitepay%' THEN p.valor ELSE 0 END), 0) AS TotalInfinite,
                    COUNT(*) AS QuantidadeLancamentos
                FROM public.agendamento_pagamentos p
                INNER JOIN public.agendamentos a ON a.id = p.idagendamento
                WHERE p.idempresa = {_identidade.IdEmpresaLogado}
                  AND p.gateway_status = '{StatusPagamentoGateway.Paid}'
                  AND p.dtconfirmacao >= @Inicio AND p.dtconfirmacao < @Fim
                  AND a.status = {(int)AgendamentoStatus.Concluido}
                  {filtroProf}{filtroTipo};";

            return await _dbConnectionFactory.QuerySingleOrDefaultAsync<FinanceiroResumoDTO>(sql, new
            {
                Inicio = inicio,
                Fim = fim,
                IdProfissional = idProfissional,
                TipoPagamento = tipoPagamento
            }).ConfigureAwait(false) ?? new FinanceiroResumoDTO();
        }

        public async Task<IEnumerable<FinanceiroLancamentoDTO>> ObterLancamentosAsync(DateTime inicio, DateTime fim, long? idProfissional = null, int? tipoPagamento = null)
        {
            var filtroProf = idProfissional.HasValue && idProfissional > 0
                ? " AND a.idprofissional = @IdProfissional " : "";
            var filtroTipo = tipoPagamento.HasValue && tipoPagamento > 0
                ? " AND p.tipo_pagamento = @TipoPagamento " : "";

            var sql = $@"
                SELECT
                    p.id AS IdPagamento,
                    a.id AS IdAgendamento,
                    a.descricao AS Descricao,
                    COALESCE(pr.descricao, '') AS NomeProfissional,
                    a.dtagendamento AS DtAgendamento,
                    p.dtconfirmacao AS DtConfirmacaoPagamento,
                    p.tipo_pagamento AS TipoPagamento,
                    p.gateway AS Gateway,
                    p.valor AS Valor,
                    p.parcelas AS Parcelas
                FROM public.agendamento_pagamentos p
                INNER JOIN public.agendamentos a ON a.id = p.idagendamento
                LEFT JOIN public.profissionais pr ON pr.id = a.idprofissional
                WHERE p.idempresa = {_identidade.IdEmpresaLogado}
                  AND p.gateway_status = '{StatusPagamentoGateway.Paid}'
                  AND p.dtconfirmacao >= @Inicio AND p.dtconfirmacao < @Fim
                  AND a.status = {(int)AgendamentoStatus.Concluido}
                  {filtroProf}{filtroTipo}
                ORDER BY p.dtconfirmacao DESC;";

            return await _dbConnectionFactory.QueryAsync<FinanceiroLancamentoDTO>(sql, new
            {
                Inicio = inicio,
                Fim = fim,
                IdProfissional = idProfissional,
                TipoPagamento = tipoPagamento
            }).ConfigureAwait(false);
        }

        public void Dispose()
        {
            _dbConnectionFactory?.Dispose();
            GC.SuppressFinalize(this);
        }
    }
}
