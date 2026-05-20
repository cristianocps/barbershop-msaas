using BarberShop.Controllers;
using BarberShop.Dominio.Interfaces.Base;
using BarberShop.Dominio.Interfaces.Servicos.Acessos;
using BarberShop.Dominio.Interfaces.Servicos.Agendamentos;
using BarberShop.Dominio.Entidade.Reflection.Texto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Globalization;
using System.Security.Principal;
using static BarberShop.Dominio.Enuns.IGroupPolicies;
using static BarberShop.Dominio.Enuns.IResponseController;

namespace BarberShop.Areas.Agendamentos
{
    [Authorize]
    [ApiController]
    [Area("Agendamentos")]
    [Route("api/[area]/[controller]")]
    public class FinanceiroController : BasicController
    {
        private readonly IFinanceiroServicos _financeiroServicos;

        public FinanceiroController(
            [FromServices] IWebHostEnvironment environment,
            IHttpContextAccessor context,
            IConfiguration configuration,
            SignInManager<IdentityUser> signInManager,
            UserManager<IdentityUser> userManager,
            RoleManager<IdentityRole> roleManager,
            IFinanceiroServicos financeiroServicos,
            IPrincipal principal,
            IUser? user,
            IStoreRoles storeRoles) : base(environment, Policy.Gerente, context, configuration, signInManager, userManager, roleManager, principal, user, storeRoles)
        {
            _financeiroServicos = financeiroServicos;
        }

        [HttpGet("resumo")]
        public async Task<JsonResult> Resumo([FromQuery] DateTime inicio, [FromQuery] DateTime fim, [FromQuery] long? idProfissional = null, [FromQuery] int? tipoPagamento = null)
        {
            try
            {
                var result = await _financeiroServicos.ObterResumoAsync(inicio, fim, idProfissional, tipoPagamento).ConfigureAwait(false);
                return await ResponseJson(ResponseJsonTypes.Success, "", result).ConfigureAwait(false);
            }
            catch (TratamentoExcecao e) { return await ResponseJson(ResponseJsonTypes.Error, e.Message); }
            catch (Exception ex) { return await ResponseJson(ResponseJsonTypes.Error, ex.Message); }
        }

        [HttpGet("lancamentos")]
        public async Task<JsonResult> Lancamentos([FromQuery] DateTime inicio, [FromQuery] DateTime fim, [FromQuery] long? idProfissional = null, [FromQuery] int? tipoPagamento = null)
        {
            try
            {
                var result = await _financeiroServicos.ObterLancamentosAsync(inicio, fim, idProfissional, tipoPagamento).ConfigureAwait(false);
                return await ResponseJson(ResponseJsonTypes.Success, "", result).ConfigureAwait(false);
            }
            catch (TratamentoExcecao e) { return await ResponseJson(ResponseJsonTypes.Error, e.Message); }
            catch (Exception ex) { return await ResponseJson(ResponseJsonTypes.Error, ex.Message); }
        }
    }
}
