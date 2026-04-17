using BarberShop.Dominio.Entidade.Acessos;
using BarberShop.Dominio.Entidade.Agendamentos;
using BarberShop.Dominio.Entidade.DTOs;
using BarberShop.Dominio.Entidade.Reflection.Texto;
using BarberShop.Dominio.Enuns;
using BarberShop.Dominio.Interfaces.Base;
using BarberShop.Dominio.Interfaces.Repositorios.Agendamentos;
using BarberShop.Infraestrutura.padronizar;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;

namespace BarberShop.Repositorio.Repositorio.Agendamentos
{
    public class AgendamentosRepositorio : IAgendamentoRepositorio
    {
        private readonly IUser? _accessor;
        private readonly IConfiguration? _configuration;
        private readonly TransferenciaIdentidadeDTO _identidade;
        private readonly IDbConnectionFactory _dbConnectionFactory;

        public AgendamentosRepositorio(IDbConnectionFactory dbConnectionFactory, IUser? accessor, IConfiguration? configuration, TransferenciaIdentidadeDTO identidade)
        {
            _dbConnectionFactory = dbConnectionFactory;
            _accessor = accessor;
            _configuration = configuration;
            _identidade = identidade;
        }

        public async Task<long> AlterarAgendamentos(Agendamento dados)
        {
            try
            {
                var _queryPai = "";
                long _result = 0;

                if (dados.ID > 0)
                {
                    // UPDATE: idservico removido, idprofissional adicionado.
                    _queryPai = $@"
                        UPDATE public.agendamentos
                        SET 
                            idcliente = @IdCliente,
                            idprofissional = @IdProfissional,
                            descricao = @Descricao,
                            telefone = @Telefone,
                            dtagendamento = @DtAgendamento,
                            observacao = @Observacao,
                            status = @Status
                        WHERE 
                            id = @ID
                            AND idempresa = {_identidade.IdEmpresaLogado}
                        RETURNING id;";

                    _result = await _dbConnectionFactory.QuerySingleOrDefaultAsync<long>(_queryPai, dados);
                }
                else
                {
                    // INSERT: idservico removido, idprofissional adicionado.
                    _queryPai = $@"
                        INSERT INTO public.agendamentos ( 
                            idempresa, idusuario, idcliente, idprofissional, descricao, telefone, observacao, dtagendamento, dtcriacao, status
                        ) VALUES (
                            {_identidade.IdEmpresaLogado}, 
                            {_identidade.IdUsuarioLogado}, 
                            @IdCliente, @IdProfissional, @Descricao, @Telefone, @Observacao, @DtAgendamento, @DtCriacao, @Status
                        )
                        RETURNING id;";

                        _result = await _dbConnectionFactory.QuerySingleOrDefaultAsync<long>(_queryPai, dados);
                    }

                // TRATAMENTO DOS ITENS (SERVIÇOS)
                if (_result > 0 && dados.Itens != null && dados.Itens.Any())
                {
                    if (dados.ID > 0)
                    {
                        var _queryDeleteItens = $"DELETE FROM public.agendamento_itens WHERE idagendamento = {_result};";
                        await _dbConnectionFactory.ExecuteAsync(_queryDeleteItens, null);
                    }

                    // INSERT ITENS: idusuario removido (já está na tabela pai). Mantém idservico.
                    var _queryItens = $@"
                        INSERT INTO public.agendamento_itens (
                            idempresa, idagendamento, idservico, valor_cobrado, status
                        ) VALUES (
                            {_identidade.IdEmpresaLogado}, 
                            @IdAgendamento, @IdServico, @ValorCobrado, @Status
                        );
                    ";

                    foreach (var item in dados.Itens)
                    {
                        item.IdAgendamento = _result;
                        await _dbConnectionFactory.ExecuteAsync(_queryItens, item);
                    }
                }

                return await Task.FromResult(_result).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                throw new TratamentoExcecao($"Erro ao salvar o agendamento: {ex.Message.Traduzir()}");
            }
        }

        public async Task<long> AlterarStatusAgendamento(long id, int status)
        {
            try
            {
                var _query = $@"
                    UPDATE public.agendamentos 
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

        public async Task<IEnumerable<DataSelect2DTO>> CarregarComboAgendamentos(string search, int page, int? length = 10)
        {
            try
            {
                var query = $@"
                    SELECT 
                        id AS id, 
                        descricao AS text 
                    FROM public.agendamentos
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

        public async Task<RetornoGridPaginado<Agendamento>> CarregarGridAgendamentos(DataTableSearch search, int start, int draw, int? length = 10)
        {
            try
            {
                var _query = $@"
                    WITH TotalCount AS (
                        SELECT COUNT(id) AS RecordsTotal 
                        FROM public.agendamentos
                        WHERE idempresa = {_identidade.IdEmpresaLogado}
                    ),
                    FilteredData AS (
                        SELECT 
                            a.id                    AS ID,
                            a.idempresa             AS IdEmpresa,
                            a.idusuario             AS IdUsuario,
                            a.idcliente             AS IdCliente,
                            a.idprofissional        AS IdProfissional,
                            a.descricao             AS Descricao,
                            a.telefone              AS Telefone,
                            a.dtagendamento         AS DtAgendamento,
                            a.dtcriacao             AS DtCriacao,
                            a.status                AS Status,
                            a.comprovante_pix       AS ComprovantePix,
                            COALESCE(p.descricao, '') AS NomeProfissional,
                            COALESCE((
                                SELECT SUM(i.valor_cobrado)
                                FROM public.agendamento_itens i
                                WHERE i.idagendamento = a.id
                            ), 0)                   AS ValorTotal,
                            COUNT(a.id) OVER()      AS RecordsFiltered
                        FROM public.agendamentos a
                        LEFT JOIN public.profissionais p ON p.id = a.idprofissional
                        WHERE a.idempresa = {_identidade.IdEmpresaLogado}
                          AND (@SearchText::text = ''
                               OR a.descricao ILIKE '%' || @SearchText::text || '%'
                               OR a.telefone  ILIKE '%' || @SearchText::text || '%')
                        ORDER BY a.dtagendamento DESC
                        OFFSET @Start LIMIT @Length
                    )
                    SELECT f.*, t.RecordsTotal
                    FROM FilteredData f
                    CROSS JOIN TotalCount t
                    ORDER BY f.DtAgendamento DESC;
                ";

                var searchText = (search?.value ?? "").Trim();

                var result = await _dbConnectionFactory.QueryAsync<Agendamento>(_query,
                    new { SearchText = searchText, Start = start, Length = length });

                if (!result.Any())
                    return new RetornoGridPaginado<Agendamento>().RetornoVazio(draw);

                var _result = new RetornoGridPaginado<Agendamento>
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

        public async Task<Agendamento> Editar(long idItem)
        {
            try
            {
                var _queryPai = $@"
                    SELECT 
                        id              AS ID,
                        idempresa       AS IdEmpresa,
                        idusuario       AS IdUsuario,
                        idcliente       AS IdCliente,
                        idprofissional  AS IdProfissional,
                        descricao       AS Descricao,
                        telefone        AS Telefone,
                        observacao      AS Observacao,
                        dtagendamento   AS DtAgendamento,
                        dtcriacao       AS DtCriacao,
                        status          AS Status
                    FROM public.agendamentos
                    WHERE id = @IdItem
                      AND idempresa = {_identidade.IdEmpresaLogado}
                ";

                var _result = await _dbConnectionFactory.QuerySingleOrDefaultAsync<Agendamento>(_queryPai, new { IdItem = idItem });

                if (_result == null)
                    throw new TratamentoExcecao($"Agendamento com ID {idItem} não encontrado.");

                // Busca os serviços do agendamento (itens)
                var _queryItens = $@"
                    SELECT 
                        id              AS ID,
                        idempresa       AS IdEmpresa,
                        idagendamento   AS IdAgendamento,
                        idservico       AS IdServico,
                        valor_cobrado   AS ValorCobrado,
                        status          AS Status
                    FROM public.agendamento_itens
                    WHERE idagendamento = @IdItem
                      AND idempresa = {_identidade.IdEmpresaLogado}
                ";

                var itens = await _dbConnectionFactory.QueryAsync<AgendamentoItem>(_queryItens, new { IdItem = idItem });
                _result.Itens = itens.ToList();

                return await Task.FromResult(_result).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                throw new TratamentoExcecao(ex.Message.Traduzir());
            }
        }

        public async Task<IEnumerable<AgendamentoPendenteDTO>> GetAgendamentosPendentesHoje()
        {
            try
            {
                var dtHojeStart = DateTime.Now.Date;
                var dtHojeEnd = dtHojeStart.AddDays(1).AddTicks(-1);

                var query = $@"
                    SELECT 
                        a.id AS Id,
                        a.descricao AS Descricao,
                        COALESCE(c.descricao, '') AS NomeCliente,
                        a.telefone AS Telefone,
                        a.dtagendamento AS DtAgendamento,
                        a.comprovante_pix AS ComprovantePix
                    FROM public.agendamentos a
                    LEFT JOIN public.clientes c ON c.id = a.idcliente
                    WHERE a.idempresa = {_identidade.IdEmpresaLogado}
                      AND a.status = 0
                      AND a.dtcriacao >= @DtStart AND a.dtcriacao <= @DtEnd
                    ORDER BY a.dtagendamento ASC;
                ";

                var result = await _dbConnectionFactory.QueryAsync<AgendamentoPendenteDTO>(query, new { DtStart = dtHojeStart, DtEnd = dtHojeEnd });
                return result;
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