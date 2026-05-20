using BarberShop.Dominio.Entidade.Agendamentos;
using BarberShop.Dominio.Entidade.DTOs;
using BarberShop.Dominio.Entidade.Reflection.Texto;
using BarberShop.Dominio.Enuns;
using BarberShop.Dominio.Helpers;
using BarberShop.Infraestrutura.Pagamentos;
using Microsoft.Extensions.Configuration;
using System.Globalization;

namespace BarberShop.Repositorio.Repositorio.Agendamentos
{
    public partial class AgendamentosRepositorio
    {
        private async Task<(long Id, int Status)> ObterStatusAgendamentoAsync(long id)
        {
            var sql = $@"
                SELECT id, status FROM public.agendamentos
                WHERE id = @Id AND idempresa = {_identidade.IdEmpresaLogado};";
            var row = await _dbConnectionFactory.QuerySingleOrDefaultAsync<(long Id, int Status)>(sql, new { Id = id })
                .ConfigureAwait(false);
            if (row.Id == 0)
                throw new TratamentoExcecao("Agendamento não encontrado.");
            return row;
        }

        private async Task<decimal> ObterValorTotalAsync(long idAgendamento)
        {
            var sql = $@"
                SELECT COALESCE(SUM(valor_cobrado), 0)
                FROM public.agendamento_itens
                WHERE idagendamento = @Id AND idempresa = {_identidade.IdEmpresaLogado};";
            return await _dbConnectionFactory.QuerySingleOrDefaultAsync<decimal>(sql, new { Id = idAgendamento })
                .ConfigureAwait(false);
        }

        public async Task ConfirmarAgendamentoAsync(long id)
        {
            var apt = await ObterStatusAgendamentoAsync(id).ConfigureAwait(false);
            if (apt.Status != (int)AgendamentoStatus.Pendente)
                throw new TratamentoExcecao("Somente agendamentos pendentes podem ser confirmados.");

            var sql = $@"
                UPDATE public.agendamentos
                SET status = {(int)AgendamentoStatus.Agendado}, dt_confirmacao = NOW()
                WHERE id = @Id AND idempresa = {_identidade.IdEmpresaLogado};";
            await _dbConnectionFactory.ExecuteAsync(sql, new { Id = id }).ConfigureAwait(false);
        }

        public async Task CancelarAgendamentoAsync(long id, string? motivo)
        {
            var apt = await ObterStatusAgendamentoAsync(id).ConfigureAwait(false);
            if (apt.Status != (int)AgendamentoStatus.Pendente && apt.Status != (int)AgendamentoStatus.Agendado)
                throw new TratamentoExcecao("Este agendamento não pode ser cancelado.");

            var sql = $@"
                UPDATE public.agendamentos
                SET status = {(int)AgendamentoStatus.Cancelado},
                    motivo_cancelamento = @Motivo,
                    dt_cancelamento = NOW()
                WHERE id = @Id AND idempresa = {_identidade.IdEmpresaLogado};";
            await _dbConnectionFactory.ExecuteAsync(sql, new { Id = id, Motivo = motivo }).ConfigureAwait(false);

            await _dbConnectionFactory.ExecuteAsync($@"
                UPDATE public.agendamento_pagamentos
                SET gateway_status = '{StatusPagamentoGateway.Cancelled}'
                WHERE idagendamento = @Id AND idempresa = {_identidade.IdEmpresaLogado}
                  AND gateway_status = '{StatusPagamentoGateway.Pending}';", new { Id = id }).ConfigureAwait(false);
        }

        public async Task ConcluirAgendamentoAsync(long id, ConcluirAgendamentoDTO dados)
        {
            var apt = await ObterStatusAgendamentoAsync(id).ConfigureAwait(false);
            if (apt.Status != (int)AgendamentoStatus.Pendente && apt.Status != (int)AgendamentoStatus.Agendado)
                throw new TratamentoExcecao("Somente agendamentos pendentes ou agendados podem ser concluídos.");

            var valor = dados.Valor ?? await ObterValorTotalAsync(id).ConfigureAwait(false);
            if (valor <= 0)
                throw new TratamentoExcecao("Valor do agendamento inválido.");

            var gateway = "manual";
            if (dados.TipoPagamento == (int)TipoPagamento.InfiniteTap)
                gateway = "infinitepay_tap";
            else if (dados.TipoPagamento == (int)TipoPagamento.PixInfinite)
                gateway = "infinitepay_link";

            var insertPag = $@"
                INSERT INTO public.agendamento_pagamentos (
                    idempresa, idagendamento, tipo_pagamento, valor, parcelas, gateway,
                    gateway_order_nsu, gateway_status, comprovante_url, observacao, dtconfirmacao
                ) VALUES (
                    {_identidade.IdEmpresaLogado}, @IdAgendamento, @TipoPagamento, @Valor, @Parcelas, @Gateway,
                    @OrderNsu, '{StatusPagamentoGateway.Paid}', @Comprovante, @Observacao, NOW()
                );";

            await _dbConnectionFactory.ExecuteAsync(insertPag, new
            {
                IdAgendamento = id,
                dados.TipoPagamento,
                Valor = valor,
                dados.Parcelas,
                Gateway = gateway,
                OrderNsu = PedidoPagamentoNsu.Gerar(IdEmpresaAtual(), id),
                Comprovante = dados.ComprovanteUrl,
                Observacao = dados.Observacao
            }).ConfigureAwait(false);

            if (!string.IsNullOrWhiteSpace(dados.ComprovanteUrl))
            {
                await _dbConnectionFactory.ExecuteAsync($@"
                    UPDATE public.agendamentos SET comprovante_pix = @Comprovante
                    WHERE id = @Id AND idempresa = {_identidade.IdEmpresaLogado};",
                    new { Id = id, Comprovante = dados.ComprovanteUrl }).ConfigureAwait(false);
            }

            await _dbConnectionFactory.ExecuteAsync($@"
                UPDATE public.agendamentos
                SET status = {(int)AgendamentoStatus.Concluido}, dt_conclusao = NOW()
                WHERE id = @Id AND idempresa = {_identidade.IdEmpresaLogado};",
                new { Id = id }).ConfigureAwait(false);
        }

        public async Task<(long IdPagamento, string OrderNsu, decimal Valor, string Descricao, string Handle)> PrepararPagamentoInfiniteLinkAsync(long idAgendamento)
        {
            var apt = await ObterStatusAgendamentoAsync(idAgendamento).ConfigureAwait(false);
            if (apt.Status != (int)AgendamentoStatus.Pendente && apt.Status != (int)AgendamentoStatus.Agendado)
                throw new TratamentoExcecao("Agendamento não está em status válido para pagamento.");

            var valor = await ObterValorTotalAsync(idAgendamento).ConfigureAwait(false);
            if (valor <= 0)
                throw new TratamentoExcecao("Valor do agendamento inválido.");

            var descSql = $@"
                SELECT descricao FROM public.agendamentos
                WHERE id = @Id AND idempresa = {_identidade.IdEmpresaLogado};";
            var descricao = await _dbConnectionFactory.QuerySingleOrDefaultAsync<string>(descSql, new { Id = idAgendamento })
                .ConfigureAwait(false) ?? "Agendamento";

            var orderNsu = PedidoPagamentoNsu.Gerar(IdEmpresaAtual(), idAgendamento);

            var idPag = await _dbConnectionFactory.QuerySingleOrDefaultAsync<long>($@"
                INSERT INTO public.agendamento_pagamentos (
                    idempresa, idagendamento, tipo_pagamento, valor, gateway,
                    gateway_order_nsu, gateway_status
                ) VALUES (
                    {_identidade.IdEmpresaLogado}, @IdAgendamento, {(int)TipoPagamento.PixInfinite}, @Valor,
                    'infinitepay_link', @OrderNsu, '{StatusPagamentoGateway.Pending}'
                )
                RETURNING id;",
                new { IdAgendamento = idAgendamento, Valor = valor, OrderNsu = orderNsu }).ConfigureAwait(false);

            var handle = await ObterInfinitePayHandleAsync(idAgendamento).ConfigureAwait(false);
            return (idPag, orderNsu, valor, descricao, handle);
        }

        public async Task SalvarUrlPagamentoLinkAsync(long idPagamento, string url)
        {
            await _dbConnectionFactory.ExecuteAsync($@"
                UPDATE public.agendamento_pagamentos
                SET gateway_link_url = @Url
                WHERE id = @Id AND idempresa = {_identidade.IdEmpresaLogado};",
                new { Id = idPagamento, Url = url }).ConfigureAwait(false);
        }

        public async Task<TapUrlRetornoDTO> ObterTapUrlAsync(long idAgendamento, string metodo, int parcelas)
        {
            var apt = await ObterStatusAgendamentoAsync(idAgendamento).ConfigureAwait(false);
            if (apt.Status != (int)AgendamentoStatus.Pendente && apt.Status != (int)AgendamentoStatus.Agendado)
                throw new TratamentoExcecao("Agendamento não está em status válido para pagamento.");

            var valor = await ObterValorTotalAsync(idAgendamento).ConfigureAwait(false);
            var centavos = (int)Math.Round(valor * 100, MidpointRounding.AwayFromZero);
            if (centavos < 100)
                centavos = 100;

            var settings = _configuration?.GetSection(InfinitePaySettings.SectionName).Get<InfinitePaySettings>()
                ?? new InfinitePaySettings();
            var handle = await ObterInfinitePayHandleAsync(idAgendamento).ConfigureAwait(false);

            parcelas = Math.Clamp(parcelas <= 0 ? 1 : parcelas, 1, 12);
            var paymentMethod = (metodo ?? "credit").ToLowerInvariant() == "debit" ? "debit" : "credit";
            var orderId = PedidoPagamentoNsu.Gerar(IdEmpresaAtual(), idAgendamento);
            var resultUrl = $"{settings.TapResultUrlBase.TrimEnd('/')}?order_id={Uri.EscapeDataString(orderId)}";

            var qs = string.Join("&", new[]
            {
                $"amount={centavos}",
                $"payment_method={paymentMethod}",
                $"installments={parcelas}",
                $"order_id={Uri.EscapeDataString(orderId)}",
                $"result_url={Uri.EscapeDataString(resultUrl)}",
                $"app_client_referrer={Uri.EscapeDataString(settings.AppClientReferrer)}",
                $"handle={Uri.EscapeDataString(handle)}",
                "af_force_deeplink=true"
            });

            var tapUrl = $"infinitepaydash://infinitetap-app?{qs}";

            return new TapUrlRetornoDTO { TapUrl = tapUrl, GatewayOrderNsu = orderId };
        }

        public async Task ProcessarTapCallbackAsync(TapCallbackDTO dados)
        {
            if (!string.IsNullOrWhiteSpace(dados.Warning))
                throw new TratamentoExcecao($"Pagamento Tap não concluído: {dados.Warning}");

            var ctx = await ResolverContextoPagamentoAsync(dados.OrderId).ConfigureAwait(false);
            if (ctx.StatusAgendamento == (int)AgendamentoStatus.Concluido)
                return;

            var idAgendamento = ctx.IdAgendamento;
            var idEmpresa = ctx.IdEmpresa;
            var valor = await ObterValorTotalPorEmpresaAsync(idAgendamento, idEmpresa).ConfigureAwait(false);
            var tipo = dados.TipoPagamento == (int)TipoPagamento.CartaoDebito
                ? (int)TipoPagamento.CartaoDebito
                : (int)TipoPagamento.InfiniteTap;

            await _dbConnectionFactory.ExecuteAsync($@"
                INSERT INTO public.agendamento_pagamentos (
                    idempresa, idagendamento, tipo_pagamento, valor, parcelas, gateway,
                    gateway_order_nsu, gateway_transaction_nsu, gateway_status, observacao, dtconfirmacao
                ) VALUES (
                    @IdEmpresa, @IdAgendamento, @Tipo, @Valor, @Parcelas, 'infinitepay_tap',
                    @OrderId, @Nsu, '{StatusPagamentoGateway.Paid}', @Obs, NOW()
                );",
                new
                {
                    IdEmpresa = idEmpresa,
                    IdAgendamento = idAgendamento,
                    Tipo = tipo,
                    Valor = valor,
                    dados.Parcelas,
                    OrderId = dados.OrderId,
                    Nsu = dados.Nsu,
                    Obs = $"Tap {dados.CardBrand} aut={dados.Aut}"
                }).ConfigureAwait(false);

            await _dbConnectionFactory.ExecuteAsync($@"
                UPDATE public.agendamentos
                SET status = {(int)AgendamentoStatus.Concluido}, dt_conclusao = NOW()
                WHERE id = @Id AND idempresa = @IdEmpresa;",
                new { Id = idAgendamento, IdEmpresa = idEmpresa }).ConfigureAwait(false);
        }

        public async Task ProcessarWebhookInfinitePayAsync(string orderNsu, string? transactionNsu, string? captureMethod, int paidAmountCents, string? receiptUrl, string? webhookSecretHeader = null)
        {
            var ctx = await ResolverContextoPagamentoAsync(orderNsu).ConfigureAwait(false);

            if (!string.IsNullOrWhiteSpace(ctx.WebhookSecretEmpresa)
                && !string.Equals(ctx.WebhookSecretEmpresa.Trim(), webhookSecretHeader?.Trim(), StringComparison.Ordinal))
                throw new TratamentoExcecao("Webhook Infinite Pay: segredo inválido para esta empresa.");

            var tipo = (captureMethod ?? "").ToLowerInvariant() switch
            {
                "credit_card" => (int)TipoPagamento.CartaoCredito,
                "pix" => (int)TipoPagamento.PixInfinite,
                _ => (int)TipoPagamento.PixInfinite
            };

            var rows = await _dbConnectionFactory.ExecuteAsync($@"
                UPDATE public.agendamento_pagamentos
                SET gateway_status = '{StatusPagamentoGateway.Paid}',
                    gateway_transaction_nsu = @TransactionNsu,
                    tipo_pagamento = @Tipo,
                    comprovante_url = COALESCE(@Receipt, comprovante_url),
                    valor = @Valor,
                    dtconfirmacao = NOW()
                WHERE idagendamento = @IdAgendamento
                  AND idempresa = @IdEmpresa
                  AND gateway_order_nsu = @OrderNsu;",
                new
                {
                    ctx.IdAgendamento,
                    ctx.IdEmpresa,
                    OrderNsu = orderNsu,
                    TransactionNsu = transactionNsu,
                    Tipo = tipo,
                    Receipt = receiptUrl,
                    Valor = paidAmountCents / 100m
                }).ConfigureAwait(false);

            if (rows == 0)
            {
                await _dbConnectionFactory.ExecuteAsync($@"
                    INSERT INTO public.agendamento_pagamentos (
                        idempresa, idagendamento, tipo_pagamento, valor, gateway,
                        gateway_order_nsu, gateway_transaction_nsu, gateway_status,
                        comprovante_url, dtconfirmacao
                    ) VALUES (
                        @IdEmpresa, @IdAgendamento, @Tipo, @Valor, 'infinitepay_link',
                        @OrderNsu, @TransactionNsu, '{StatusPagamentoGateway.Paid}',
                        @Receipt, NOW()
                    );",
                    new
                    {
                        ctx.IdEmpresa,
                        ctx.IdAgendamento,
                        Tipo = tipo,
                        Valor = paidAmountCents / 100m,
                        OrderNsu = orderNsu,
                        TransactionNsu = transactionNsu,
                        Receipt = receiptUrl
                    }).ConfigureAwait(false);
            }

            if (ctx.StatusAgendamento == (int)AgendamentoStatus.Pendente || ctx.StatusAgendamento == (int)AgendamentoStatus.Agendado)
            {
                await _dbConnectionFactory.ExecuteAsync($@"
                    UPDATE public.agendamentos
                    SET status = {(int)AgendamentoStatus.Concluido}, dt_conclusao = NOW()
                    WHERE id = @Id AND idempresa = @IdEmpresa;",
                    new { Id = ctx.IdAgendamento, IdEmpresa = ctx.IdEmpresa }).ConfigureAwait(false);
            }
        }

        public async Task<AgendamentoPagamento?> ObterPagamentoPorAgendamentoAsync(long idAgendamento)
        {
            var sql = $@"
                SELECT id AS ID, idempresa AS IdEmpresa, idagendamento AS IdAgendamento,
                       tipo_pagamento AS TipoPagamento, valor AS Valor, parcelas AS Parcelas,
                       gateway AS Gateway, gateway_order_nsu AS GatewayOrderNsu,
                       gateway_transaction_nsu AS GatewayTransactionNsu,
                       gateway_link_url AS GatewayLinkUrl, gateway_status AS GatewayStatus,
                       comprovante_url AS ComprovanteUrl, observacao AS Observacao,
                       dtcriacao AS DtCriacao, dtconfirmacao AS DtConfirmacao
                FROM public.agendamento_pagamentos
                WHERE idagendamento = @Id AND idempresa = {_identidade.IdEmpresaLogado}
                ORDER BY id DESC LIMIT 1;";
            return await _dbConnectionFactory.QuerySingleOrDefaultAsync<AgendamentoPagamento>(sql, new { Id = idAgendamento })
                .ConfigureAwait(false);
        }

        private long IdEmpresaAtual()
        {
            var id = _identidade.IdEmpresaLogado ?? 0;
            if (id <= 0)
                throw new TratamentoExcecao("Empresa não identificada na sessão.");
            return id;
        }

        private async Task<string> ObterInfinitePayHandleAsync(long idAgendamento)
        {
            var sql = $@"
                SELECT COALESCE(NULLIF(TRIM(e.infinitepay_handle), ''), '')
                FROM public.agendamentos a
                INNER JOIN public.empresas e ON e.id = a.idempresa
                WHERE a.id = @Id AND a.idempresa = {_identidade.IdEmpresaLogado};";

            var handle = await _dbConnectionFactory.QuerySingleOrDefaultAsync<string>(sql, new { Id = idAgendamento })
                .ConfigureAwait(false);

            if (string.IsNullOrWhiteSpace(handle))
            {
                var fallback = _configuration?.GetSection(InfinitePaySettings.SectionName).Get<InfinitePaySettings>()?.Handle;
                if (!string.IsNullOrWhiteSpace(fallback))
                    return fallback.Trim();
                throw new TratamentoExcecao("Configure o Infinite Tag (handle) em Configurações → Infinite Pay.");
            }

            return handle.Trim();
        }

        private async Task<decimal> ObterValorTotalPorEmpresaAsync(long idAgendamento, long idEmpresa)
        {
            var sql = @"
                SELECT COALESCE(SUM(valor_cobrado), 0)
                FROM public.agendamento_itens
                WHERE idagendamento = @Id AND idempresa = @IdEmpresa;";
            return await _dbConnectionFactory.QuerySingleOrDefaultAsync<decimal>(sql, new { Id = idAgendamento, IdEmpresa = idEmpresa })
                .ConfigureAwait(false);
        }

        private sealed class PagamentoContexto
        {
            public long IdEmpresa { get; init; }
            public long IdAgendamento { get; init; }
            public int StatusAgendamento { get; init; }
            public string? WebhookSecretEmpresa { get; init; }
        }

        private async Task<PagamentoContexto> ResolverContextoPagamentoAsync(string orderNsu)
        {
            var byPayment = await _dbConnectionFactory.QuerySingleOrDefaultAsync<PagamentoContexto>($@"
                SELECT
                    p.idempresa AS IdEmpresa,
                    p.idagendamento AS IdAgendamento,
                    a.status AS StatusAgendamento,
                    e.infinitepay_webhook_secret AS WebhookSecretEmpresa
                FROM public.agendamento_pagamentos p
                INNER JOIN public.agendamentos a ON a.id = p.idagendamento AND a.idempresa = p.idempresa
                INNER JOIN public.empresas e ON e.id = p.idempresa
                WHERE p.gateway_order_nsu = @OrderNsu
                LIMIT 1;",
                new { OrderNsu = orderNsu }).ConfigureAwait(false);

            if (byPayment != null && byPayment.IdAgendamento > 0)
                return byPayment;

            var (idEmpresaParsed, idAgendamento) = PedidoPagamentoNsu.Parse(orderNsu);

            long idEmpresa = idEmpresaParsed;
            if (idEmpresa <= 0)
            {
                idEmpresa = await _dbConnectionFactory.QuerySingleOrDefaultAsync<long>($@"
                    SELECT idempresa FROM public.agendamentos WHERE id = @Id LIMIT 1;",
                    new { Id = idAgendamento }).ConfigureAwait(false);
            }

            if (idEmpresa <= 0 || idAgendamento <= 0)
                throw new TratamentoExcecao("Pagamento não encontrado para este pedido.");

            var byAgendamento = await _dbConnectionFactory.QuerySingleOrDefaultAsync<PagamentoContexto>($@"
                SELECT
                    a.idempresa AS IdEmpresa,
                    a.id AS IdAgendamento,
                    a.status AS StatusAgendamento,
                    e.infinitepay_webhook_secret AS WebhookSecretEmpresa
                FROM public.agendamentos a
                INNER JOIN public.empresas e ON e.id = a.idempresa
                WHERE a.id = @IdAgendamento AND a.idempresa = @IdEmpresa
                LIMIT 1;",
                new { IdAgendamento = idAgendamento, IdEmpresa = idEmpresa }).ConfigureAwait(false);

            if (byAgendamento == null)
                throw new TratamentoExcecao("Agendamento não encontrado para o pagamento.");

            return byAgendamento;
        }
    }
}
