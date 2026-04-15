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
using System.Threading.Tasks;

namespace BarberShop.Repositorio.Repositorio.Configuracoes
{
    public class ClienteRepositorio : IClienteRepositorio
    {
        private readonly IUser? _accessor;
        private readonly IConfiguration? _configuration;
        private readonly TransferenciaIdentidadeDTO _identidade;
        private readonly IDbConnectionFactory _dbConnectionFactory;

        public ClienteRepositorio(IDbConnectionFactory dbConnectionFactory, IUser? accessor, IConfiguration? configuration, TransferenciaIdentidadeDTO identidade)
        {
            _dbConnectionFactory = dbConnectionFactory;
            _accessor = accessor;
            _configuration = configuration;
            _identidade = identidade;
        }

        public async Task<long> AlterarClientes(Cliente dados)
        {
            try
            {
                var _query = "";
                if (dados.ID > 0)
                {
                    _query = $@"
                    UPDATE public.clientes
                    SET 
                        descricao = @Descricao,
                        telefone = @Telefone,
                        endereco = @Endereco,
                        status = @Status
                    WHERE 
                        id = @ID
                        AND idempresa = {_identidade.IdEmpresaLogado}
                    RETURNING id;";
                }
                else
                {
                    _query = $@"
                    INSERT INTO public.clientes ( 
                        idempresa, idusuario, descricao, telefone, endereco, dtcriacao, status
                    ) VALUES (
                        {_identidade.IdEmpresaLogado}, {_identidade.IdUsuarioLogado}, @Descricao, @Telefone, @Endereco, @DtCriacao, 1
                    )
                    RETURNING id;";
                }

                var _result = await _dbConnectionFactory.QuerySingleOrDefaultAsync<long>(_query, dados);
                return _result;
            }
            catch (Exception ex)
            {
                throw new TratamentoExcecao($"Erro ao salvar cliente: {ex.Message.Traduzir()}");
            }
        }

        public async Task<RetornoGridPaginado<Cliente>> CarregarGridClientes(DataTableSearch search, int start, int draw, int? length = 10)
        {
            try
            {
                var _query = $@"
                    WITH TotalCount AS (
                        SELECT COUNT(id) AS RecordsTotal 
                        FROM public.clientes
                        WHERE idempresa = {_identidade.IdEmpresaLogado}
                          AND status = 1
                    ),
                    FilteredData AS (
                        SELECT 
                            id AS ID, idempresa AS IdEmpresa, idusuario AS IdUsuario,
                            descricao AS Descricao, telefone AS Telefone, endereco AS Endereco,
                            dtcriacao AS DtCriacao, status AS Status,
                            COUNT(id) OVER() AS RecordsFiltered
                        FROM public.clientes
                        WHERE idempresa = {_identidade.IdEmpresaLogado}
                          AND status = 1
                          AND (@SearchText::text = ''
                               OR descricao ILIKE '%' || @SearchText::text || '%'
                               OR telefone ILIKE '%' || @SearchText::text || '%')
                    )
                    SELECT 
                        f.*, t.RecordsTotal
                    FROM FilteredData f
                    CROSS JOIN TotalCount t
                    ORDER BY f.ID DESC 
                    OFFSET @Start LIMIT @Length;
                ";

                var searchText = (search?.value ?? "").Trim();
                var result = await _dbConnectionFactory.QueryAsync<Cliente>(_query, new { SearchText = searchText, Start = start, Length = length });

                if (!result.Any())
                    return new RetornoGridPaginado<Cliente>().RetornoVazio(draw);

                return new RetornoGridPaginado<Cliente>
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

        public async Task<Cliente> Editar(long idItem)
        {
            try
            {
                var _query = $@"
                    SELECT 
                        id AS ID, idempresa AS IdEmpresa, idusuario AS IdUsuario,
                        descricao AS Descricao, telefone AS Telefone, endereco AS Endereco,
                        dtcriacao AS DtCriacao, status AS Status
                    FROM public.clientes
                    WHERE id = @IdItem
                      AND idempresa = {_identidade.IdEmpresaLogado}
                ";

                var _result = await _dbConnectionFactory.QuerySingleOrDefaultAsync<Cliente>(_query, new { IdItem = idItem });
                return _result ?? throw new TratamentoExcecao($"Cliente não encontrado.");
            }
            catch (Exception ex)
            {
                throw new TratamentoExcecao(ex.Message.Traduzir());
            }
        }

        public async Task<IEnumerable<DataSelect2DTO>> CarregarComboStatusClientes(string search, int page, int? length = 10)
        {
            try
            {
                var query = $@"
                    SELECT 
                        id AS id, 
                        descricao || ' (' || telefone || ')' AS text 
                    FROM public.clientes
                    WHERE idempresa = {_identidade.IdEmpresaLogado}
                      AND status = 1 
                      AND (@Search = '' OR descricao ILIKE '%' || @Search || '%' OR telefone ILIKE '%' || @Search || '%')
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

        public async Task<long> AlterarStatusCliente(long id, int status)
        {
            try
            {
                var _query = $@"
                    UPDATE public.clientes 
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

        public void Dispose()
        {
            _dbConnectionFactory?.Dispose();
            GC.SuppressFinalize(this);
        }
    }
}
