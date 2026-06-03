using BarberShop.Controllers;
using BarberShop.Dominio.Entidade.Agendamentos;
using BarberShop.Dominio.Entidade.Configuracoes;
using BarberShop.Dominio.Entidade.DTOs;
using BarberShop.Dominio.Entidade.Reflection.Texto;
using BarberShop.Dominio.Interfaces.Base;
using BarberShop.Dominio.Interfaces.Servicos.Acessos;
using BarberShop.Dominio.Interfaces.Servicos.Agendamentos;
using BarberShop.Infraestrutura.padronizar;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using System.Globalization;
using System.Security.Principal;
using System.Text.Json;
using static BarberShop.Dominio.Enuns.IGroupPolicies;
using static BarberShop.Dominio.Enuns.IResponseController;

namespace BarberShop.Areas.Agendamentos
{
    [Authorize]
    [ApiController]
    [Area("Agendamentos")]
    [Route("api/[area]/[controller]")]
    public class AgendamentosController : BasicController
    {
        private readonly IAgendamentoServicos _agendamentoServicos;
        public AgendamentosController(
            [FromServices] IWebHostEnvironment environment,
            IHttpContextAccessor context,
            IConfiguration configuration,
            SignInManager<IdentityUser> signInManager,
            UserManager<IdentityUser> userManager,
            RoleManager<IdentityRole> roleManager,
            IAgendamentoServicos agendamentoServicos,
            IPrincipal principal,
            IUser? user,
            IStoreRoles storeRoles) : base(environment, Policy.Consulta, context, configuration, signInManager, userManager, roleManager, principal, user, storeRoles)
        { _agendamentoServicos = agendamentoServicos; }


        [HttpPost("alterar-agendamentos")]
        public async Task<JsonResult> AlterarAgendamentos(Agendamento dados)
        {
            try
            {

                if (dados == null)
                    throw new Exception("Dados do fomulário vázio");

                Thread.CurrentThread.CurrentCulture = CultureInfo.GetCultureInfo("pt-BR");
                var context = new ValidationContext(dados, serviceProvider: null, items: null);
                var validationResults = new List<ValidationResult>();
                bool isValid = Validator.TryValidateObject(dados, context, validationResults, true);
                validationResults ??= new List<ValidationResult>();

                if (validationResults.Any())
                {
                    var _erroMensagem = (validationResults?.FirstOrDefault()?.ErrorMessage ?? "Erro no processamento").ToLower(culture: CultureInfo.CurrentCulture);
                    throw new TratamentoExcecao(_erroMensagem.Traduzir());
                }

                var _result = await _agendamentoServicos.AlterarAgendamentos(dados).ConfigureAwait(false);

                return await ResponseJson(ResponseJsonTypes.Success);
            }
            catch (TratamentoExcecao e) { return await ResponseJson(ResponseJsonTypes.Error, e.Message); }
            catch (Exception ex) { return await ResponseJson(ResponseJsonTypes.Error, ex.Message); }
        }

        [HttpPut("alterar-status-agendamentos/{id}")]
        public async Task<JsonResult> AlterarStatusAgendamento(long id, [FromBody] int status)
        {
            try
            {

                var _result = await _agendamentoServicos.AlterarStatusAgendamento(id, status).ConfigureAwait(false);

                return await ResponseJson(ResponseJsonTypes.Success);
            }
            catch (TratamentoExcecao e) { return await ResponseJson(ResponseJsonTypes.Error, e.Message); }
            catch (Exception ex) { return await ResponseJson(ResponseJsonTypes.Error, ex.Message); }
        }



        [HttpGet("carregarcombo-agendamentos")]
        public async Task<IActionResult> CarregarComboAgendamentos(string? search, int? page)
        {
            try
            {
                var _page = page ?? 1;
                var _message = "";
                var _type = ResponseJsonTypes.Success;
                var _result = await _agendamentoServicos.CarregarComboAgendamentos(search ?? "", _page);
                var _return = await ResponseJson(_type, _message, _result, _result.Count()).ConfigureAwait(false);

                return await Task.FromResult(_return).ConfigureAwait(false);
            }
            catch (TratamentoExcecao e) { return await ResponseJson(ResponseJsonTypes.Error, e.Message); }
            catch (Exception ex) { return await ResponseJson(ResponseJsonTypes.Error, ex.Message); }

        }


        [HttpPost("carregargrid-agendamentos")]
        public async Task<IActionResult> CarregarGridAgendamentos(DataTableSearch? search = null, int start = 0, int length = 0, int draw = 0)
        {
            try
            {
                search ??= new DataTableSearch
                {
                    value = "",
                };

                var _result = Json(await _agendamentoServicos.CarregarGridAgendamentos(search, start, draw, length), new JsonSerializerOptions() { PropertyNameCaseInsensitive = true });
                var _return = await ResponseJson(ResponseJsonTypes.Success, "", _result).ConfigureAwait(false);

                return await Task.FromResult(_result).ConfigureAwait(false);

            }
            catch (TratamentoExcecao e) { return await ResponseJson(ResponseJsonTypes.Error, e.Message); }
            catch (Exception ex) { return await ResponseJson(ResponseJsonTypes.Error, ex.Message); }
        }

        [HttpPost("editar-agendamentos")]
        public async Task<JsonResult> Editar(long idItem)
        {
            try
            {
                var _result = await _agendamentoServicos.Editar(idItem);
                var _return = await ResponseJson(ResponseJsonTypes.Success, "", _result).ConfigureAwait(false);

                return await Task.FromResult(_return).ConfigureAwait(false);
            }
            catch (TratamentoExcecao e) { return await ResponseJson(ResponseJsonTypes.Error, e.Message); }
            catch (Exception ex) { return await ResponseJson(ResponseJsonTypes.Error, ex.Message); }
        }

        [HttpGet("get-pendentes-hoje")]
        public async Task<JsonResult> GetPendentesHoje()
        {
            try
            {
                var _result = await _agendamentoServicos.GetAgendamentosPendentesHoje();
                var _return = await ResponseJson(ResponseJsonTypes.Success, "", _result).ConfigureAwait(false);

                return await Task.FromResult(_return).ConfigureAwait(false);
            }
            catch (TratamentoExcecao e) { return await ResponseJson(ResponseJsonTypes.Error, e.Message); }
            catch (Exception ex) { return await ResponseJson(ResponseJsonTypes.Error, ex.Message); }
        }

        [HttpGet("proximos")]
        public async Task<JsonResult> GetProximos()
        {
            try
            {
                var _result = await _agendamentoServicos.GetAgendamentosProximos();
                var _return = await ResponseJson(ResponseJsonTypes.Success, "", _result).ConfigureAwait(false);

                return await Task.FromResult(_return).ConfigureAwait(false);
            }
            catch (TratamentoExcecao e) { return await ResponseJson(ResponseJsonTypes.Error, e.Message); }
            catch (Exception ex) { return await ResponseJson(ResponseJsonTypes.Error, ex.Message); }
        }

        [HttpPost("{id}/confirmar")]
        public async Task<JsonResult> Confirmar(long id)
        {
            try
            {
                await _agendamentoServicos.ConfirmarAgendamentoAsync(id).ConfigureAwait(false);
                return await ResponseJson(ResponseJsonTypes.Success);
            }
            catch (TratamentoExcecao e) { return await ResponseJson(ResponseJsonTypes.Error, e.Message); }
            catch (Exception ex) { return await ResponseJson(ResponseJsonTypes.Error, ex.Message); }
        }

        [HttpPost("{id}/cancelar")]
        public async Task<JsonResult> Cancelar(long id, [FromBody] CancelarAgendamentoDTO? dados)
        {
            try
            {
                await _agendamentoServicos.CancelarAgendamentoAsync(id, dados?.Motivo).ConfigureAwait(false);
                return await ResponseJson(ResponseJsonTypes.Success);
            }
            catch (TratamentoExcecao e) { return await ResponseJson(ResponseJsonTypes.Error, e.Message); }
            catch (Exception ex) { return await ResponseJson(ResponseJsonTypes.Error, ex.Message); }
        }

        [HttpPost("{id}/concluir")]
        public async Task<JsonResult> Concluir(long id, [FromBody] ConcluirAgendamentoDTO dados)
        {
            try
            {
                if (dados == null) throw new TratamentoExcecao("Dados de pagamento obrigatórios.");
                await _agendamentoServicos.ConcluirAgendamentoAsync(id, dados).ConfigureAwait(false);
                return await ResponseJson(ResponseJsonTypes.Success);
            }
            catch (TratamentoExcecao e) { return await ResponseJson(ResponseJsonTypes.Error, e.Message); }
            catch (Exception ex) { return await ResponseJson(ResponseJsonTypes.Error, ex.Message); }
        }

        [HttpPost("{id}/pagamento/link")]
        public async Task<JsonResult> GerarLinkPagamento(long id)
        {
            try
            {
                var result = await _agendamentoServicos.GerarLinkPagamentoAsync(id).ConfigureAwait(false);
                return await ResponseJson(ResponseJsonTypes.Success, "", result).ConfigureAwait(false);
            }
            catch (TratamentoExcecao e) { return await ResponseJson(ResponseJsonTypes.Error, e.Message); }
            catch (Exception ex) { return await ResponseJson(ResponseJsonTypes.Error, ex.Message); }
        }

        [HttpGet("{id}/pagamento/tap-url")]
        public async Task<JsonResult> ObterTapUrl(long id, [FromQuery] string metodo = "credit", [FromQuery] int parcelas = 1)
        {
            try
            {
                var result = await _agendamentoServicos.ObterTapUrlAsync(id, metodo, parcelas).ConfigureAwait(false);
                return await ResponseJson(ResponseJsonTypes.Success, "", result).ConfigureAwait(false);
            }
            catch (TratamentoExcecao e) { return await ResponseJson(ResponseJsonTypes.Error, e.Message); }
            catch (Exception ex) { return await ResponseJson(ResponseJsonTypes.Error, ex.Message); }
        }

        [AllowAnonymous]
        [HttpPost("tap-callback")]
        public async Task<JsonResult> TapCallback([FromBody] TapCallbackDTO dados)
        {
            try
            {
                await _agendamentoServicos.ProcessarTapCallbackAsync(dados).ConfigureAwait(false);
                return await ResponseJson(ResponseJsonTypes.Success);
            }
            catch (TratamentoExcecao e) { return await ResponseJson(ResponseJsonTypes.Error, e.Message); }
            catch (Exception ex) { return await ResponseJson(ResponseJsonTypes.Error, ex.Message); }
        }

        [HttpGet("{id}/pagamento")]
        public async Task<JsonResult> ObterPagamento(long id)
        {
            try
            {
                var result = await _agendamentoServicos.ObterPagamentoPorAgendamentoAsync(id).ConfigureAwait(false);
                return await ResponseJson(ResponseJsonTypes.Success, "", result).ConfigureAwait(false);
            }
            catch (TratamentoExcecao e) { return await ResponseJson(ResponseJsonTypes.Error, e.Message); }
            catch (Exception ex) { return await ResponseJson(ResponseJsonTypes.Error, ex.Message); }
        }

        [HttpGet("carregar-calendario")]
        public async Task<JsonResult> CarregarCalendario([FromQuery] DateTime inicio, [FromQuery] DateTime fim)
        {
            try
            {
                if (fim <= inicio)
                    throw new TratamentoExcecao("Período inválido para o calendário.");

                var _result = await _agendamentoServicos.CarregarCalendario(inicio, fim).ConfigureAwait(false);
                return await ResponseJson(ResponseJsonTypes.Success, "", _result).ConfigureAwait(false);
            }
            catch (TratamentoExcecao e) { return await ResponseJson(ResponseJsonTypes.Error, e.Message); }
            catch (Exception ex) { return await ResponseJson(ResponseJsonTypes.Error, ex.Message); }
        }
    }
}
