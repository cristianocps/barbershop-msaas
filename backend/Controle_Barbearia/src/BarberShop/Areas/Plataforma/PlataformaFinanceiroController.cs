using BarberShop.Controllers;
using BarberShop.Dominio.Entidade.Plataforma.DTOs;
using BarberShop.Dominio.Entidade.Reflection.Texto;
using BarberShop.Dominio.Interfaces.Base;
using BarberShop.Dominio.Interfaces.Servicos.Plataforma;
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
    public class PlataformaFinanceiroController : BasicController
    {
        private readonly IPlataformaAssinaturaServicos _assinaturaServicos;

        public PlataformaFinanceiroController(
            [FromServices] IWebHostEnvironment environment,
            IHttpContextAccessor context,
            IConfiguration configuration,
            SignInManager<IdentityUser> signInManager,
            UserManager<IdentityUser> userManager,
            RoleManager<IdentityRole> roleManager,
            IPlataformaAssinaturaServicos assinaturaServicos,
            IPrincipal principal,
            IUser? user,
            IStoreRoles storeRoles) : base(environment, Policy.Desenvolvedor, context, configuration, signInManager, userManager, roleManager, principal, user, storeRoles)
        {
            _assinaturaServicos = assinaturaServicos;
        }

        [HttpGet("empresas")]
        public async Task<IActionResult> ListarEmpresas([FromQuery] string? status = null)
        {
            try
            {
                var result = await _assinaturaServicos.ListarEmpresasAsync(status).ConfigureAwait(false);
                return await ResponseJson(ResponseJsonTypes.Success, "", result).ConfigureAwait(false);
            }
            catch (TratamentoExcecao e) { return await ResponseJson(ResponseJsonTypes.Error, e.Message); }
            catch (Exception ex) { return await ResponseJson(ResponseJsonTypes.Error, ex.Message); }
        }

        [HttpGet("empresas/{idEmpresa}/cobrancas")]
        public async Task<IActionResult> ListarCobrancas(long idEmpresa)
        {
            try
            {
                var result = await _assinaturaServicos.ListarCobrancasAsync(idEmpresa).ConfigureAwait(false);
                return await ResponseJson(ResponseJsonTypes.Success, "", result).ConfigureAwait(false);
            }
            catch (TratamentoExcecao e) { return await ResponseJson(ResponseJsonTypes.Error, e.Message); }
            catch (Exception ex) { return await ResponseJson(ResponseJsonTypes.Error, ex.Message); }
        }

        [HttpPut("empresas/{idEmpresa}")]
        public async Task<IActionResult> AtualizarAssinatura(long idEmpresa, [FromBody] PlataformaAssinaturaOverrideDTO dados)
        {
            try
            {
                await _assinaturaServicos.AplicarOverrideAsync(idEmpresa, dados).ConfigureAwait(false);
                var status = await _assinaturaServicos.ObterStatusAsync(idEmpresa).ConfigureAwait(false);
                return await ResponseJson(ResponseJsonTypes.Success, "Assinatura atualizada.", status).ConfigureAwait(false);
            }
            catch (TratamentoExcecao e) { return await ResponseJson(ResponseJsonTypes.Error, e.Message); }
            catch (Exception ex) { return await ResponseJson(ResponseJsonTypes.Error, ex.Message); }
        }

        [HttpPost("empresas/{idEmpresa}/gerar-link")]
        public async Task<IActionResult> GerarLinkParaEmpresa(long idEmpresa)
        {
            try
            {
                var result = await _assinaturaServicos.GerarLinkPagamentoAsync(idEmpresa).ConfigureAwait(false);
                return await ResponseJson(ResponseJsonTypes.Success, "", result).ConfigureAwait(false);
            }
            catch (TratamentoExcecao e) { return await ResponseJson(ResponseJsonTypes.Error, e.Message); }
            catch (Exception ex) { return await ResponseJson(ResponseJsonTypes.Error, ex.Message); }
        }
    }
}
