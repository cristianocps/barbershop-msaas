using BarberShop.Dominio.Entidade.Acessos;
using BarberShop.Dominio.Entidade.DTOs;
using BarberShop.Dominio.Entidade.Reflection.Texto;
using BarberShop.Dominio.Enuns;
using BarberShop.Dominio.Interfaces.Base;
using BarberShop.Dominio.Interfaces.Repositorios.Acessos;
using BarberShop.Infraestrutura.padronizar;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BarberShop.Repositorio.Repositorio.Acessos
{
    public class PerfilRepositorio : IPerfilRepositorio
    {
        private readonly IUser? _accessor;
        private readonly IConfiguration? _configuration;
        private readonly TransferenciaIdentidadeDTO _identidade;
        private readonly IDbConnectionFactory _dbConnectionFactory;

        public PerfilRepositorio(IDbConnectionFactory dbConnectionFactory, IUser? accessor, IConfiguration? configuration, TransferenciaIdentidadeDTO identidade)
        {
            _dbConnectionFactory = dbConnectionFactory;
            _accessor = accessor;
            _configuration = configuration;
            _identidade = identidade;
        }

        public async Task<IEnumerable<DataSelect2DTO>> CarregarComboPerfils(string search, int page, int? length = 10)
        {
            try
            {
                var _query = $@"
                    SELECT 
                        CAST(idrole AS VARCHAR) AS id, 
                        descricao AS text
                    FROM public.perfil
                    WHERE idempresa = {_identidade.IdEmpresaLogado}
                        AND (@Search = '' OR descricao ILIKE '%' || @Search || '%')
                        AND status = 1
                    ORDER BY descricao ASC
                    LIMIT @Limit OFFSET @Offset;
                ";

                var _result = await _dbConnectionFactory.QueryAsync<DataSelect2DTO>(_query, new
                {
                    Search = (search ?? "").Trim().VarcharToSQL(),
                    Offset = ((page <= 0 ? 1 : page) - 1) * (length ?? 10),
                    Limit = length ?? 10
                });

                return _result;
            }
            catch (Exception ex)
            {
                throw new TratamentoExcecao(ex.Message.Traduzir());
            }
        }

        public async Task<RetornoGridPaginado<Perfil>> CarregarGridPerfils(DataTableSearch search, int start, int draw, int? length = 10)
        {
            try
            {
                var _query = $@"
                    WITH TotalCount AS (
                        SELECT COUNT(id) AS RecordsTotal 
                        FROM public.perfil
                        WHERE idempresa = {_identidade.IdEmpresaLogado}
                    ),
                    FilteredData AS (
                        SELECT 
                            id AS ID, idempresa AS IdEmpresa, codigo AS Codigo,
                            idrole AS IdRole, descricao AS Descricao, status AS Status,
                            COUNT(id) OVER() AS RecordsFiltered
                        FROM public.perfil
                        WHERE idempresa = {_identidade.IdEmpresaLogado}
                          AND (@SearchText::text = '' OR descricao ILIKE '%' || @SearchText::text || '%')
                    )
                    SELECT 
                        f.ID, f.IdEmpresa, f.Codigo, f.IdRole, f.Descricao,
                        f.Status, f.RecordsFiltered, t.RecordsTotal
                    FROM FilteredData f
                    CROSS JOIN TotalCount t
                    ORDER BY f.Codigo
                    OFFSET @Start LIMIT @Length;
                ";

                var searchText = (search?.value ?? "").Trim();

                var result = await _dbConnectionFactory.QueryAsync<Perfil>(_query, new { SearchText = searchText, Start = start, Length = length });

                if (!result.Any())
                    return new RetornoGridPaginado<Perfil>().RetornoVazio(draw);

                var _return = new RetornoGridPaginado<Perfil>
                {
                    data = result,
                    draw = draw,
                    recordsTotal = result.FirstOrDefault()?.RecordsTotal ?? 0,
                    recordsFiltered = result.FirstOrDefault()?.RecordsFiltered ?? 0,
                    JsonTypes = IResponseController.ResponseJsonTypes.Success.ToString().ToLower(CultureInfo.CurrentCulture)
                };

                return _return;
            }
            catch (Exception ex)
            {
                throw new TratamentoExcecao(ex.Message.Traduzir());
            }
        }

        public async Task<Perfil> Editar(long idItem)
        {
            try
            {
                var _query = $@"
                    SELECT 
                        p.*,
                        ar.""Name"" AS RoleName
                    FROM public.perfil p
                    LEFT JOIN ""AspNetRoles"" ar ON ar.""Id"" = p.idrole
                    WHERE p.id = @IdItem
                      AND p.idempresa = {_identidade.IdEmpresaLogado}
                ";

                var _result = await _dbConnectionFactory.QuerySingleOrDefaultAsync<Perfil>(_query, new { IdItem = idItem });

                return _result ?? throw new TratamentoExcecao($"Perfil com ID {idItem} não encontrado.");
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