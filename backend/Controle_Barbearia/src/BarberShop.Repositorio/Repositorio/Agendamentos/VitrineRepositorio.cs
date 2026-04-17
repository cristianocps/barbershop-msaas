using BarberShop.Dominio.Entidade.Agendamentos;
using BarberShop.Dominio.Entidade.Configuracoes;
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
    public class VitrineRepositorio : IVitrineRepositorio
    {
        private readonly IUser? _accessor;
        private readonly IConfiguration? _configuration;
        private readonly TransferenciaIdentidadeDTO _identidade;
        private readonly IDbConnectionFactory _dbConnectionFactory;

        public VitrineRepositorio(IDbConnectionFactory dbConnectionFactory, IUser? accessor, IConfiguration? configuration, TransferenciaIdentidadeDTO identidade)
        {
            _dbConnectionFactory = dbConnectionFactory;
            _accessor = accessor;
            _configuration = configuration;
            _identidade = identidade;
        }

        // ─────────────────────────────────────────────────────────
        // 1. Empresa pelo slug
        // ─────────────────────────────────────────────────────────
        public async Task<Empresa> CarregarEmpresaPorSlug(string slug)
        {
            try
            {
                var _query = @"
                    SELECT 
                        id        AS ID,
                        idusuario AS IdUsuario,
                        descricao AS Descricao,
                        cidade    AS Cidade,
                        telefone  AS Telefone,
                        endereco  AS Endereco,
                        logo_data AS LogoData,
                        status    AS Status
                    FROM public.empresas
                    WHERE slug   = @Slug
                      AND status = 1
                    LIMIT 1;";

                var _result = await _dbConnectionFactory.QuerySingleOrDefaultAsync<Empresa>(
                    _query, new { Slug = slug.VarcharToSQL() });

                if (_result == null)
                    throw new TratamentoExcecao("Barbearia não encontrada ou inativa.");

                return await Task.FromResult(_result).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                throw new TratamentoExcecao(ex.Message.Traduzir());
            }
        }

        // ─────────────────────────────────────────────────────────
        // 2. Serviços ativos da empresa
        // ─────────────────────────────────────────────────────────
        public async Task<IEnumerable<Servico>> CarregarServicosPublicos(long idEmpresa)
        {
            try
            {
                var _query = @"
                    SELECT 
                        id             AS ID,
                        idempresa      AS IdEmpresa,
                        descricao      AS Descricao,
                        unidade        AS Unidade,
                        valor_unitario AS ValorUnitario
                    FROM public.servicos
                    WHERE idempresa = @IdEmpresa
                      AND status    = 1
                    ORDER BY descricao ASC;";

                var _result = await _dbConnectionFactory.QueryAsync<Servico>(
                    _query, new { IdEmpresa = idEmpresa });

                return await Task.FromResult(_result).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                throw new TratamentoExcecao(ex.Message.Traduzir());
            }
        }

        // ─────────────────────────────────────────────────────────
        // 3. Profissionais ativos da empresa
        // ─────────────────────────────────────────────────────────
        public async Task<IEnumerable<Profissional>> CarregarProfissionaisPublicos(long idEmpresa)
        {
            try
            {
                var _query = @"
                    SELECT 
                        id         AS ID,
                        idempresa  AS IdEmpresa,
                        descricao  AS Descricao,
                        telefone   AS Telefone,
                        cor_agenda AS CorAgenda
                    FROM public.profissionais
                    WHERE idempresa = @IdEmpresa
                      AND status    = 1
                    ORDER BY descricao ASC;";

                var _result = await _dbConnectionFactory.QueryAsync<Profissional>(
                    _query, new { IdEmpresa = idEmpresa });

                return await Task.FromResult(_result).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                throw new TratamentoExcecao(ex.Message.Traduzir());
            }
        }

        // ─────────────────────────────────────────────────────────
        // 4. Horários livres — slots fixos menos os já ocupados
        // ─────────────────────────────────────────────────────────
        public async Task<IEnumerable<string>> CarregarHorariosLivres(long idProfissional, DateTime data)
        {
            try
            {
                int diaSemana = (int)data.DayOfWeek;
                
                var _queryHorarios = @"
                    SELECT hora_inicio AS HoraInicio, hora_fim AS HoraFim, duracao_minutos AS DuracaoMinutos
                    FROM public.profissionais_horarios
                    WHERE idprofissional = @IdProfissional
                      AND dia_semana = @DiaSemana
                      AND status = 1;";
                      
                var horariosConfig = await _dbConnectionFactory.QueryAsync<dynamic>(
                    _queryHorarios, new { IdProfissional = idProfissional, DiaSemana = diaSemana });

                if (!horariosConfig.Any())
                    return new List<string>();

                var dataStr = data.ToString("yyyy-MM-dd");

                var _queryOcupados = @"
                    SELECT 
                        TO_CHAR(a.dtagendamento, 'HH24:MI') as HoraStr,
                        COALESCE(SUM(CAST(NULLIF(regexp_replace(s.unidade, '\D', '', 'g'), '') AS INTEGER)), 30) as DuracaoMinutos
                    FROM public.agendamentos a
                    LEFT JOIN public.agendamento_itens i ON i.idagendamento = a.id
                    LEFT JOIN public.servicos s ON s.id = i.idservico
                    WHERE a.idprofissional = @IdProfissional
                      AND TO_CHAR(a.dtagendamento, 'YYYY-MM-DD') = @DataStr
                      AND a.status != 3
                    GROUP BY a.id, a.dtagendamento;";

                var _ocupadosDB = await _dbConnectionFactory.QueryAsync<dynamic>(
                    _queryOcupados, new { IdProfissional = idProfissional, DataStr = dataStr });

                var ocupadosIntervalos = new List<(TimeSpan Start, TimeSpan End)>();
                foreach (var o in _ocupadosDB)
                {
                    string horaStr = o.horastr;
                    int duracaoItem = (int)o.duracaominutos;
                    if (duracaoItem <= 0) duracaoItem = 30;

                    if (TimeSpan.TryParse(horaStr, out TimeSpan start))
                    {
                        TimeSpan end = start.Add(TimeSpan.FromMinutes(duracaoItem));
                        ocupadosIntervalos.Add((start, end));
                    }
                }

                var _livres = new List<string>();

                foreach (var cfg in horariosConfig)
                {
                    TimeSpan inicio = cfg.horainicio;
                    TimeSpan fim = cfg.horafim;
                    int duracao = cfg.duracaominutos;
                    if (duracao <= 0) duracao = 30;

                    TimeSpan atual = inicio;
                    while (atual < fim)
                    {
                        TimeSpan slotFim = atual.Add(TimeSpan.FromMinutes(duracao));
                        
                        // Overlap condition: slotStart < occupiedEnd AND slotEnd > occupiedStart
                        bool isOccupied = ocupadosIntervalos.Any(occ => atual < occ.End && slotFim > occ.Start);

                        if (!isOccupied)
                        {
                            _livres.Add(atual.ToString(@"hh\:mm"));
                        }
                        atual = slotFim; // Or atual.Add(TimeSpan.FromMinutes(duracao))
                    }
                }

                return _livres.Distinct().OrderBy(x => x).ToList();
            }
            catch (Exception ex)
            {
                throw new TratamentoExcecao(ex.Message.Traduzir());
            }
        }

        // ─────────────────────────────────────────────────────────
        // 4.1 Dados bancários (PIX) da empresa
        // ─────────────────────────────────────────────────────────
        public async Task<IEnumerable<dynamic>> CarregarDadosBancariosPublicos(long idEmpresa)
        {
            try
            {
                // Busca as chaves PIX ativas. 
                // Nota: O ideal seria ter uma coluna não criptografada para exibição na vitrine.
                var _query = @"
                    SELECT 
                        t.descricao AS Tipo,
                        d.chave_vitrine AS Chave
                    FROM public.dadosbancarios d
                    JOIN public.tipochave t ON t.id = d.idtipochavepix
                    WHERE d.idempresa = @IdEmpresa
                      AND d.status = 1";

                var result = await _dbConnectionFactory.QueryAsync<dynamic>(_query, new { IdEmpresa = idEmpresa });
                return result;
            }
            catch (Exception ex)
            {
                throw new TratamentoExcecao(ex.Message.Traduzir());
            }
        }

        // ─────────────────────────────────────────────────────────
        // 5. Confirmar agendamento (upsert cliente + agendamento + itens)
        // ─────────────────────────────────────────────────────────
        public async Task<VitrineConfirmarRetornoDTO> ConfirmarAgendamento(VitrineConfirmarDTO dados)
        {
            try
            {
                var _telefoneClean = "";
                if (!string.IsNullOrWhiteSpace(dados.TelefoneCliente))
                    _telefoneClean = dados.TelefoneCliente.ApenasNumeros();

                // ── 5.1 Upsert cliente por telefone + empresa ──
                var _queryCliente = @"
                    INSERT INTO public.clientes (idempresa, idusuario, descricao, telefone, dtcriacao, status)
                    VALUES (@IdEmpresa, 0, @NomeCliente, @Telefone, NOW(), 1)
                    ON CONFLICT DO NOTHING;
                    SELECT id FROM public.clientes
                    WHERE idempresa = @IdEmpresa
                      AND ((telefone = @Telefone AND @Telefone <> '') OR (descricao = @NomeCliente AND @Telefone = ''))
                    ORDER BY id DESC LIMIT 1;";

                var _idCliente = await _dbConnectionFactory.QuerySingleOrDefaultAsync<long>(
                    _queryCliente, new
                    {
                        dados.IdEmpresa,
                        NomeCliente = dados.NomeCliente.VarcharToSQL(),
                        Telefone    = _telefoneClean
                    });

                if (_idCliente == 0)
                    throw new TratamentoExcecao("Erro ao registrar o cliente.");

                // ── 5.2 Insert do agendamento ──
                var _descricao = string.Join(" + ", dados.Servicos.Select(s => s.NomeServico));

                var _queryAgendamento = @"
                    INSERT INTO public.agendamentos
                        (idempresa, idusuario, idcliente, idprofissional, descricao, telefone, observacao, dtagendamento, dtcriacao, status, comprovante_pix)
                    VALUES
                        (@IdEmpresa, 0, @IdCliente, @IdProfissional, @Descricao, @Telefone, @Observacao, @DtAgendamento, NOW(), 0, @ComprovantePix)
                    RETURNING id;";

                var _idAgendamento = await _dbConnectionFactory.QuerySingleOrDefaultAsync<long>(
                    _queryAgendamento, new
                    {
                        dados.IdEmpresa,
                        IdCliente      = _idCliente,
                        dados.IdProfissional,
                        Descricao      = _descricao.VarcharToSQL(),
                        Telefone       = _telefoneClean,
                        Observacao     = dados.Observacao ?? "",
                        DtAgendamento  = dados.DtAgendamento,
                        ComprovantePix = string.IsNullOrWhiteSpace(dados.ComprovantePix) ? null : dados.ComprovantePix
                    });

                if (_idAgendamento == 0)
                    throw new TratamentoExcecao("Erro ao criar o agendamento.");

                // ── 5.3 Insert dos itens ──
                var _queryItens = @"
                    INSERT INTO public.agendamento_itens
                        (idempresa, idagendamento, idservico, valor_cobrado, status)
                    VALUES
                        (@IdEmpresa, @IdAgendamento, @IdServico, @ValorCobrado, 0);";

                foreach (var item in dados.Servicos)
                {
                    await _dbConnectionFactory.ExecuteAsync(_queryItens, new
                    {
                        dados.IdEmpresa,
                        IdAgendamento = _idAgendamento,
                        item.IdServico,
                        item.ValorCobrado
                    });
                }

                // ── 5.4 Busca nome do profissional para montar o retorno ──
                var _queryProfissional = @" SELECT descricao, telefone FROM public.profissionais  WHERE id = @Id LIMIT 1;";

                var _profDesc = await _dbConnectionFactory.QuerySingleOrDefaultAsync<dynamic>(
                    _queryProfissional, new { Id = dados.IdProfissional });

                string _nomeProfissional = _profDesc?.descricao ?? "";
                string _telefoneProfissional = _profDesc?.telefone ?? "";

                // ── 5.5 Monta retorno ──
                var _cultura       = new CultureInfo("pt-BR");
                var _dtFormatada   = dados.DtAgendamento.ToString("dddd, dd 'de' MMMM", _cultura);

                var _result = new VitrineConfirmarRetornoDTO
                {
                    IdAgendamento    = _idAgendamento,
                    NomeProfissional = _nomeProfissional,
                    NomeServicos     = _descricao,
                    DataFormatada    = _dtFormatada,
                    WhatsApp         = _telefoneProfissional,
                    MensagemWhatsApp = "" // A mensagem será montada no Frontend para evitar problemas de encoding de Emoji
                };

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
