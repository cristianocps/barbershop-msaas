using BarberShop.Dominio.Entidade.Configuracoes;
using BarberShop.Dominio.Entidade.DTOs;
using BarberShop.Dominio.Entidade.Reflection.Texto;
using BarberShop.Dominio.Enuns;
using BarberShop.Dominio.Interfaces.Base;
using BarberShop.Dominio.Interfaces.Repositorios.Configuracoes;
using BarberShop.Infraestrutura.padronizar;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BarberShop.Repositorio.Repositorio.Configuracoes
{
    public class ServicosRepositorio : IServicoRepositorio
    {
        private readonly IUser? _accessor;
        private readonly IConfiguration? _configuration;
        private readonly TransferenciaIdentidadeDTO _identidade;
        private readonly IDbConnectionFactory _dbConnectionFactory;

        public ServicosRepositorio(IDbConnectionFactory dbConnectionFactory, IUser? accessor, IConfiguration? configuration, TransferenciaIdentidadeDTO identidade)
        {
            _dbConnectionFactory = dbConnectionFactory;
            _accessor = accessor;
            _configuration = configuration;
            _identidade = identidade;
        }

        public async Task<long> AlterarServicos(Servico dados)
        {
            try
            {
                var _query = "";
                if (dados.ID > 0)
                {
                    _query = $@"
                    UPDATE public.servicos
                    SET 
                        idusuario = {_identidade.IdUsuarioLogado},
                        idempresa = @IdEmpresa,
                        descricao = @Descricao,
                        unidade = @Unidade,
                        valor_unitario = @ValorUnitario,
                        duracao_minutos = @DuracaoMinutos,
                        status = @Status
                    WHERE 
                        id = @ID
                    RETURNING id;";
                }
                else
                {
                    _query = $@"
                    INSERT INTO public.servicos ( 
                        idempresa, idusuario, descricao, unidade, valor_unitario, duracao_minutos, dtcriacao, status
                    ) VALUES (
                        @IdEmpresa, 
                        {_identidade.IdUsuarioLogado}, 
                        @Descricao, @Unidade, @ValorUnitario, @DuracaoMinutos, @DtCriacao, 1
                    )
                    RETURNING id;";
                }

                // Garantindo que se o front não mandou IdEmpresa, usa o logado
                if (dados.IdEmpresa <= 0) dados.IdEmpresa = _identidade.IdEmpresaLogado ?? 0;
                if (dados.DuracaoMinutos <= 0) dados.DuracaoMinutos = 30;

                var _result = await _dbConnectionFactory.QuerySingleOrDefaultAsync<long>(_query, dados);

                return await Task.FromResult(_result).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                throw new TratamentoExcecao($"Erro ao salvar o serviço: {ex.Message.Traduzir()}");
            }
        }

        public async Task<long> AlterarStatusServicos(long id, int status)
        {
            try
            {
                var _query = $@"
                    UPDATE public.servicos 
                    SET status = @Status 
                    WHERE id = @Id AND idempresa = {_identidade.IdEmpresaLogado}";

                var _result = await _dbConnectionFactory.ExecuteAsync(_query, new { Id = id, Status = status });
                return await Task.FromResult(_result).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                throw new TratamentoExcecao(ex.Message.Traduzir());
            }
        }

        public async Task<IEnumerable<DataSelect2DTO>> CarregarComboServicos(string search, int page, int? length = 10)
        {
            try
            {
                var query = $@"
                    SELECT 
                        id AS id, 
                        descricao AS text 
                    FROM public.servicos
                    WHERE idempresa = {_identidade.IdEmpresaLogado}
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

        public async Task<RetornoGridPaginado<Servico>> CarregarGridServicos(DataTableSearch search, int start, int draw, int? length = 10)
        {
            try
            {
                var _query = $@"
                    WITH TotalCount AS (
                        SELECT COUNT(id) AS RecordsTotal 
                        FROM public.servicos
                        WHERE idempresa = {_identidade.IdEmpresaLogado}
                    ),
                    FilteredData AS (
                        SELECT 
                            id AS ID, idempresa AS IdEmpresa, idusuario AS IdUsuario,
                            descricao AS Descricao, unidade AS Unidade, valor_unitario AS ValorUnitario,
                            duracao_minutos AS DuracaoMinutos,
                            dtcriacao AS DtCriacao, status AS Status,
                            COUNT(id) OVER() AS RecordsFiltered
                        FROM public.servicos
                        WHERE idempresa = {_identidade.IdEmpresaLogado}
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
                var result = await _dbConnectionFactory.QueryAsync<Servico>(_query, new { SearchText = searchText, Start = start, Length = length });

                if (!result.Any())
                    return new RetornoGridPaginado<Servico>().RetornoVazio(draw);

                var _result = new RetornoGridPaginado<Servico>
                {
                    data = result,
                    draw = draw,
                    recordsTotal = result.FirstOrDefault()?.RecordsTotal ?? 0,
                    recordsFiltered = result.FirstOrDefault()?.RecordsFiltered ?? 0,
                    JsonTypes = IResponseController.ResponseJsonTypes.Success.ToString().ToLower(CultureInfo.CurrentCulture)
                };

                return await Task.FromResult(_result).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                throw new TratamentoExcecao(ex.Message.Traduzir());
            }
        }

        public async Task<Servico> Editar(long idItem)
        {
            try
            {
                var _query = $@"
                    SELECT 
                        id AS ID, idempresa AS IdEmpresa, idusuario AS IdUsuario,
                        descricao AS Descricao, unidade AS Unidade, valor_unitario AS ValorUnitario,
                        duracao_minutos AS DuracaoMinutos,
                        dtcriacao AS DtCriacao, status AS Status
                    FROM public.servicos
                    WHERE id = @IdItem
                      AND idempresa = {_identidade.IdEmpresaLogado}
                ";

                var _result = await _dbConnectionFactory.QuerySingleOrDefaultAsync<Servico>(_query, new { IdItem = idItem });
                return _result ?? throw new TratamentoExcecao($"Serviço com ID {idItem} não encontrado.");
            }
            catch (Exception ex)
            {
                throw new TratamentoExcecao(ex.Message.Traduzir());
            }
        }

        public void Dispose()
        {
            _dbConnectionFactory?.Dispose();
            GC.SuppressFinalize(this);
        }
    }
}