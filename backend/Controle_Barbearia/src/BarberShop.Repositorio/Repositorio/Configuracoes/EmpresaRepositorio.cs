using BarberShop.Dominio.Entidade.Acessos;
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
    public class EmpresaRepositorio : IEmpresaRepositorio
    {
        private readonly IUser? _accessor;
        private readonly IConfiguration? _configuration;
        private readonly TransferenciaIdentidadeDTO _identidade;
        private readonly IDbConnectionFactory _dbConnectionFactory;

        public EmpresaRepositorio(IDbConnectionFactory dbConnectionFactory, IUser? accessor, IConfiguration? configuration, TransferenciaIdentidadeDTO identidade)
        {
            _dbConnectionFactory = dbConnectionFactory;
            _accessor = accessor;
            _configuration = configuration;
            _identidade = identidade;
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
                            logo_data = @LogoData, -- Removido o ::text
                            status = @Status,
                            slug = @Slug
                        WHERE 
                            id = @ID
                            AND idusuario = {_identidade.IdUsuarioLogado}
                        RETURNING id::bigint;";
                }
                else
                {
                    _query = $@"
                        INSERT INTO public.empresas ( 
                            idusuario, descricao, dtcriacao, status, cidade, telefone, endereco, logo_data, slug
                        ) VALUES (
                            {_identidade.IdUsuarioLogado}, @Descricao, @DtCriacao, 1, @Cidade, @Telefone, @Endereco, @LogoData, @Slug
                        )
                        RETURNING id::bigint;";
                }

                var _result = await _dbConnectionFactory.QuerySingleOrDefaultAsync<long>(_query, dados);

                // Se for um novo cadastro, vincula o usuário criador à nova empresa automaticamente
                // ✅ Aplicado apenas se o usuário estiver na empresa 'Teste' (ID 1) e for do perfil 'Profissional'
                if (dados.ID == 0 && _result > 0 && (_identidade.IdUsuarioLogado ?? 0) > 0)
                {
                    var _updateUserQuery = $@"
                        UPDATE public.usuarios 
                        SET idempresa = {_result} 
                        WHERE id = {_identidade.IdUsuarioLogado} 
                          AND idempresa = 1 
                          AND idclains IN (
                              SELECT aur.""UserId"" 
                              FROM ""AspNetUserRoles"" aur 
                              JOIN ""AspNetRoles"" ar ON ar.""Id"" = aur.""RoleId"" 
                              WHERE ar.""NormalizedName"" = 'PROFISSIONAL'
                          )";
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
                        cidade AS Cidade, telefone AS Telefone, endereco AS Endereco, logo_data AS LogoData, slug AS Slug
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

        public void Dispose()
        {
            _dbConnectionFactory?.Dispose();
            GC.SuppressFinalize(this);
        }
    }
}