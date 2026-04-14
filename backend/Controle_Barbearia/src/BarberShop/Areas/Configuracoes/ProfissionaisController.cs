using BarberShop.Controllers;
using BarberShop.Dominio.Entidade.Agendamentos;
using BarberShop.Dominio.Entidade.Configuracoes;
using BarberShop.Dominio.Entidade.DTOs;
using BarberShop.Dominio.Entidade.Reflection.Texto;
using BarberShop.Dominio.Interfaces.Base;
using BarberShop.Dominio.Interfaces.Servicos.Configuracoes;
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

namespace BarberShop.Areas.Configuracoes
{
    [Authorize]
    [ApiController]
    [Area("Configuracoes")]
    [Route("api/[area]/[controller]")]
    public class ProfissionaisController : BasicController
    {
        private readonly IProfissionalServicos _profissionalServicos;
        public ProfissionaisController(
            [FromServices] IWebHostEnvironment environment,
            IHttpContextAccessor context,
            IConfiguration configuration,
            SignInManager<IdentityUser> signInManager,
            UserManager<IdentityUser> userManager,
            RoleManager<IdentityRole> roleManager,
            IProfissionalServicos profissionalServicos,
            IPrincipal principal,
            IUser? user,
            IStoreRoles storeRoles) : base(environment, Policy.Profissional, context, configuration, signInManager, userManager, roleManager, principal, user, storeRoles)
        { _profissionalServicos = profissionalServicos;  }



        [HttpPost("alterar-profissionais")]
        public async Task<JsonResult> AlterarProfissional(Profissional dados)
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

                var _result = await _profissionalServicos.AlterarProfissional(dados).ConfigureAwait(false);

                return await ResponseJson(ResponseJsonTypes.Success);
            }
            catch (TratamentoExcecao e) { return await ResponseJson(ResponseJsonTypes.Error, e.Message); }
            catch (Exception ex) { return await ResponseJson(ResponseJsonTypes.Error, ex.Message); }
        }

        [HttpPut("alterar-status-profissionais/{id}")]
        public async Task<JsonResult> AlterarStatusProfissional(long id, [FromBody] int status)
        {
            try
            {

                var _result = await _profissionalServicos.AlterarStatusProfissional(id, status).ConfigureAwait(false);

                return await ResponseJson(ResponseJsonTypes.Success);
            }
            catch (TratamentoExcecao e) { return await ResponseJson(ResponseJsonTypes.Error, e.Message); }
            catch (Exception ex) { return await ResponseJson(ResponseJsonTypes.Error, ex.Message); }
        }



        [HttpGet("carregarcombo-profissionais")]
        public async Task<IActionResult> CarregarComboProfissionais(string? search, int? page)
        {
            try
            {
                var _page = page ?? 1;
                var _message = "";
                var _type = ResponseJsonTypes.Success;
                var _result = await _profissionalServicos.CarregarComboProfissionais(search ?? "", _page);
                var _return = await ResponseJson(_type, _message, _result, _result.Count()).ConfigureAwait(false);

                return await Task.FromResult(_return).ConfigureAwait(false);
            }
            catch (TratamentoExcecao e) { return await ResponseJson(ResponseJsonTypes.Error, e.Message); }
            catch (Exception ex) { return await ResponseJson(ResponseJsonTypes.Error, ex.Message); }

        }


        [HttpPost("carregargrid-profissionais")]
        public async Task<IActionResult> CarregarGridProfissionais(DataTableSearch? search = null, int start = 0, int length = 0, int draw = 0)
        {
            try
            {
                search ??= new DataTableSearch
                {
                    value = "",
                };

                var _result = Json(await _profissionalServicos.CarregarGridProfissionais(search, start, draw, length), new JsonSerializerOptions() { PropertyNameCaseInsensitive = true });
                var _return = await ResponseJson(ResponseJsonTypes.Success, "", _result).ConfigureAwait(false);

                return await Task.FromResult(_result).ConfigureAwait(false);

            }
            catch (TratamentoExcecao e) { return await ResponseJson(ResponseJsonTypes.Error, e.Message); }
            catch (Exception ex) { return await ResponseJson(ResponseJsonTypes.Error, ex.Message); }
        }

        [HttpPost("editar-profissionais")]
        public async Task<JsonResult> Editar(long idItem)
        {
            try
            {
                var _result = await _profissionalServicos.Editar(idItem);
                var _return = await ResponseJson(ResponseJsonTypes.Success, "", _result).ConfigureAwait(false);

                return await Task.FromResult(_return).ConfigureAwait(false);
            }
            catch (TratamentoExcecao e) { return await ResponseJson(ResponseJsonTypes.Error, e.Message); }
            catch (Exception ex) { return await ResponseJson(ResponseJsonTypes.Error, ex.Message); }
        }



    }
}
