using BarberShop.Dominio.Entidade.Basico;
using BarberShop.Dominio.Entidade.Configuracoes;
using BarberShop.Dominio.Entidade.DTOs;
using BarberShop.Dominio.Entidade.Reflection.Texto;
using BarberShop.Dominio.Enuns;
using BarberShop.Dominio.Interfaces.Base;
using BarberShop.Dominio.Interfaces.Repositorios.Basico;
using BarberShop.Infraestrutura.padronizar;
using BarberShop.Infraestrutura.Seguranca;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BarberShop.Repositorio.Repositorio.Basico
{
    public class DadosBancariosRepositorio : IDadosBancariosRepositorio
    {
        private readonly IUser? _accessor;
        private readonly IConfiguration? _configuration;
        private readonly TransferenciaIdentidadeDTO _identidade;
        private readonly IDbConnectionFactory _dbConnectionFactory;

        public DadosBancariosRepositorio(IDbConnectionFactory dbConnectionFactory, IUser? accessor, IConfiguration? configuration, TransferenciaIdentidadeDTO identidade)
        {
            _dbConnectionFactory = dbConnectionFactory;
            _accessor = accessor;
            _configuration = configuration;
            _identidade = identidade;
        }

        public async Task<long> AlterarDadosBancarios(DadosBancarios dados)
        {
            try
            {
                // Criptografa a chave PIX antes de salvar
                var clearChave = dados.Descricao;
                dados.Descricao = TratamentosCriptografia.Criptografar(dados.Descricao, dados.SenhaConfirmacao);
                dados.ChaveVitrine = clearChave;

                var _query = "";
                if (dados.ID > 0)
                {
                    _query = $@"
                      UPDATE public.dadosbancarios
                      SET 
                          idusuario = {_identidade.IdUsuarioLogado},
                          idtipochavepix = @IdTipoChavePix,
                          descricao = @Descricao,
                          chave_vitrine = @ChaveVitrine,
                          status = @Status
                      WHERE 
                          id = @ID 
                          AND idempresa = {_identidade.IdEmpresaLogado}
                      RETURNING id;";
                }
                else
                {
                    _query = $@"
                      INSERT INTO public.dadosbancarios ( 
                          idempresa, idusuario, idtipochavepix, descricao, chave_vitrine, dtcriacao, status
                      ) VALUES (
                          {_identidade.IdEmpresaLogado}, {_identidade.IdUsuarioLogado}, @IdTipoChavePix, @Descricao, @ChaveVitrine, @DtCriacao, @Status
                      )
                      RETURNING id;";
                }

                var _result = await _dbConnectionFactory.QuerySingleOrDefaultAsync<long>(_query, dados);

                return await Task.FromResult(_result).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                throw new TratamentoExcecao($"Erro ao salvar os dados bancários: {ex.Message.Traduzir()}");
            }
        }

        public async Task<long> AlterarTipoChavePix(TipoChave dados)
        {
            try
            {
                var _query = "";
                if (dados.ID > 0)
                {
                    _query = $@"
                      UPDATE public.tipochave
                      SET 
                          idusuario = @IdUsuario,
                          descricao = @Descricao,
                          status = @Status
                      WHERE 
                          id = @ID 
                          AND idempresa = {_identidade.IdEmpresaLogado}
                      RETURNING id;";
                }
                else
                {
                    _query = $@"
                      INSERT INTO public.tipochave ( 
                          idempresa, idusuario, descricao, dtcriacao, status
                      ) VALUES (
                          {_identidade.IdEmpresaLogado}, {_identidade.IdUsuarioLogado}, @Descricao, @DtCriacao, @Status
                      )
                      RETURNING id;";
                }

                var _result = await _dbConnectionFactory.QuerySingleOrDefaultAsync<long>(_query, dados);

                return await Task.FromResult(_result).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                throw new TratamentoExcecao($"Erro ao salvar o tipo de chave PIX: {ex.Message.Traduzir()}");
            }
        }

        public async Task<long> AlterarStatusDadosBancarios(long id, int status)
        {
            try
            {
                var _query = $@"
                    UPDATE public.dadosbancarios 
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

        public async Task<long> AlterarStatusTipoChavePix(long id, int status)
        {
            try
            {
                var _query = $@"
                    UPDATE public.tipochave 
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

        public async Task<IEnumerable<DataSelect2DTO>> CarregarComboTipoChavePix(string search, int page, int? length = 10)
        {
            try
            {
                var query = $@"
                      SELECT 
                          id AS id, 
                          descricao AS text 
                      FROM public.tipochave
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

        public async Task<RetornoGridPaginado<DadosBancarios>> CarregarGridDadosBancarios(DataTableSearch search, int start, int draw, int? length = 10)
        {
            try
            {
                // Corrigido para a tabela dadosbancarios e incluído idtipochavepix
                var _query = $@"
                    WITH TotalCount AS (
                        SELECT COUNT(id) AS RecordsTotal 
                        FROM public.dadosbancarios
                        WHERE idempresa = {_identidade.IdEmpresaLogado}
                          AND idusuario = {_identidade.IdUsuarioLogado}
                    ),
                    FilteredData AS (
                        SELECT 
                            id AS ID, idempresa AS IdEmpresa, idusuario AS IdUsuario, idtipochavepix AS IdTipoChavePix,
                            descricao AS Descricao, 
                            dtcriacao AS DtCriacao, status AS Status,
                            COUNT(id) OVER() AS RecordsFiltered
                        FROM public.dadosbancarios
                        WHERE idempresa = {_identidade.IdEmpresaLogado}
                          AND idusuario = {_identidade.IdUsuarioLogado}
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
                var result = await _dbConnectionFactory.QueryAsync<DadosBancarios>(_query, new { SearchText = searchText, Start = start, Length = length });

                if (!result.Any())
                    return new RetornoGridPaginado<DadosBancarios>().RetornoVazio(draw);

                var _result = new RetornoGridPaginado<DadosBancarios>
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

        public async Task<RetornoGridPaginado<TipoChave>> CarregarGridTipoChave(DataTableSearch search, int start, int draw, int? length = 10)
        {
            try
            {
                // Corrigido para a tabela tipochave
                var _query = $@"
                    WITH TotalCount AS (
                        SELECT COUNT(id) AS RecordsTotal 
                        FROM public.tipochave
                        WHERE idempresa = {_identidade.IdEmpresaLogado}
                    ),
                    FilteredData AS (
                        SELECT 
                            id AS ID, idempresa AS IdEmpresa, idusuario AS IdUsuario,
                            descricao AS Descricao, 
                            dtcriacao AS DtCriacao, status AS Status,
                            COUNT(id) OVER() AS RecordsFiltered
                        FROM public.tipochave
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
                var result = await _dbConnectionFactory.QueryAsync<TipoChave>(_query, new { SearchText = searchText, Start = start, Length = length });

                if (!result.Any())
                    return new RetornoGridPaginado<TipoChave>().RetornoVazio(draw);

                var _result = new RetornoGridPaginado<TipoChave>
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

        public async Task<DadosBancarios> Editar(long idItem)
        {
            try
            {
                // Corrigido para apontar para dadosbancarios e trazer colunas corretas
                var _query = $@"
                    SELECT 
                        id AS ID, idempresa AS IdEmpresa, idusuario AS IdUsuario, idtipochavepix AS IdTipoChavePix,
                        descricao AS Descricao, 
                        dtcriacao AS DtCriacao, status AS Status
                    FROM public.dadosbancarios
                    WHERE id = @IdItem
                      AND idempresa = {_identidade.IdEmpresaLogado}
                ";

                var _result = await _dbConnectionFactory.QuerySingleOrDefaultAsync<DadosBancarios>(_query, new { IdItem = idItem });
                return _result ?? throw new TratamentoExcecao($"Dado bancário com ID {idItem} não encontrado.");
            }
            catch (Exception ex)
            {
                throw new TratamentoExcecao(ex.Message.Traduzir());
            }
        }

        public async Task<TipoChave> EditarTipoChavePix(long idItem)
        {
            try
            {
                var _query = $@"
                      SELECT 
                          id AS ID, idempresa AS IdEmpresa, idusuario AS IdUsuario,
                          descricao AS Descricao, dtcriacao AS DtCriacao, status AS Status
                      FROM public.tipochave
                      WHERE id = @IdItem
                        AND idempresa = {_identidade.IdEmpresaLogado}
                ";

                var _result = await _dbConnectionFactory.QuerySingleOrDefaultAsync<TipoChave>(_query, new { IdItem = idItem });
                return _result ?? throw new TratamentoExcecao($"Tipo de Chave com ID {idItem} não encontrado.");
            }
            catch (Exception ex)
            {
                throw new TratamentoExcecao(ex.Message.Traduzir());
            }
        }

        public async Task<string> DescriptografarChavePix(long id, string senha)
        {
            try
            {
                var _query = $@"
                    SELECT descricao
                    FROM public.dadosbancarios
                    WHERE id = @Id 
                      AND idempresa = {_identidade.IdEmpresaLogado}
                      AND idusuario = {_identidade.IdUsuarioLogado}";
                      
                var encryptedDescricao = await _dbConnectionFactory.QuerySingleOrDefaultAsync<string>(_query, new { Id = id });
                
                if (string.IsNullOrEmpty(encryptedDescricao))
                    throw new TratamentoExcecao("Dados bancários não encontrados ou você não tem permissão para acessá-los.");
                    
                var decrypted = TratamentosCriptografia.Descriptografar(encryptedDescricao, senha);
                return decrypted;
            }
            catch (Exception ex)
            {
                throw new TratamentoExcecao($"Erro ao descriptografar: Senha incorreta ou dados inválidos. Detalhes: {ex.Message.Traduzir()}");
            }
        }

        public void Dispose()
        {
            _dbConnectionFactory?.Dispose();
            GC.SuppressFinalize(this);
        }
    }
}