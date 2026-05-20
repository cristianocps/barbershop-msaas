using BarberShop.Dominio.Entidade.DTOs;
using BarberShop.Dominio.Entidade.Plataforma;
using BarberShop.Dominio.Entidade.Plataforma.DTOs;
using BarberShop.Dominio.Enuns;
using BarberShop.Dominio.Helpers;
using BarberShop.Dominio.Interfaces.Base;
using BarberShop.Dominio.Interfaces.Repositorios.Plataforma;
using BarberShop.Dominio.Entidade.Reflection.Texto;

namespace BarberShop.Repositorio.Repositorio.Plataforma
{
    public class PlataformaAssinaturaRepositorio : IPlataformaAssinaturaRepositorio
    {
        private readonly IDbConnectionFactory _db;
        private readonly TransferenciaIdentidadeDTO _identidade;

        public PlataformaAssinaturaRepositorio(IDbConnectionFactory db, TransferenciaIdentidadeDTO identidade)
        {
            _db = db;
            _identidade = identidade;
        }

        public async Task CriarAssinaturaInicialAsync(long idEmpresa, int trialDias, int valorMensalCentavos)
        {
            await _db.ExecuteAsync(@"
                INSERT INTO public.empresa_assinaturas (idempresa, status, trial_ends_at, valor_mensal_centavos)
                VALUES (@IdEmpresa, @Status, @TrialEndsAt, @Valor)
                ON CONFLICT (idempresa) DO NOTHING;",
                new
                {
                    IdEmpresa = idEmpresa,
                    Status = StatusAssinaturaPlataforma.Trial,
                    TrialEndsAt = DateTime.UtcNow.AddDays(trialDias),
                    Valor = valorMensalCentavos
                }).ConfigureAwait(false);
        }

        public async Task<EmpresaAssinatura?> ObterPorEmpresaAsync(long idEmpresa)
        {
            return await _db.QuerySingleOrDefaultAsync<EmpresaAssinatura>(@"
                SELECT idempresa AS IdEmpresa, status AS Status, trial_ends_at AS TrialEndsAt,
                       periodo_inicio AS PeriodoInicio, periodo_fim AS PeriodoFim,
                       valor_mensal_centavos AS ValorMensalCentavos, dtultimopagamento AS DtUltimoPagamento,
                       dtatualizacao AS DtAtualizacao
                FROM public.empresa_assinaturas WHERE idempresa = @IdEmpresa;",
                new { IdEmpresa = idEmpresa }).ConfigureAwait(false);
        }

        public async Task<AssinaturaStatusDTO> ObterStatusAsync(long idEmpresa)
        {
            await AtualizarStatusComputadoAsync(idEmpresa).ConfigureAwait(false);
            var a = await ObterPorEmpresaAsync(idEmpresa).ConfigureAwait(false);
            if (a == null)
                throw new TratamentoExcecao("Assinatura da plataforma não encontrada para esta barbearia.");

            var bloqueado = await EstaBloqueadaInternaAsync(a).ConfigureAwait(false);
            var dias = CalcularDiasRestantes(a, bloqueado);

            return new AssinaturaStatusDTO
            {
                IdEmpresa = idEmpresa,
                Status = a.Status,
                Bloqueado = bloqueado,
                DiasRestantes = dias,
                TrialEndsAt = a.TrialEndsAt,
                PeriodoFim = a.PeriodoFim,
                ValorMensalCentavos = a.ValorMensalCentavos,
                DtUltimoPagamento = a.DtUltimoPagamento,
                Mensagem = bloqueado
                    ? "Pagamento da plataforma em atraso. Regularize para continuar usando o sistema."
                    : null
            };
        }

        public async Task<bool> EstaBloqueadaAsync(long idEmpresa)
        {
            var a = await ObterPorEmpresaAsync(idEmpresa).ConfigureAwait(false);
            if (a == null) return true;
            await AtualizarStatusComputadoAsync(idEmpresa).ConfigureAwait(false);
            a = await ObterPorEmpresaAsync(idEmpresa).ConfigureAwait(false);
            return await EstaBloqueadaInternaAsync(a!).ConfigureAwait(false);
        }

        private static Task<bool> EstaBloqueadaInternaAsync(EmpresaAssinatura a)
        {
            var now = DateTime.UtcNow;
            if (a.Status == StatusAssinaturaPlataforma.Blocked)
                return Task.FromResult(true);
            if (a.Status == StatusAssinaturaPlataforma.Active && a.PeriodoFim.HasValue && a.PeriodoFim.Value > now)
                return Task.FromResult(false);
            if (a.Status == StatusAssinaturaPlataforma.Trial && a.TrialEndsAt > now)
                return Task.FromResult(false);
            return Task.FromResult(true);
        }

        private static int CalcularDiasRestantes(EmpresaAssinatura a, bool bloqueado)
        {
            if (bloqueado) return 0;
            var now = DateTime.UtcNow;
            if (a.Status == StatusAssinaturaPlataforma.Trial)
                return Math.Max(0, (int)Math.Ceiling((a.TrialEndsAt - now).TotalDays));
            if (a.PeriodoFim.HasValue)
                return Math.Max(0, (int)Math.Ceiling((a.PeriodoFim.Value - now).TotalDays));
            return 0;
        }

        public async Task AtualizarStatusComputadoAsync(long idEmpresa)
        {
            var a = await ObterPorEmpresaAsync(idEmpresa).ConfigureAwait(false);
            if (a == null) return;

            var now = DateTime.UtcNow;
            string novoStatus;

            if (a.Status == StatusAssinaturaPlataforma.Blocked)
                return;

            if (a.Status == StatusAssinaturaPlataforma.Active)
            {
                if (a.PeriodoFim.HasValue && a.PeriodoFim.Value <= now)
                    novoStatus = StatusAssinaturaPlataforma.Overdue;
                else
                    return;
            }
            else if (a.Status == StatusAssinaturaPlataforma.Trial)
            {
                if (a.TrialEndsAt <= now)
                    novoStatus = StatusAssinaturaPlataforma.Overdue;
                else
                    return;
            }
            else if (a.Status == StatusAssinaturaPlataforma.Overdue)
                return;
            else
                return;

            await _db.ExecuteAsync(@"
                UPDATE public.empresa_assinaturas SET status = @Status, dtatualizacao = NOW()
                WHERE idempresa = @IdEmpresa;",
                new { IdEmpresa = idEmpresa, Status = novoStatus }).ConfigureAwait(false);
        }

        public async Task ConfirmarPagamentoAsync(long idEmpresa, long idCobranca, string? transactionNsu, int paidAmountCents)
        {
            await _db.ExecuteAsync(@"
                UPDATE public.plataforma_cobrancas
                SET gateway_status = @Paid, gateway_transaction_nsu = @TransactionNsu,
                    dtpagamento = NOW(), valor_centavos = @Valor
                WHERE id = @Id AND idempresa = @IdEmpresa;",
                new
                {
                    Paid = StatusPagamentoGateway.Paid,
                    TransactionNsu = transactionNsu,
                    Valor = paidAmountCents,
                    Id = idCobranca,
                    IdEmpresa = idEmpresa
                }).ConfigureAwait(false);

            var a = await ObterPorEmpresaAsync(idEmpresa).ConfigureAwait(false);
            var inicio = DateTime.UtcNow;
            var fim = inicio.AddDays(30);
            if (a?.PeriodoFim.HasValue == true && a.PeriodoFim.Value > inicio)
            {
                inicio = a.PeriodoFim.Value;
                fim = inicio.AddDays(30);
            }

            await _db.ExecuteAsync(@"
                UPDATE public.empresa_assinaturas
                SET status = @Active, periodo_inicio = @Inicio, periodo_fim = @Fim,
                    dtultimopagamento = NOW(), dtatualizacao = NOW()
                WHERE idempresa = @IdEmpresa;",
                new
                {
                    Active = StatusAssinaturaPlataforma.Active,
                    Inicio = inicio,
                    Fim = fim,
                    IdEmpresa = idEmpresa
                }).ConfigureAwait(false);
        }

        public async Task SalvarUrlCobrancaAsync(long idCobranca, string url)
        {
            await _db.ExecuteAsync(@"
                UPDATE public.plataforma_cobrancas SET gateway_link_url = @Url WHERE id = @Id;",
                new { Url = url, Id = idCobranca }).ConfigureAwait(false);
        }

        public async Task<(long IdCobranca, string OrderNsu, int ValorCentavos)> CriarCobrancaPendenteAsync(long idEmpresa, int valorCentavos)
        {
            var referencia = DateTime.UtcNow.ToString("yyyy-MM");
            var id = await _db.QuerySingleOrDefaultAsync<long>(@"
                INSERT INTO public.plataforma_cobrancas (idempresa, referencia, order_nsu, valor_centavos, gateway_status)
                VALUES (@IdEmpresa, @Ref, 'pending', @Valor, @Pending)
                RETURNING id;",
                new
                {
                    IdEmpresa = idEmpresa,
                    Ref = referencia,
                    Valor = valorCentavos,
                    Pending = StatusPagamentoGateway.Pending
                }).ConfigureAwait(false);

            var orderNsu = PedidoPlataformaNsu.Gerar(idEmpresa, id);
            await _db.ExecuteAsync(@"
                UPDATE public.plataforma_cobrancas SET order_nsu = @OrderNsu WHERE id = @Id;",
                new { OrderNsu = orderNsu, Id = id }).ConfigureAwait(false);

            return (id, orderNsu, valorCentavos);
        }

        public async Task<IReadOnlyList<PlataformaEmpresaResumoDTO>> ListarEmpresasAsync(string? filtroStatus = null)
        {
            var where = string.IsNullOrWhiteSpace(filtroStatus) ? "" : " AND a.status = @Status ";
            var rows = await _db.QueryAsync<PlataformaEmpresaResumoDTO>($@"
                SELECT e.id AS IdEmpresa, e.descricao AS Descricao, e.slug AS Slug,
                       a.status AS Status, a.trial_ends_at AS TrialEndsAt, a.periodo_fim AS PeriodoFim,
                       a.dtultimopagamento AS DtUltimoPagamento, a.valor_mensal_centavos AS ValorMensalCentavos
                FROM public.empresas e
                INNER JOIN public.empresa_assinaturas a ON a.idempresa = e.id
                WHERE 1=1 {where}
                ORDER BY e.descricao;",
                string.IsNullOrWhiteSpace(filtroStatus) ? null : new { Status = filtroStatus }).ConfigureAwait(false);

            var list = rows.ToList();
            foreach (var item in list)
            {
                var a = await ObterPorEmpresaAsync(item.IdEmpresa).ConfigureAwait(false);
                if (a != null)
                {
                    item.Bloqueado = await EstaBloqueadaInternaAsync(a).ConfigureAwait(false);
                    item.DiasRestantes = CalcularDiasRestantes(a, item.Bloqueado);
                }
            }
            return list;
        }

        public async Task<IReadOnlyList<PlataformaCobranca>> ListarCobrancasAsync(long idEmpresa)
        {
            var rows = await _db.QueryAsync<PlataformaCobranca>(@"
                SELECT id AS Id, idempresa AS IdEmpresa, referencia AS Referencia, order_nsu AS OrderNsu,
                       gateway_link_url AS GatewayLinkUrl, gateway_status AS GatewayStatus,
                       gateway_transaction_nsu AS GatewayTransactionNsu, valor_centavos AS ValorCentavos,
                       dtcriacao AS DtCriacao, dtpagamento AS DtPagamento
                FROM public.plataforma_cobrancas
                WHERE idempresa = @IdEmpresa
                ORDER BY dtcriacao DESC;",
                new { IdEmpresa = idEmpresa }).ConfigureAwait(false);
            return rows.ToList();
        }

        public async Task AplicarOverrideAsync(long idEmpresa, PlataformaAssinaturaOverrideDTO dados)
        {
            var sets = new List<string>();
            var param = new Dictionary<string, object?> { ["IdEmpresa"] = idEmpresa };

            if (!string.IsNullOrWhiteSpace(dados.Status))
            {
                sets.Add("status = @Status");
                param["Status"] = dados.Status;
            }
            if (dados.TrialEndsAt.HasValue)
            {
                sets.Add("trial_ends_at = @TrialEndsAt");
                param["TrialEndsAt"] = dados.TrialEndsAt.Value;
            }
            if (dados.PeriodoFim.HasValue)
            {
                sets.Add("periodo_fim = @PeriodoFim");
                param["PeriodoFim"] = dados.PeriodoFim.Value;
                if (dados.Status == null || dados.Status == StatusAssinaturaPlataforma.Active)
                {
                    sets.Add("periodo_inicio = COALESCE(periodo_inicio, NOW())");
                    sets.Add("status = @ActiveStatus");
                    param["ActiveStatus"] = StatusAssinaturaPlataforma.Active;
                }
            }
            if (dados.ValorMensalCentavos.HasValue)
            {
                sets.Add("valor_mensal_centavos = @Valor");
                param["Valor"] = dados.ValorMensalCentavos.Value;
            }

            if (sets.Count == 0)
                throw new TratamentoExcecao("Nenhum campo informado para atualização.");

            sets.Add("dtatualizacao = NOW()");
            var sql = $"UPDATE public.empresa_assinaturas SET {string.Join(", ", sets)} WHERE idempresa = @IdEmpresa;";
            await _db.ExecuteAsync(sql, param).ConfigureAwait(false);
        }

        public async Task<long?> ResolverIdEmpresaPorSlugAsync(string slug)
        {
            return await _db.QuerySingleOrDefaultAsync<long?>(@"
                SELECT id FROM public.empresas WHERE LOWER(slug) = LOWER(@Slug) AND status = 1 LIMIT 1;",
                new { Slug = slug.Trim() }).ConfigureAwait(false);
        }

        public async Task<long?> ResolverIdEmpresaPorEmailAsync(string email)
        {
            return await _db.QuerySingleOrDefaultAsync<long?>(@"
                SELECT idempresa FROM public.usuarios WHERE LOWER(email) = LOWER(@Email) LIMIT 1;",
                new { Email = email.Trim() }).ConfigureAwait(false);
        }

        public async Task<long?> ResolverIdEmpresaPorProfissionalAsync(long idProfissional)
        {
            return await _db.QuerySingleOrDefaultAsync<long?>(@"
                SELECT idempresa FROM public.profissionais WHERE id = @Id LIMIT 1;",
                new { Id = idProfissional }).ConfigureAwait(false);
        }

        public void Dispose() => GC.SuppressFinalize(this);
    }
}
