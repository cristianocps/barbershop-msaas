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
    public class UsuarioRepositorio : IUsuarioRepositorio
    {
        private readonly IUser? _accessor;
        private readonly IConfiguration? _configuration;
        private readonly TransferenciaIdentidadeDTO _identidade;
        private readonly IDbConnectionFactory _dbConnectionFactory;
        public UsuarioRepositorio(IDbConnectionFactory dbConnectionFactory, IUser? accessor, IConfiguration? configuration, TransferenciaIdentidadeDTO identidade)
        {

            _dbConnectionFactory = dbConnectionFactory;
            _accessor = accessor;
            _configuration = configuration;
            _identidade = identidade;
        }

        public async Task<long> AlterarUsuarios(Usuario dados)
        {
            try
            {
                var _query = "";

                if (dados.ID > 0)
                {
                    _query = $@"
                        UPDATE public.usuarios
                        SET 
                            documento = @Documento,
                            descricao = @Descricao,
                            email = @Email,
                            telefone = @Telefone,
                            cidade = @Cidade,
                            idempresa = @IdEmpresa,
                            idclains = @IdClains,
                            senha = CASE WHEN @Senha IS NULL OR @Senha = '' THEN senha ELSE @Senha END,
                            status = @Status
                        WHERE 
                            id = @ID
                        RETURNING id;";
                }
                else
                {
                    _query = $@"
                        INSERT INTO public.usuarios ( 
                            idempresa, documento, descricao, email, telefone, cidade, 
                            senha, idclains, dtcriacao, status
                        ) VALUES (
                            @IdEmpresa,
                            @Documento, @Descricao, @Email, @Telefone, @Cidade, 
                            @Senha, @IdClains, @DtCriacao, 1
                        )
                        RETURNING id;";
                }

                var _result = await _dbConnectionFactory.QuerySingleOrDefaultAsync<long>(_query, dados);

                return _result;
            }
            catch (Exception ex)
            {
                throw new TratamentoExcecao($"Erro ao salvar o usuário: {ex.Message.Traduzir()}");
            }
        }

        public async Task<string?> ValidarCriacaoUsuario(long idUsuario, string email)
        {
            try
            {
                var _email = (email ?? "").Trim().VarcharToSQL();
                var _query = @"
                    WITH erros AS (
                        SELECT 'email já utilizado em outro cadastro: ' || email AS erro
                        FROM public.usuarios a
                        WHERE a.email = @Email
                          AND a.id <> @IdUsuario
                    )
                    SELECT UPPER(erro) AS Erro
                    FROM erros;
                ";

                var parametros = new { IdUsuario = idUsuario, Email = _email };
                var erros = await _dbConnectionFactory.QueryAsync<string?>(_query, parametros);

                var sb = new StringBuilder();
                int count = 1;

                foreach (var erro in erros)
                {
                    sb.AppendLine($"({count}) {erro}");
                    count++;
                }

                return await Task.FromResult(sb.ToString()).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                throw new TratamentoExcecao
                    (ex.Message.Traduzir());
            }
        }

        public async Task<IEnumerable<DataSelect2DTO>> CarregarComboUsuarios(string search, int page, int? length = 10)
        {
            try
            {

                var _query = @"
                    SELECT
                        u.id,
                        u.descricao || ' (' || u.email || ')' AS text
                    FROM
                        public.usuarios u
                    WHERE
                        u.status = 1
                        AND (
                            u.descricao ILIKE @Search
                            OR u.email  ILIKE @Search
                        )
                    ORDER BY
                        u.descricao ASC
                    LIMIT  @Limit
                    OFFSET @Offset
                ";


                var _result = await _dbConnectionFactory.QueryAsync<DataSelect2DTO>(_query, new
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

        public async Task<RetornoGridPaginado<Usuario>> CarregarGridUsuarios(DataTableSearch search, int start, int draw, int? length = 10)
        {
            try
            {

                var _query = $@"
                    SELECT 
                        u.id AS ID,  u.idempresa AS IdEmpresa,  u.documento AS Documento, u.descricao AS Descricao, 
                        u.email AS Email, u.telefone AS Telefone, u.cidade AS Cidade, u.senha AS Senha,
                        u.idclains AS IdClains, u.dtcriacao AS DtCriacao, u.status AS Status,
                        p.descricao AS Pefil,
                        COUNT(*) OVER() AS RecordsFiltered,
                        (SELECT COUNT(*) FROM public.usuarios WHERE idempresa = {_identidade.IdEmpresaLogado} AND status = 1) AS RecordsTotal            
                    FROM public.usuarios u
                    LEFT JOIN ""AspNetUserRoles"" aur ON aur.""UserId"" = u.idclains
                    LEFT JOIN ""AspNetRoles""     ar  ON ar.""Id""     = aur.""RoleId""
                    LEFT JOIN public.perfil       p   ON p.idrole      = ar.""Id""
                    WHERE u.idempresa = {_identidade.IdEmpresaLogado}
                      AND u.status = 1
                      AND (
                          COALESCE(@SearchText, '') = '' 
                          OR u.descricao ILIKE '%' || @SearchText || '%'
                          OR u.email ILIKE '%' || @SearchText || '%'
                      )
                    ORDER BY u.descricao ASC
                    OFFSET @Start LIMIT @Length;
                ";

                var searchText = (search?.value ?? "").Trim();

                var result = await _dbConnectionFactory.QueryAsync<Usuario>(_query, new { SearchText = searchText, Start = start, Length = length });

                if (!result.Any())
                    return new RetornoGridPaginado<Usuario>().RetornoVazio(draw);

                var _return = new RetornoGridPaginado<Usuario>
                {
                    data = result,
                    draw = draw,
                    recordsTotal = result.FirstOrDefault()?.RecordsTotal ?? 0,
                    recordsFiltered = result.FirstOrDefault()?.RecordsFiltered ?? 0,
                    JsonTypes = IResponseController.ResponseJsonTypes.Success.ToString().ToLower(CultureInfo.CurrentCulture)
                };

                return await Task.FromResult(_return).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                throw new TratamentoExcecao(ex.Message.Traduzir());
            }
        }
        public async Task<Usuario> Editar(long idItem)
        {
            try
            {
                var _query = @"
                    SELECT 
                        u.*,
                        ar.""Id""    AS IdClains,
                        p.descricao AS Pefil
                    FROM public.usuarios u
                    LEFT JOIN ""AspNetUserRoles"" aur ON aur.""UserId"" = u.idclains
                    LEFT JOIN ""AspNetRoles""     ar  ON ar.""Id""     = aur.""RoleId""
                    LEFT JOIN public.perfil       p   ON p.idrole      = ar.""Id""
                    WHERE u.id = @IdItem";

                var _result = await _dbConnectionFactory.QuerySingleOrDefaultAsync<Usuario>(_query, new { IdItem = idItem });

                return _result ?? throw new TratamentoExcecao($"Usuário com ID {idItem} não encontrado.");
            }
            catch (Exception ex)
            {
                throw new TratamentoExcecao(ex.Message.Traduzir());
            }
        }

        public async Task<long> Excluir(long idItem)
        {
            try
            {
                var _query = @"";

                var _result = await _dbConnectionFactory.QuerySingleOrDefaultAsync<long>(_query, new { IdItem = idItem });

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
