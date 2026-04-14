using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Principal;
using System.Text.Json;
using BarberShop.Dominio.Interfaces.Servicos.Acessos;
using BarberShop.Dominio.Interfaces.Base;
using BarberShop.Controllers;
using static BarberShop.Dominio.Enuns.IGroupPolicies;
using static BarberShop.Dominio.Enuns.IResponseController;
using BarberShop.Dominio.Entidade.Reflection.Texto;
using BarberShop.Dominio.Entidade.DTOs;

namespace Orcamentos.Areas.Acessos
{
    [Authorize]
    [ApiController]
    [Area("Acessos")]
    [Route("api/[area]/[controller]")]
    public class PerfilController : BasicController
    {
        private readonly IPerfilServicos _perfilServicos;
        public PerfilController(
            [FromServices] IWebHostEnvironment environment,
            IHttpContextAccessor context,
            IConfiguration configuration,
            SignInManager<IdentityUser> signInManager,
            UserManager<IdentityUser> userManager,
            RoleManager<IdentityRole> roleManager,
            IPerfilServicos perfilServicos,
            IPrincipal principal,
            IUser? user,
            IStoreRoles storeRoles) : base(environment, Policy.Desenvolvedor, context, configuration, signInManager, userManager, roleManager, principal, user, storeRoles)
        { _perfilServicos = perfilServicos; }


        [HttpGet("teste-padrao")]
        public async Task<IActionResult> TestarRotaPadrao()
        {
            try
            {
                // Usando a estrutura base que você já construiu!
                //return await ResponseJson(IResponseController.ResponseJsonTypes.Success,);
                var _result = "A arquitetura nova está rodando lisa!";
                return await ResponseJson(ResponseJsonTypes.Success, "", _result);
            }
            catch (TratamentoExcecao e) { return await ResponseJson(ResponseJsonTypes.Error, e.Message); }
            catch (Exception ex) { return await ResponseJson(ResponseJsonTypes.Error, ex.Message); }

           
        }


        [HttpGet("carregarcombo-perfils")]
        public async Task<IActionResult> CarregarComboPerfils(string? search, int? page)
        {
            try
            {
                var _page = page ?? 1;
                var _message = "";
                var _type = ResponseJsonTypes.Success;
                var _result = await _perfilServicos.CarregarComboPerfils(search ?? "", _page);
                var _return = await ResponseJson(_type, _message, _result, _result.Count()).ConfigureAwait(false);

                return await Task.FromResult(_return).ConfigureAwait(false);
            }
            catch (TratamentoExcecao e) { return await ResponseJson(ResponseJsonTypes.Error, e.Message); }
            catch (Exception ex) { return await ResponseJson(ResponseJsonTypes.Error, ex.Message); }

        }

        [HttpPost("carregargrid-perfils")]
        public async Task<IActionResult> CarregarGridPerfils(DataTableSearch? search = null, int start = 0, int length = 0, int draw = 0)
        {
            try
            {
                search ??= new DataTableSearch
                {
                    value = "",
                };


                var _result = Json(await _perfilServicos.CarregarGridPerfils(search, start, draw, length), new JsonSerializerOptions() { PropertyNameCaseInsensitive = true });
                var _return = await ResponseJson(ResponseJsonTypes.Success, "", _result).ConfigureAwait(false);

                return await Task.FromResult(_result).ConfigureAwait(false);

            }
            catch (TratamentoExcecao e) { return await ResponseJson(ResponseJsonTypes.Error, e.Message); }
            catch (Exception ex) { return await ResponseJson(ResponseJsonTypes.Error, ex.Message); }

        }

        [HttpPost("editar-perfil")]
        public async Task<JsonResult> Editar(long idItem)
        {
            try
            {
                var _result = await _perfilServicos.Editar(idItem);
                var _return = await ResponseJson(ResponseJsonTypes.Success, "", _result).ConfigureAwait(false);

                return await Task.FromResult(_return).ConfigureAwait(false);
            }
            catch (TratamentoExcecao e) { return await ResponseJson(ResponseJsonTypes.Error, e.Message); }
            catch (Exception ex) { return await ResponseJson(ResponseJsonTypes.Error, ex.Message); }
        }




    }
}
