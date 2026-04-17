using BarberShop.Controllers;
using BarberShop.Dominio.Entidade.Basico;
using BarberShop.Dominio.Entidade.DTOs;
using BarberShop.Dominio.Entidade.Reflection.Texto;
using BarberShop.Dominio.Interfaces.Base;
using BarberShop.Dominio.Interfaces.Servicos.Agendamentos;
using BarberShop.Dominio.Interfaces.Servicos.Basico;
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

namespace BarberShop.Areas.Basico
{
    
    [Authorize]
    [ApiController]
    [Area("Basico")]
    [Route("api/[area]/[controller]")]
    public class DadosbancariosController : BasicController
    {
        private readonly IDadosBancariosServicos _dadosBancariosServicos;
        public DadosbancariosController([FromServices] IWebHostEnvironment environment,
            IHttpContextAccessor context,
            IConfiguration configuration,
            SignInManager<IdentityUser> signInManager,
            UserManager<IdentityUser> userManager,
            RoleManager<IdentityRole> roleManager,
            IDadosBancariosServicos dadosBancariosServicos,
            IPrincipal principal,
            IUser? user,
            IStoreRoles storeRoles) : base(environment, Policy.Profissional, context, configuration, signInManager, userManager, roleManager, principal, user, storeRoles)
        { _dadosBancariosServicos = dadosBancariosServicos; }

        // ficar de standy por enquanto


        [HttpPost("alterar-dadosbancarios")]
        public async Task<JsonResult> AlterarDadosBancarios(DadosBancarios dados)
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

                var _result = await _dadosBancariosServicos.AlterarDadosBancarios(dados).ConfigureAwait(false);

                return await ResponseJson(ResponseJsonTypes.Success);
            }
            catch (TratamentoExcecao e) { return await ResponseJson(ResponseJsonTypes.Error, e.Message); }
            catch (Exception ex) { return await ResponseJson(ResponseJsonTypes.Error, ex.Message); }
        }


        [HttpPost("alterar-tipochavepix")]
        public async Task<JsonResult> AlterarTipoChavePix(TipoChave dados)
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

                var _result = await _dadosBancariosServicos.AlterarTipoChavePix(dados).ConfigureAwait(false);

                return await ResponseJson(ResponseJsonTypes.Success);
            }
            catch (TratamentoExcecao e) { return await ResponseJson(ResponseJsonTypes.Error, e.Message); }
            catch (Exception ex) { return await ResponseJson(ResponseJsonTypes.Error, ex.Message); }
        }

        [HttpPut("alterar-status-dadosbancarios/{id}")]
        public async Task<JsonResult> AlterarStatusDadosBancarios(long id, [FromBody] int status)
        {
            try
            {

                var _result = await _dadosBancariosServicos.AlterarStatusDadosBancarios(id, status).ConfigureAwait(false);

                return await ResponseJson(ResponseJsonTypes.Success);
            }
            catch (TratamentoExcecao e) { return await ResponseJson(ResponseJsonTypes.Error, e.Message); }
            catch (Exception ex) { return await ResponseJson(ResponseJsonTypes.Error, ex.Message); }
        }

        [HttpPut("alterar-status-tipochavepix/{id}")]
        public async Task<JsonResult> AlterarStatusTipoChavePix(long id, [FromBody] int status)
        {
            try
            {

                var _result = await _dadosBancariosServicos.AlterarStatusTipoChavePix(id, status).ConfigureAwait(false);

                return await ResponseJson(ResponseJsonTypes.Success);
            }
            catch (TratamentoExcecao e) { return await ResponseJson(ResponseJsonTypes.Error, e.Message); }
            catch (Exception ex) { return await ResponseJson(ResponseJsonTypes.Error, ex.Message); }
        }

        [HttpGet("carregarcombo-tipochavepix")]
        public async Task<IActionResult> CarregarComboTipoChavePix(string? search, int? page)
        {
            try
            {
                var _page = page ?? 1;
                var _message = "";
                var _type = ResponseJsonTypes.Success;
                var _result = await _dadosBancariosServicos.CarregarComboTipoChavePix(search ?? "", _page);
                var _return = await ResponseJson(_type, _message, _result, _result.Count()).ConfigureAwait(false);

                return await Task.FromResult(_return).ConfigureAwait(false);
            }
            catch (TratamentoExcecao e) { return await ResponseJson(ResponseJsonTypes.Error, e.Message); }
            catch (Exception ex) { return await ResponseJson(ResponseJsonTypes.Error, ex.Message); }

        }


        [HttpPost("carregargrid-dadosbancarios")]
        public async Task<IActionResult> CarregarGridDadosBancarios(DataTableSearch? search = null, int start = 0, int length = 0, int draw = 0)
        {
            try
            {
                search ??= new DataTableSearch
                {
                    value = "",
                };

                var _result = Json(await _dadosBancariosServicos.CarregarGridDadosBancarios(search, start, draw, length), new JsonSerializerOptions() { PropertyNameCaseInsensitive = true });
                var _return = await ResponseJson(ResponseJsonTypes.Success, "", _result).ConfigureAwait(false);

                return await Task.FromResult(_result).ConfigureAwait(false);

            }
            catch (TratamentoExcecao e) { return await ResponseJson(ResponseJsonTypes.Error, e.Message); }
            catch (Exception ex) { return await ResponseJson(ResponseJsonTypes.Error, ex.Message); }
        }


        [HttpPost("carregargrid-tipochave")]
        public async Task<IActionResult> CarregarGridTipoChave(DataTableSearch? search = null, int start = 0, int length = 0, int draw = 0)
        {
            try
            {
                search ??= new DataTableSearch
                {
                    value = "",
                };

                var _result = Json(await _dadosBancariosServicos.CarregarGridTipoChave(search, start, draw, length), new JsonSerializerOptions() { PropertyNameCaseInsensitive = true });
                var _return = await ResponseJson(ResponseJsonTypes.Success, "", _result).ConfigureAwait(false);

                return await Task.FromResult(_result).ConfigureAwait(false);

            }
            catch (TratamentoExcecao e) { return await ResponseJson(ResponseJsonTypes.Error, e.Message); }
            catch (Exception ex) { return await ResponseJson(ResponseJsonTypes.Error, ex.Message); }
        }


        [HttpPost("editar-dadosbancarios")]
        public async Task<JsonResult> Editar(long idItem)
        {
            try
            {
                var _result = await _dadosBancariosServicos.Editar(idItem);
                var _return = await ResponseJson(ResponseJsonTypes.Success, "", _result).ConfigureAwait(false);

                return await Task.FromResult(_return).ConfigureAwait(false);
            }
            catch (TratamentoExcecao e) { return await ResponseJson(ResponseJsonTypes.Error, e.Message); }
            catch (Exception ex) { return await ResponseJson(ResponseJsonTypes.Error, ex.Message); }
        }

        [HttpPost("editar-tipochavepix")]
        public async Task<JsonResult> EditarTipoChavePix(long idItem)
        {
            try
            {
                var _result = await _dadosBancariosServicos.EditarTipoChavePix(idItem);
                var _return = await ResponseJson(ResponseJsonTypes.Success, "", _result).ConfigureAwait(false);

                return await Task.FromResult(_return).ConfigureAwait(false);
            }
            catch (TratamentoExcecao e) { return await ResponseJson(ResponseJsonTypes.Error, e.Message); }
            catch (Exception ex) { return await ResponseJson(ResponseJsonTypes.Error, ex.Message); }
        }

        [HttpPost("descriptografar-chavepix")]
        public async Task<IActionResult> DescriptografarChavePix([FromBody] DescriptografarDTO dto)
        {
            try
            {
                if (dto == null || dto.Id <= 0 || string.IsNullOrEmpty(dto.Senha))
                    throw new Exception("Dados incompletos para descriptografia.");

                var decrypted = await _dadosBancariosServicos.DescriptografarChavePix(dto.Id, dto.Senha);
                return await ResponseJson(ResponseJsonTypes.Success, "Descriptografado com sucesso.", decrypted).ConfigureAwait(false);
            }
            catch (TratamentoExcecao e) { return await ResponseJson(ResponseJsonTypes.Error, e.Message); }
            catch (Exception ex) { return await ResponseJson(ResponseJsonTypes.Error, ex.Message); }
        }



    }
}
