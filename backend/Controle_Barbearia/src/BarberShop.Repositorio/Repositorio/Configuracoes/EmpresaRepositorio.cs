using BarberShop.Dominio.Entidade.Acessos;
using BarberShop.Dominio.Entidade.Configuracoes;
using BarberShop.Dominio.Entidade.DTOs;
using BarberShop.Dominio.Entidade.Reflection.Texto;
using BarberShop.Dominio.Enuns;
using BarberShop.Dominio.Interfaces.Base;
using BarberShop.Dominio.Interfaces.Repositorios.Configuracoes;
using BarberShop.Dominio.Interfaces.Repositorios.Plataforma;
using BarberShop.Infraestrutura.Pagamentos;
using BarberShop.Infraestrutura.padronizar;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BarberShop.Repositorio.Repositorio.Configuracoes
{
    public class EmpresaRepositorio : IEmpresaRepositorio
    {
        private readonly IUser? _accessor;
        private readonly IConfiguration? _configuration;
        private readonly TransferenciaIdentidadeDTO _identidade;
        private readonly IDbConnectionFactory _dbConnectionFactory;
        private readonly IPlataformaAssinaturaRepositorio? _assinaturaRepositorio;
        private readonly PlataformaBillingSettings? _plataformaBilling;

        public EmpresaRepositorio(
            IDbConnectionFactory dbConnectionFactory,
            IUser? accessor,
            IConfiguration? configuration,
            TransferenciaIdentidadeDTO identidade,
            IPlataformaAssinaturaRepositorio? assinaturaRepositorio = null,
            IOptions<PlataformaBillingSettings>? plataformaBilling = null)
        {
            _dbConnectionFactory = dbConnectionFactory;
            _accessor = accessor;
            _configuration = configuration;
            _identidade = identidade;
            _assinaturaRepositorio = assinaturaRepositorio;
            _plataformaBilling = plataformaBilling?.Value;
        }

        public async Task<long> AlterarEmpresas(Empresa dados)
        {
            try
            {
                var _query = "";

                if (dados.ID > 0)
                {
                    _query = $@"
                        UPDATE public.empresas
                        SET 
                            descricao = @Descricao,
                            cidade = @Cidade,
                            telefone = @Telefone,
                            endereco = @Endereco,
                            logo_data = @LogoData,
                            status = @Status,
                            slug = @Slug,
                            infinitepay_handle = @InfinitepayHandle,
                            infinitepay_webhook_secret = COALESCE(@InfinitepayWebhookSecret, infinitepay_webhook_secret),
                            horarios_config = @HorariosConfig::jsonb
                        WHERE 
                            id = @ID
                            AND idusuario = {_identidade.IdUsuarioLogado}
                        RETURNING id::bigint;";
                }
                else
                {
                    _query = $@"
                        INSERT INTO public.empresas ( 
                            idusuario, descricao, dtcriacao, status, cidade, telefone, endereco, logo_data, slug,
                            infinitepay_handle, infinitepay_webhook_secret, horarios_config
                        ) VALUES (
                            {_identidade.IdUsuarioLogado}, @Descricao, @DtCriacao, 1, @Cidade, @Telefone, @Endereco, @LogoData, @Slug,
                            @InfinitepayHandle, @InfinitepayWebhookSecret, @HorariosConfig::jsonb
                        )
                        RETURNING id::bigint;";
                }

                var _result = await _dbConnectionFactory.QuerySingleOrDefaultAsync<long>(_query, dados);

                if (dados.ID == 0 && _result > 0)
                {
                    await EmpresaConfiguracaoPadrao.AplicarAsync(
                        _dbConnectionFactory,
                        _result,
                        _identidade.IdUsuarioLogado ?? 0).ConfigureAwait(false);

                    if (_assinaturaRepositorio != null)
                    {
                        var trialDias = _plataformaBilling?.TrialDias ?? 14;
                        var valor = _plataformaBilling?.MensalidadeCentavos ?? 9900;
                        await _assinaturaRepositorio.CriarAssinaturaInicialAsync(_result, trialDias, valor).ConfigureAwait(false);
                    }
                }

                // Se for um novo cadastro, vincula o usuário criador à nova empresa automaticamente
                // ✅ Aplicado apenas se o usuário estiver na empresa de demonstração (ID 1)
                if (dados.ID == 0 && _result > 0 && (_identidade.IdUsuarioLogado ?? 0) > 0)
                {
                    var _updateUserQuery = $@"
                        UPDATE public.usuarios 
                        SET idempresa = {_result} 
                        WHERE id = {_identidade.IdUsuarioLogado} 
                          AND idempresa = 1";
                    await _dbConnectionFactory.ExecuteAsync(_updateUserQuery, null).ConfigureAwait(false);
                }

                return await Task.FromResult(_result).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                throw new TratamentoExcecao($"Erro ao salvar a empresa: {ex.Message.Traduzir()}");
            }
        }

        public async Task<RetornoGridPaginado<Empresa>> CarregarGridEmpresas(DataTableSearch search, int start, int draw, int? length = 10)
        {
            try
            {
                var _query = $@"
                    WITH TotalCount AS (
                        SELECT COUNT(id) AS RecordsTotal 
                        FROM public.empresas
                        WHERE (idusuario = {_identidade.IdUsuarioLogado} OR id = {_identidade.IdEmpresaLogado})
                    ),
                    FilteredData AS (
                        SELECT 
                            id AS ID, idusuario AS IdUsuario,
                            descricao AS Descricao, dtcriacao AS DtCriacao, status AS Status,
                            cidade AS Cidade, telefone AS Telefone, endereco AS Endereco, logo_data AS LogoData, slug AS Slug,
                            COUNT(id) OVER() AS RecordsFiltered
                        FROM public.empresas
                        WHERE (idusuario = {_identidade.IdUsuarioLogado} OR id = {_identidade.IdEmpresaLogado})
                          AND (@SearchText::text = ''
                               OR descricao ILIKE '%' || @SearchText::text || '%')
                    )
                    SELECT 
                        f.*, t.RecordsTotal
                    FROM FilteredData f
                    CROSS JOIN TotalCount t
                    ORDER BY f.ID DESC 
                    OFFSET @Start LIMIT @Length;
                ";

                var searchText = (search?.value ?? "").Trim();
                var result = await _dbConnectionFactory.QueryAsync<Empresa>(_query, new { SearchText = searchText, Start = start, Length = length });

                if (!result.Any())
                    return new RetornoGridPaginado<Empresa>().RetornoVazio(draw);

                return new RetornoGridPaginado<Empresa>
                {
                    data = result,
                    draw = draw,
                    recordsTotal = result.FirstOrDefault()?.RecordsTotal ?? 0,
                    recordsFiltered = result.FirstOrDefault()?.RecordsFiltered ?? 0,
                    JsonTypes = IResponseController.ResponseJsonTypes.Success.ToString().ToLower(CultureInfo.CurrentCulture)
                };
            }
            catch (Exception ex)
            {
                throw new TratamentoExcecao(ex.Message.Traduzir());
            }
        }

        public async Task<Empresa> Editar(long idItem)
        {
            try
            {
                var _query = $@"
                    SELECT 
                        id AS ID, idusuario AS IdUsuario,
                        descricao AS Descricao, dtcriacao AS DtCriacao, status AS Status,
                        cidade AS Cidade, telefone AS Telefone, endereco AS Endereco, logo_data AS LogoData, slug AS Slug,
                        infinitepay_handle AS InfinitepayHandle, infinitepay_webhook_secret AS InfinitepayWebhookSecret,
                        horarios_config AS HorariosConfig
                    FROM public.empresas
                    WHERE id = @IdItem
                      AND (idusuario = {_identidade.IdUsuarioLogado} OR id = {_identidade.IdEmpresaLogado})
                ";

                var _result = await _dbConnectionFactory.QuerySingleOrDefaultAsync<Empresa>(_query, new { IdItem = idItem });
                return _result ?? throw new TratamentoExcecao($"Empresa com ID {idItem} não encontrada.");
            }
            catch (Exception ex)
            {
                throw new TratamentoExcecao(ex.Message.Traduzir());
            }
        }

        public async Task<IEnumerable<DataSelect2DTO>> CarregarComboStatusEmpresas(string search, int page, int? length = 10)
        {
            try
            {
                var query = $@"
                    SELECT 
                        id AS id, 
                        descricao AS text 
                    FROM public.empresas
                    WHERE (idusuario = {_identidade.IdUsuarioLogado} OR id = {_identidade.IdEmpresaLogado})
                      AND status = 1 
                      AND (@Search = '' OR descricao ILIKE '%' || @Search || '%')
                    ORDER BY descricao ASC
                    OFFSET @Offset LIMIT @Limit;
                ";

                var _result = await _dbConnectionFactory.QueryAsync<DataSelect2DTO>(query, new
                {
                    Search = (search ?? "").Trim().VarcharToSQL(),
                    Offset = ((page <= 0 ? 1 : page) - 1) * (length ?? 10),
                    Limit = length ?? 10
                });

                return await Task.FromResult(_result).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                throw new TratamentoExcecao(ex.Message.Traduzir());
            }
        }

        public async Task<long> AlterarStatusEmpresa(long id, int status)
        {
            try
            {
                var _query = $@"
                    UPDATE public.empresas 
                    SET status = @Status 
                    WHERE id = @Id AND (idusuario = {_identidade.IdUsuarioLogado} OR id = {_identidade.IdEmpresaLogado})";

                var _result = await _dbConnectionFactory.ExecuteAsync(_query, new { Id = id, Status = status });
                return await Task.FromResult(_result).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                throw new TratamentoExcecao(ex.Message.Traduzir());
            }
        }

        public async Task<EmpresaInfinitePayConfigDTO?> ObterInfinitePayConfigAsync(long idEmpresa)
        {
            var sql = $@"
                SELECT
                    id AS IdEmpresa,
                    descricao AS DescricaoEmpresa,
                    COALESCE(infinitepay_handle, '') AS Handle,
                    COALESCE(infinitepay_webhook_secret, '') AS WebhookSecret
                FROM public.empresas
                WHERE id = @IdEmpresa
                  AND (idusuario = {_identidade.IdUsuarioLogado} OR id = {_identidade.IdEmpresaLogado});";

            var config = await _dbConnectionFactory.QuerySingleOrDefaultAsync<EmpresaInfinitePayConfigDTO>(sql, new { IdEmpresa = idEmpresa })
                .ConfigureAwait(false);

            if (config == null)
                return null;

            if (string.IsNullOrWhiteSpace(config.WebhookSecret) && !string.IsNullOrWhiteSpace(config.Handle))
                config.WebhookSecret = await RegenerarInfinitePayWebhookSecretAsync(idEmpresa).ConfigureAwait(false);

            return config;
        }

        public async Task SalvarInfinitePayConfigAsync(long idEmpresa, string handle)
        {
            var handleTrim = (handle ?? "").Trim();
            if (string.IsNullOrWhiteSpace(handleTrim))
                throw new TratamentoExcecao("Informe o Infinite Tag (handle) da loja.");

            var sql = $@"
                UPDATE public.empresas
                SET infinitepay_handle = @Handle
                WHERE id = @IdEmpresa
                  AND (idusuario = {_identidade.IdUsuarioLogado} OR id = {_identidade.IdEmpresaLogado});";

            var rows = await _dbConnectionFactory.ExecuteAsync(sql, new
            {
                IdEmpresa = idEmpresa,
                Handle = handleTrim,
            }).ConfigureAwait(false);

            if (rows == 0)
                throw new TratamentoExcecao("Empresa não encontrada ou sem permissão.");

            await GarantirWebhookSecretAsync(idEmpresa).ConfigureAwait(false);
        }

        public async Task<string> RegenerarInfinitePayWebhookSecretAsync(long idEmpresa)
        {
            var secret = GerarWebhookSecret();
            await AtualizarWebhookSecretAsync(idEmpresa, secret).ConfigureAwait(false);
            return secret;
        }

        private async Task GarantirWebhookSecretAsync(long idEmpresa)
        {
            var sql = $@"
                SELECT COALESCE(infinitepay_webhook_secret, '') AS Secret
                FROM public.empresas
                WHERE id = @IdEmpresa
                  AND (idusuario = {_identidade.IdUsuarioLogado} OR id = {_identidade.IdEmpresaLogado});";

            var atual = await _dbConnectionFactory.QuerySingleOrDefaultAsync<string>(sql, new { IdEmpresa = idEmpresa })
                .ConfigureAwait(false);

            if (!string.IsNullOrWhiteSpace(atual))
                return;

            await AtualizarWebhookSecretAsync(idEmpresa, GerarWebhookSecret()).ConfigureAwait(false);
        }

        private async Task AtualizarWebhookSecretAsync(long idEmpresa, string secret)
        {
            var sql = $@"
                UPDATE public.empresas
                SET infinitepay_webhook_secret = @WebhookSecret
                WHERE id = @IdEmpresa
                  AND (idusuario = {_identidade.IdUsuarioLogado} OR id = {_identidade.IdEmpresaLogado});";

            var rows = await _dbConnectionFactory.ExecuteAsync(sql, new
            {
                IdEmpresa = idEmpresa,
                WebhookSecret = secret,
            }).ConfigureAwait(false);

            if (rows == 0)
                throw new TratamentoExcecao("Empresa não encontrada ou sem permissão.");
        }

        private static string GerarWebhookSecret()
        {
            var bytes = new byte[32];
            System.Security.Cryptography.RandomNumberGenerator.Fill(bytes);
            return Convert.ToBase64String(bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_');
        }

        public void Dispose()
        {
            _dbConnectionFactory?.Dispose();
            GC.SuppressFinalize(this);
        }
    }
}