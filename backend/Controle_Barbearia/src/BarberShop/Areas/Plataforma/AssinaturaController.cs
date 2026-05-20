using BarberShop.Controllers;
using BarberShop.Dominio.Entidade.Plataforma.DTOs;
using BarberShop.Dominio.Entidade.Reflection.Texto;
using BarberShop.Dominio.Interfaces.Base;
using BarberShop.Dominio.Interfaces.Servicos.Plataforma;
using BarberShop.Infraestrutura.padronizar;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Principal;
using static BarberShop.Dominio.Enuns.IGroupPolicies;
using static BarberShop.Dominio.Enuns.IResponseController;

namespace BarberShop.Areas.Plataforma
{
    [Authorize]
    [ApiController]
    [Area("Plataforma")]
    [Route("api/[area]/[controller]")]
    public class AssinaturaController : BasicController
    {
        private readonly IPlataformaAssinaturaServicos _assinaturaServicos;

        public AssinaturaController(
            [FromServices] IWebHostEnvironment environment,
            IHttpContextAccessor context,
            IConfiguration configuration,
            SignInManager<IdentityUser> signInManager,
            UserManager<IdentityUser> userManager,
            RoleManager<IdentityRole> roleManager,
            IPlataformaAssinaturaServicos assinaturaServicos,
            IPrincipal principal,
            IUser? user,
            IStoreRoles storeRoles) : base(environment, Policy.Gerente, context, configuration, signInManager, userManager, roleManager, principal, user, storeRoles)
        {
            _assinaturaServicos = assinaturaServicos;
        }

        [HttpGet("status")]
        public async Task<IActionResult> Status()
        {
            try
            {
                var result = await _assinaturaServicos.ObterStatusAsync().ConfigureAwait(false);
                return await ResponseJson(ResponseJsonTypes.Success, "", result).ConfigureAwait(false);
            }
            catch (TratamentoExcecao e) { return await ResponseJson(ResponseJsonTypes.Error, e.Message); }
            catch (Exception ex) { return await ResponseJson(ResponseJsonTypes.Error, ex.Message); }
        }

        [HttpPost("gerar-link")]
        public async Task<IActionResult> GerarLink()
        {
            try
            {
                var result = await _assinaturaServicos.GerarLinkPagamentoAsync().ConfigureAwait(false);
                return await ResponseJson(ResponseJsonTypes.Success, "", result).ConfigureAwait(false);
            }
            catch (TratamentoExcecao e) { return await ResponseJson(ResponseJsonTypes.Error, e.Message); }
            catch (Exception ex) { return await ResponseJson(ResponseJsonTypes.Error, ex.Message); }
        }
    }
}
