using BarberShop.Controllers;
using BarberShop.Dominio.Entidade.DTOs;
using BarberShop.Dominio.Entidade.Reflection.Texto;
using BarberShop.Dominio.Interfaces.Base;
using BarberShop.Dominio.Interfaces.Servicos.Configuracoes;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Principal;
using static BarberShop.Dominio.Enuns.IGroupPolicies;
using static BarberShop.Dominio.Enuns.IResponseController;

namespace BarberShop.Areas.Configuracoes
{
    /// <summary>Configuração Infinite Pay da empresa (loja) logada.</summary>
    [Authorize]
    [ApiController]
    [Area("Configuracoes")]
    [Route("api/[area]/[controller]")]
    public class InfinitePayConfigController : BasicController
    {
        private readonly IEmpresaServicos _empresaServicos;

        public InfinitePayConfigController(
            [FromServices] IWebHostEnvironment environment,
            IHttpContextAccessor context,
            IConfiguration configuration,
            SignInManager<IdentityUser> signInManager,
            UserManager<IdentityUser> userManager,
            RoleManager<IdentityRole> roleManager,
            IEmpresaServicos empresaServicos,
            IPrincipal principal,
            IUser? user,
            IStoreRoles storeRoles) : base(environment, Policy.Gerente, context, configuration, signInManager, userManager, roleManager, principal, user, storeRoles)
        {
            _empresaServicos = empresaServicos;
        }

        [HttpGet]
        public async Task<JsonResult> Obter()
        {
            try
            {
                var idEmpresa = Identidade.IdEmpresaLogado ?? 0;
                if (idEmpresa <= 0)
                    throw new TratamentoExcecao("Empresa não identificada na sessão.");

                var config = await _empresaServicos.ObterInfinitePayConfigAsync(idEmpresa).ConfigureAwait(false);
                return await ResponseJson(ResponseJsonTypes.Success, "", config).ConfigureAwait(false);
            }
            catch (TratamentoExcecao e) { return await ResponseJson(ResponseJsonTypes.Error, e.Message); }
            catch (Exception ex) { return await ResponseJson(ResponseJsonTypes.Error, ex.Message); }
        }

        [HttpPut]
        public async Task<JsonResult> Salvar([FromBody] SalvarEmpresaInfinitePayConfigDTO dados)
        {
            try
            {
                if (dados == null)
                    throw new TratamentoExcecao("Dados inválidos.");

                var idEmpresa = Identidade.IdEmpresaLogado ?? 0;
                if (idEmpresa <= 0)
                    throw new TratamentoExcecao("Empresa não identificada na sessão.");

                await _empresaServicos.SalvarInfinitePayConfigAsync(idEmpresa, dados).ConfigureAwait(false);
                var config = await _empresaServicos.ObterInfinitePayConfigAsync(idEmpresa).ConfigureAwait(false);
                return await ResponseJson(ResponseJsonTypes.Success, "Configuração salva.", config).ConfigureAwait(false);
            }
            catch (TratamentoExcecao e) { return await ResponseJson(ResponseJsonTypes.Error, e.Message); }
            catch (Exception ex) { return await ResponseJson(ResponseJsonTypes.Error, ex.Message); }
        }

        [HttpPost("regenerar-secret")]
        public async Task<JsonResult> RegenerarSecret()
        {
            try
            {
                var idEmpresa = Identidade.IdEmpresaLogado ?? 0;
                if (idEmpresa <= 0)
                    throw new TratamentoExcecao("Empresa não identificada na sessão.");

                var secret = await _empresaServicos.RegenerarInfinitePayWebhookSecretAsync(idEmpresa).ConfigureAwait(false);
                return await ResponseJson(ResponseJsonTypes.Success, "Segredo regenerado.", new { webhookSecret = secret }).ConfigureAwait(false);
            }
            catch (TratamentoExcecao e) { return await ResponseJson(ResponseJsonTypes.Error, e.Message); }
            catch (Exception ex) { return await ResponseJson(ResponseJsonTypes.Error, ex.Message); }
        }
    }
}
