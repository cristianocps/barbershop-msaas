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
    public class HorarioTrabalhoRepositorio : IHorarioTrabalhoRepositorio
    {
        private readonly IUser? _accessor;
        private readonly IConfiguration? _configuration;
        private readonly TransferenciaIdentidadeDTO _identidade;
        private readonly IDbConnectionFactory _dbConnectionFactory;

        public HorarioTrabalhoRepositorio(IDbConnectionFactory dbConnectionFactory, IUser? accessor, IConfiguration? configuration, TransferenciaIdentidadeDTO identidade)
        {
            _dbConnectionFactory = dbConnectionFactory;
            _accessor = accessor;
            _configuration = configuration;
            _identidade = identidade;
        }

        public async Task<long> AlterarHorarioTrabalho(HorarioTrabalho dados)
        {
            try
            {
                var _query = "";
                if (dados.ID > 0)
                {
                    _query = $@"
                    UPDATE public.profissionais_horarios
                    SET 
                        idprofissional = @IdProfissional,
                        dia_semana = @DiaSemana,
                        hora_inicio = @HoraInicio,
                        hora_fim = @HoraFim,
                        duracao_minutos = @DuracaoMinutos,
                        status = @Status
                    WHERE 
                        id = @ID
                        AND idempresa = {_identidade.IdEmpresaLogado}
                    RETURNING id;";
                }
                else
                {
                    _query = $@"
                    INSERT INTO public.profissionais_horarios ( 
                        idempresa, idprofissional, dia_semana, hora_inicio, hora_fim, duracao_minutos, status
                    ) VALUES (
                        {_identidade.IdEmpresaLogado}, @IdProfissional, @DiaSemana, @HoraInicio, @HoraFim, @DuracaoMinutos, @Status
                    )
                    RETURNING id;";
                }

                var _result = await _dbConnectionFactory.QuerySingleOrDefaultAsync<long>(_query, dados);
                return await Task.FromResult(_result).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                throw new TratamentoExcecao($"Erro ao salvar horário: {ex.Message.Traduzir()}");
            }
        }

        public async Task<long> AlterarStatusHorarioTrabalho(long id, int status)
        {
            try
            {
                var _query = $@"
                    UPDATE public.profissionais_horarios 
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

       

        public async Task<RetornoGridPaginado<HorarioTrabalho>> CarregarGridHorariosTrabalho(DataTableSearch search, int start, int draw, int? length = 10)
        {
            try
            {
                var _query = $@"
                    WITH TotalCount AS (
                        SELECT COUNT(h.id) AS RecordsTotal 
                        FROM public.profissionais_horarios h
                        JOIN public.profissionais p ON h.idprofissional = p.id
                        WHERE h.idempresa = {_identidade.IdEmpresaLogado}
                    ),
                    FilteredData AS (
                        SELECT 
                            h.id AS ID, h.idempresa AS IdEmpresa, h.idprofissional AS IdProfissional,
                            h.dia_semana AS DiaSemana, h.hora_inicio AS HoraInicio, h.hora_fim AS HoraFim, 
                            h.duracao_minutos AS DuracaoMinutos, h.status AS Status,
                            p.descricao AS NomeProfissional,
                            COUNT(h.id) OVER() AS RecordsFiltered
                        FROM public.profissionais_horarios h
                        JOIN public.profissionais p ON h.idprofissional = p.id
                        WHERE h.idempresa = {_identidade.IdEmpresaLogado}
                          AND (@SearchText::text = '' 
                               OR p.descricao ILIKE '%' || @SearchText::text || '%')
                    )
                    SELECT 
                        f.*, t.RecordsTotal
                    FROM FilteredData f
                    CROSS JOIN TotalCount t
                    ORDER BY f.NomeProfissional ASC, f.DiaSemana ASC, f.HoraInicio ASC
                    OFFSET @Start LIMIT @Length;
                ";

                var searchText = (search?.value ?? "").Trim();
                var result = await _dbConnectionFactory.QueryAsync<HorarioTrabalho>(_query, new { SearchText = searchText, Start = start, Length = length });

                if (!result.Any())
                    return new RetornoGridPaginado<HorarioTrabalho>().RetornoVazio(draw);

                var _result = new RetornoGridPaginado<HorarioTrabalho>
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

        public async Task<HorarioTrabalho> Editar(long idItem)
        {
            try
            {
                var _query = $@"
                    SELECT 
                        id AS ID, idempresa AS IdEmpresa, idprofissional AS IdProfissional,
                        dia_semana AS DiaSemana, hora_inicio AS HoraInicio, hora_fim AS HoraFim,
                        duracao_minutos AS DuracaoMinutos, status AS Status
                    FROM public.profissionais_horarios
                    WHERE id = @IdItem
                      AND idempresa = {_identidade.IdEmpresaLogado}
                ";

                var _result = await _dbConnectionFactory.QuerySingleOrDefaultAsync<HorarioTrabalho>(_query, new { IdItem = idItem });
                return _result ?? throw new TratamentoExcecao($"Horário com ID {idItem} não encontrado.");
            }
            catch (Exception ex)
            {
                throw new TratamentoExcecao(ex.Message.Traduzir());
            }
        }

        public async Task<bool> Excluir(long idItem)
        {
            try
            {
                var _query = $@"
                    DELETE FROM public.profissionais_horarios 
                    WHERE id = @Id AND idempresa = {_identidade.IdEmpresaLogado}";

                var _result = await _dbConnectionFactory.ExecuteAsync(_query, new { Id = idItem });
                return _result > 0;
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
