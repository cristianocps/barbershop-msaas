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
using System.Threading.Tasks;

namespace BarberShop.Repositorio.Repositorio.Configuracoes
{
    public class ProfissionalRepositorio : IProfissionalRepositorio
    {
        private readonly IUser? _accessor;
        private readonly IConfiguration? _configuration;
        private readonly TransferenciaIdentidadeDTO _identidade;
        private readonly IDbConnectionFactory _dbConnectionFactory;

        public ProfissionalRepositorio(IDbConnectionFactory dbConnectionFactory, IUser? accessor, IConfiguration? configuration, TransferenciaIdentidadeDTO identidade)
        {
            _dbConnectionFactory = dbConnectionFactory;
            _accessor = accessor;
            _configuration = configuration;
            _identidade = identidade;
        }

        public async Task<long> AlterarProfissional(Profissional dados)
        {
            try
            {
                var _query = "";
                
                // Se o frontend enviou um IdEmpresa válido (ex: Admin alterando), usamos ele. 
                // Caso contrário, mantemos o da identidade logada.
                long idEmpresaFinal = dados.IdEmpresa > 0 ? dados.IdEmpresa : _identidade.IdEmpresaLogado.GetValueOrDefault();

                if (dados.ID > 0)
                {
                    _query = $@"
                    UPDATE public.profissionais
                    SET 
                        idempresa = {idEmpresaFinal},
                        descricao = @Descricao,
                        telefone = @Telefone,
                        cor_agenda = @CorAgenda,
                        status = @Status
                    WHERE 
                        id = @ID
                        AND (idusuario = {_identidade.IdUsuarioLogado} OR idempresa = {_identidade.IdEmpresaLogado})
                    RETURNING id;";
                }
                else
                {
                    _query = $@"
                    INSERT INTO public.profissionais ( 
                        idempresa, idusuario, descricao, telefone, cor_agenda, dtcriacao, status
                    ) VALUES (
                        {idEmpresaFinal}, {_identidade.IdUsuarioLogado}, @Descricao, @Telefone, @CorAgenda, @DtCriacao, 1
                    )
                    RETURNING id;";
                }

                var _result = await _dbConnectionFactory.QuerySingleOrDefaultAsync<long>(_query, dados);

                return await Task.FromResult(_result).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                throw new TratamentoExcecao($"Erro ao salvar o profissional: {ex.Message.Traduzir()}");
            }
        }

        public async Task<long> AlterarStatusProfissional(long id, int status)
        {
            try
            {
                var _query = $@"
                    UPDATE public.profissionais 
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

        public async Task<IEnumerable<DataSelect2DTO>> CarregarComboProfissionais(string search, int page, int? length = 10)
        {
            try
            {
                var query = $@"
                    SELECT 
                        id AS id, 
                        descricao AS text 
                    FROM public.profissionais
                    WHERE (idusuario = {_identidade.IdUsuarioLogado} OR idempresa = {_identidade.IdEmpresaLogado})
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

        public async Task<RetornoGridPaginado<Profissional>> CarregarGridProfissionais(DataTableSearch search, int start, int draw, int? length = 10)
        {
            try
            {
                var _query = $@"
                    WITH TotalCount AS (
                        SELECT COUNT(id) AS RecordsTotal 
                        FROM public.profissionais
                        WHERE (idusuario = {_identidade.IdUsuarioLogado} OR idempresa = {_identidade.IdEmpresaLogado})
                    ),
                    FilteredData AS (
                        SELECT 
                            id AS ID, idempresa AS IdEmpresa, idusuario AS IdUsuario,
                            descricao AS Descricao, telefone AS Telefone, cor_agenda AS CorAgenda, 
                            dtcriacao AS DtCriacao, status AS Status,
                            COUNT(id) OVER() AS RecordsFiltered
                        FROM public.profissionais
                        WHERE (idusuario = {_identidade.IdUsuarioLogado} OR idempresa = {_identidade.IdEmpresaLogado})
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
                var result = await _dbConnectionFactory.QueryAsync<Profissional>(_query, new { SearchText = searchText, Start = start, Length = length });

                if (!result.Any())
                    return new RetornoGridPaginado<Profissional>().RetornoVazio(draw);

                var _result = new RetornoGridPaginado<Profissional>
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

        public async Task<Profissional> Editar(long idItem)
        {
            try
            {
                var _query = $@"
                    SELECT 
                        id AS ID, idempresa AS IdEmpresa, idusuario AS IdUsuario,
                        descricao AS Descricao, telefone AS Telefone, cor_agenda AS CorAgenda,
                        dtcriacao AS DtCriacao, status AS Status
                    FROM public.profissionais
                    WHERE id = @IdItem
                      AND (idusuario = {_identidade.IdUsuarioLogado} OR idempresa = {_identidade.IdEmpresaLogado})
                ";

                var _result = await _dbConnectionFactory.QuerySingleOrDefaultAsync<Profissional>(_query, new { IdItem = idItem });
                return _result ?? throw new TratamentoExcecao($"Profissional com ID {idItem} não encontrado.");
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